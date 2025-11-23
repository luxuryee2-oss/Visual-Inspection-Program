import {ClientSecretCredential} from '@azure/identity';
import {Client} from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';
import {config} from '../config/env.js';
import {logger} from '../utils/logger.js';

async function ensureLibrary(client: Client): Promise<string> {
  const existing = await client
    .api(`/sites/${config.sharepoint.siteId}/lists`)
    .filter(`displayName eq '${config.sharepoint.libraryName}'`)
    .get();

  if (existing?.value?.length) {
    logger.info('문서 라이브러리 존재 확인');
    return existing.value[0].id;
  }

  logger.info('문서 라이브러리 생성 중...');
  const created = await client.api(`/sites/${config.sharepoint.siteId}/lists`).post({
    displayName: config.sharepoint.libraryName,
    list: {
      template: 'documentLibrary'
    }
  });

  return created.id;
}

async function ensureColumns(client: Client, listId: string): Promise<void> {
  const required = [
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

  const existing = await client.api(`/sites/${config.sharepoint.siteId}/lists/${listId}/columns`).get();
  const names = new Set(existing?.value?.map((c: any) => c.name));

  for (const column of required) {
    if (names.has(column.name)) continue;
    await client.api(`/sites/${config.sharepoint.siteId}/lists/${listId}/columns`).post(column);
    logger.info(`컬럼 추가: ${column.name}`);
  }
}

async function run(): Promise<void> {
  const credential = new ClientSecretCredential(
    config.azure.tenantId,
    config.azure.clientId,
    config.azure.clientSecret
  );

  const client = Client.initWithMiddleware({
    authProvider: {
      getAccessToken: () =>
        credential.getToken('https://graph.microsoft.com/.default').then((token) => token?.token ?? '')
    }
  });

  const listId = await ensureLibrary(client);
  await ensureColumns(client, listId);
  logger.info('SharePoint 초기화 완료');
}

run().catch((err) => {
  logger.error(err, 'SharePoint 초기화 실패');
  process.exitCode = 1;
});

