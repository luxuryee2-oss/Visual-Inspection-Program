import express from 'express';
import request from 'supertest';
import {jest, describe, it, expect} from '@jest/globals';
import {createInspectionRouter} from '../src/routes/inspections.js';
import type {SharePointClient, UploadResult} from '../src/services/sharepointClient.js';

const sampleBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xd9]);

function setupApp(overrides?: Partial<Record<'uploadInspection' | 'listInspections', any>>) {
  const uploadInspection = jest.fn<() => Promise<UploadResult>>().mockResolvedValue({
    inspectionId: 'test-inspection',
    folderUrl: 'https://sharepoint/site/doc',
    images: {
      front: 'front-url',
      back: 'back-url',
      left: 'left-url',
      right: 'right-url'
    }
  });
  const listInspections = jest.fn<(productCode: string) => Promise<any[]>>().mockResolvedValue([{InspectionId: 'test-inspection'}]);

  const app = express();
  const mockClient = {
    uploadInspection: overrides?.uploadInspection ?? uploadInspection,
    listInspections: overrides?.listInspections ?? listInspections
  } as unknown as SharePointClient;
  app.use('/', createInspectionRouter(mockClient));

  return {app, uploadInspection, listInspections};
}

describe('inspection routes', () => {
  it('제품 코드 누락 시 400을 반환한다', async () => {
    const {app} = setupApp();
    const response = await request(app).post('/').field('modelName', 'Pump');
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('productCode');
  });

  it('필수 이미지가 없으면 업로드를 막는다', async () => {
    const {app} = setupApp();
    const response = await request(app)
      .post('/')
      .field('productCode', 'A1')
      .attach('front', sampleBuffer, 'front.jpg');
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('이미지');
  });

  it('모든 입력이 유효하면 SharePoint 업로드를 호출한다', async () => {
    const {app, uploadInspection} = setupApp();
    const response = await request(app)
      .post('/')
      .field('productCode', 'ABC123')
      .field('modelName', 'Pump')
      .field('inspectedBy', 'lee')
      .field('notes', 'ok')
      .attach('front', sampleBuffer, 'front.jpg')
      .attach('back', sampleBuffer, 'back.jpg')
      .attach('left', sampleBuffer, 'left.jpg')
      .attach('right', sampleBuffer, 'right.jpg');

    expect(response.status).toBe(201);
    expect(uploadInspection).toHaveBeenCalledTimes(1);
    const callArgs = uploadInspection.mock.calls[0];
    expect(callArgs).toBeDefined();
    const [metadata, files] = callArgs as unknown as [any, any];
    expect(metadata.productCode).toBe('ABC123');
    expect(metadata.inspectionId).toBeDefined();
    expect(typeof metadata.inspectionId).toBe('string');
    expect(files.front).toBeDefined();
    expect(files.back).toBeDefined();
    expect(files.left).toBeDefined();
    expect(files.right).toBeDefined();
  });

  it('제품 코드로 이력을 조회한다', async () => {
    const {app, listInspections} = setupApp();
    const response = await request(app).get('/').query({productCode: 'ABC123'});
    expect(response.status).toBe(200);
    expect(listInspections).toHaveBeenCalledWith('ABC123');
    expect(response.body.items).toHaveLength(1);
  });
});



