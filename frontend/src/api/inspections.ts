import {api} from './client';
import type {
  InspectionDirection,
  InspectionFormValues,
  InspectionHistoryEntry,
  InspectionUploadResponse
} from '../types/inspection';

export async function uploadInspection(values: InspectionFormValues): Promise<InspectionUploadResponse> {
  const form = new FormData();
  form.append('productCode', values.productCode);
  form.append('modelName', values.modelName);
  form.append('inspectedBy', values.inspectedBy);
  if (values.notes) {
    form.append('notes', values.notes);
  }

  (Object.keys(values.images) as InspectionDirection[]).forEach((direction) => {
    const file = values.images[direction];
    if (file) {
      form.append(direction, file);
    }
  });

  const {data} = await api.post<InspectionUploadResponse>('/inspections', form, {
    headers: {'Content-Type': 'multipart/form-data'}
  });
  return data;
}

export async function fetchInspectionHistory(productCode: string): Promise<InspectionHistoryEntry[]> {
  const {data} = await api.get<{items: InspectionHistoryEntry[]}>('/inspections', {
    params: {productCode}
  });
  return data.items;
}

