import {Router} from 'express';
import multer from 'multer';
import {nanoid} from 'nanoid';
import {SharePointClient, inspectionDirections} from '../services/sharepointClient.js';
import {logger} from '../utils/logger.js';

type MulterFile = Express.Multer.File;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
      return;
    }
    cb(new Error('이미지 파일만 업로드할 수 있습니다.'));
  }
});

export function createInspectionRouter(spClient: SharePointClient): Router {
  const router = Router();

  router.post(
    '/',
    upload.fields(inspectionDirections.map((dir) => ({name: dir, maxCount: 1}))),
    async (req, res, next) => {
      try {
        const {productCode, modelName, inspectedBy, notes} = req.body;
        if (!productCode) {
          return res.status(400).json({message: 'productCode는 필수입니다.'});
        }

        const filesField = req.files as Record<string, MulterFile[]>;
        const normalized: Partial<Record<(typeof inspectionDirections)[number], MulterFile>> = {};
        inspectionDirections.forEach((dir) => {
          const file = filesField?.[dir]?.[0];
          if (file) {
            normalized[dir] = file;
          }
        });

        const missing = inspectionDirections.filter((dir) => !normalized[dir]);
        if (missing.length) {
          return res.status(400).json({message: `${missing.join(', ')} 이미지를 모두 업로드해야 합니다.`});
        }

        const inspectionId = nanoid();
        const uploadResult = await spClient.uploadInspection(
          {
            inspectionId,
            productCode,
            modelName,
            inspectedBy,
            capturedAt: new Date().toISOString(),
            notes
          },
          normalized as Record<(typeof inspectionDirections)[number], MulterFile>
        );

        logger.info({productCode, inspectionId}, '검사 업로드 성공');
        return res.status(201).json(uploadResult);
      } catch (error) {
        logger.error({error}, '검사 업로드 실패');
        next(error);
      }
    }
  );

  router.get('/', async (req, res, next) => {
    try {
      const {productCode} = req.query;
      if (!productCode || typeof productCode !== 'string') {
        return res.status(400).json({message: 'productCode 쿼리 파라미터가 필요합니다.'});
      }
      const items = await spClient.listInspections(productCode);
      return res.json({items});
    } catch (error) {
      next(error);
    }
  });

  return router;
}

