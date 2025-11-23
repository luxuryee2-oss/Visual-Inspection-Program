export type InspectionDirection = 'front' | 'back' | 'left' | 'right';

export interface InspectionFormValues {
  productCode: string;
  modelName: string;
  inspectedBy: string;
  notes?: string;
  images: Record<InspectionDirection, File | null>;
}

export interface InspectionUploadResponse {
  inspectionId: string;
  folderUrl: string;
  images: Record<InspectionDirection, string>;
}

export interface InspectionHistoryEntry {
  InspectionId: string;
  ProductCode: string;
  ModelName?: string;
  InspectedBy?: string;
  CapturedAt?: string;
  Notes?: string;
  FrontUrl?: string;
  BackUrl?: string;
  LeftUrl?: string;
  RightUrl?: string;
}

