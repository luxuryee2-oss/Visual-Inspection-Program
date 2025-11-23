import {Client} from '@microsoft/microsoft-graph-client';
import {ClientSecretCredential} from '@azure/identity';
import {config} from '../config/env.js';
import {logger} from '../utils/logger.js';
import type {DriveItem, ListItem, ColumnDefinition} from '@microsoft/microsoft-graph-types';
import 'isomorphic-fetch';
import {withRetry} from '../utils/withRetry.js';

export const inspectionDirections = ['front', 'back', 'left', 'right'] as const;
export type InspectionDirection = (typeof inspectionDirections)[number];

export interface InspectionMetadata {
  inspectionId: string;
  productCode: string;
  modelName?: string;
  inspectedBy?: string;
  capturedAt: string;
  notes?: string;
}

export interface UploadResult {
  inspectionId: string;
  folderUrl: string;
  images: Record<InspectionDirection, string>;
}

type MulterFile = Express.Multer.File;
type FileMap = Record<InspectionDirection, MulterFile>;

export class SharePointClient {
  private graphClient: Client;
  private listId?: string;

  constructor() {
    const credential = new ClientSecretCredential(
      config.azure.tenantId,
      config.azure.clientId,
      config.azure.clientSecret
    );

    this.graphClient = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: () =>
          credential.getToken('https://graph.microsoft.com/.default').then((token) => token?.token ?? '')
      }
    });
  }

  private get driveRoot(): string {
    return `/sites/${config.sharepoint.siteId}/drives/${config.sharepoint.driveId}`;
  }

  private async ensureListId(): Promise<string> {
    if (this.listId) return this.listId;
    const response = await this.graphClient
      .api(`/sites/${config.sharepoint.siteId}/lists`)
      .filter(`displayName eq '${config.sharepoint.libraryName}'`)
      .get();

    if (!response?.value?.length) {
      throw new Error(`SharePoint library ${config.sharepoint.libraryName} not found`);
    }

    this.listId = response.value[0].id;
    return this.listId!;
  }

  async ensureLibraryColumns(): Promise<void> {
    const listId = await this.ensureListId();
    const desiredColumns: Array<Pick<ColumnDefinition, 'name' | 'text'>> = [
      {name: 'InspectionId', text: {allowMultipleLines: false, maxLength: 255}},
      {name: 'ProductCode', text: {allowMultipleLines: false, maxLength: 255}},
      {name: 'ModelName', text: {allowMultipleLines: false, maxLength: 255}},
      {name: 'InspectedBy', text: {allowMultipleLines: false, maxLength: 255}},
      {name: 'CapturedAt', text: {allowMultipleLines: false, maxLength: 255}},
      {name: 'Notes', text: {allowMultipleLines: true, maxLength: 1024}},
      {name: 'FrontUrl', text: {allowMultipleLines: false, maxLength: 2048}},
      {name: 'BackUrl', text: {allowMultipleLines: false, maxLength: 2048}},
      {name: 'LeftUrl', text: {allowMultipleLines: false, maxLength: 2048}},
      {name: 'RightUrl', text: {allowMultipleLines: false, maxLength: 2048}}
    ];

    const existing = await this.graphClient.api(`/sites/${config.sharepoint.siteId}/lists/${listId}/columns`).get();
    const existingNames = new Set(existing?.value?.map((c: ColumnDefinition) => c.name));

    for (const column of desiredColumns) {
      if (existingNames.has(column.name)) continue;
      await this.graphClient.api(`/sites/${config.sharepoint.siteId}/lists/${listId}/columns`).post({
        name: column.name,
        text: column.text
      });
    }
  }

  async uploadInspection(metadata: InspectionMetadata, files: FileMap): Promise<UploadResult> {
    inspectionDirections.forEach((dir) => {
      if (!files[dir]) {
        throw new Error(`Missing ${dir} image`);
      }
    });

    await this.ensureLibraryColumns();

    const folderPath = `${metadata.productCode}/${metadata.inspectionId}`;
    const folderDriveItem = await this.ensureFolder(folderPath);

    const images: Record<string, string> = {};
    for (const dir of inspectionDirections) {
      const file = files[dir];
      const extension = file.originalname.split('.').pop() ?? 'jpg';
      const remotePath = `${folderPath}/${dir}.${extension}`;
      const url = await withRetry(
        () => this.uploadFile(remotePath, file.buffer, file.mimetype),
        3,
        500
      );
      images[dir] = url;
    }

    await this.updateFolderMetadata(folderDriveItem, metadata, images as Record<InspectionDirection, string>);
    logger.info(
      {
        inspectionId: metadata.inspectionId,
        productCode: metadata.productCode,
        folderUrl: folderDriveItem.webUrl
      },
      'SharePoint 업로드 완료'
    );

    return {
      inspectionId: metadata.inspectionId,
      folderUrl: `${folderDriveItem.webUrl}`,
      images: images as Record<InspectionDirection, string>
    };
  }

  async listInspections(productCode: string, top = 20): Promise<any[]> {
    const listId = await this.ensureListId();
    const response = await this.graphClient
      .api(`/sites/${config.sharepoint.siteId}/lists/${listId}/items`)
      .expand('fields')
      .filter(`fields/ProductCode eq '${productCode}'`)
      .top(top)
      .orderby('fields/Created desc')
      .get();

    return response.value?.map((item: ListItem) => item.fields) ?? [];
  }

  private async ensureFolder(path: string): Promise<DriveItem> {
    const endpoint = `${this.driveRoot}/root:/${this.encodePath(path)}`;
    try {
      const item = await this.graphClient.api(`${endpoint}`).expand('listItem').get();
      return item;
    } catch (error: any) {
      if (error.statusCode !== 404) {
        throw error;
      }
      await this.graphClient.api(`${endpoint}`).put({
        folder: {},
        '@microsoft.graph.conflictBehavior': 'replace'
      });
      const created = await this.graphClient.api(`${endpoint}`).expand('listItem').get();
      return created;
    }
  }

  async uploadProductFile(path: string, buffer: Buffer, mimeType: string): Promise<string> {
    return this.uploadFile(path, buffer, mimeType);
  }

  private async uploadFile(path: string, buffer: Buffer, mimeType: string): Promise<string> {
    // Microsoft Graph simple upload는 4MB까지만 지원하므로 항상 업로드 세션을 사용
    const session = await this.graphClient
      .api(`${this.driveRoot}/root:/${this.encodePath(path)}:/createUploadSession`)
      .post({
        item: {
          '@microsoft.graph.conflictBehavior': 'replace',
          name: path.split('/').pop()
        }
      });

    const uploadUrl: string | undefined = session?.uploadUrl;
    if (!uploadUrl) {
      throw new Error('Upload session 생성 실패');
    }

    const chunkSize = 5 * 1024 * 1024;
    let offset = 0;

    let uploadedItem: any = null;

    while (offset < buffer.length) {
      const chunk = buffer.subarray(offset, offset + chunkSize);
      const start = offset;
      const end = offset + chunk.length - 1;
      const contentRange = `bytes ${start}-${end}/${buffer.length}`;

      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Length': String(chunk.length),
          'Content-Range': contentRange,
          'Content-Type': mimeType
        },
        body: chunk
      });

      if (!response.ok && response.status !== 202) {
        throw new Error(`파일 업로드 실패: ${response.status} ${response.statusText}`);
      }

      if (response.status === 201 || response.status === 200) {
        uploadedItem = await response.json();
        break;
      }

      offset += chunk.length;
    }

    if (!uploadedItem) {
      throw new Error('업로드 완료 응답을 받지 못했습니다.');
    }

    return uploadedItem?.webUrl;
  }

  private encodePath(path: string): string {
    return encodeURI(path).replace(/#/g, '%23');
  }

  private async updateFolderMetadata(
    folderItem: DriveItem,
    metadata: InspectionMetadata,
    images: Record<InspectionDirection, string>
  ): Promise<void> {
    const listItemId = folderItem?.listItem?.id;
    if (!listItemId) {
      logger.warn({folderItem}, 'Folder missing listItem reference, skipping metadata update');
      return;
    }
    const listId = await this.ensureListId();
    await this.graphClient
      .api(`/sites/${config.sharepoint.siteId}/lists/${listId}/items/${listItemId}/fields`)
      .patch({
        InspectionId: metadata.inspectionId,
        ProductCode: metadata.productCode,
        ModelName: metadata.modelName,
        InspectedBy: metadata.inspectedBy,
        CapturedAt: metadata.capturedAt,
        Notes: metadata.notes,
        FrontUrl: images.front,
        BackUrl: images.back,
        LeftUrl: images.left,
        RightUrl: images.right
      });
  }
}

