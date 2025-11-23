import {Router} from 'express';
import multer from 'multer';
import {SharePointClient} from '../services/sharepointClient.js';
import {logger} from '../utils/logger.js';
import {prisma} from '../lib/prisma.js';

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

export function createProductRouter(spClient: SharePointClient): Router {
  const router = Router();

  // 제품 정보 등록
  router.post(
    '/',
    upload.single('productImage'),
    async (req, res, next) => {
      try {
        const {uniqueCode, productCode, productName} = req.body;
        
        if (!uniqueCode || !productCode || !productName) {
          return res.status(400).json({message: 'uniqueCode, productCode, productName은 필수입니다.'});
        }

        // 중복 uniqueCode 확인
        const existingProduct = await prisma.product.findUnique({
          where: {uniqueCode}
        });

        if (existingProduct) {
          return res.status(409).json({message: '이미 존재하는 고유 코드입니다.'});
        }

        let productImageUrl: string | undefined;
        if (req.file) {
          // SharePoint에 제품 이미지 업로드
          const folderPath = `products/${uniqueCode}`;
          const fileName = `product-image.${req.file.originalname.split('.').pop() ?? 'jpg'}`;
          const remotePath = `${folderPath}/${fileName}`;
          productImageUrl = await spClient.uploadProductFile(remotePath, req.file.buffer, req.file.mimetype);
        }

        // 제품 정보 DB에 저장
        const product = await prisma.product.create({
          data: {
            uniqueCode,
            productCode,
            productName,
            imageUrl: productImageUrl
          }
        });

        logger.info({uniqueCode, productCode}, '제품 정보 등록 완료');

        return res.status(201).json({
          uniqueCode: product.uniqueCode,
          productCode: product.productCode,
          productName: product.productName,
          productImageUrl: product.imageUrl,
          createdAt: product.createdAt.toISOString()
        });
      } catch (error) {
        logger.error({error}, '제품 정보 등록 실패');
        next(error);
      }
    }
  );

  // 고유 코드로 제품 정보 조회
  router.get('/:uniqueCode', async (req, res, next) => {
    try {
      const {uniqueCode} = req.params;
      const product = await prisma.product.findUnique({
        where: {uniqueCode}
      });

      if (!product) {
        return res.status(404).json({message: '제품 정보를 찾을 수 없습니다.'});
      }

      return res.json({
        uniqueCode: product.uniqueCode,
        productCode: product.productCode,
        productName: product.productName,
        productImageUrl: product.imageUrl,
        createdAt: product.createdAt.toISOString()
      });
    } catch (error) {
      logger.error({error}, '제품 정보 조회 실패');
      next(error);
    }
  });

  // 모든 제품 목록 조회
  router.get('/', async (req, res, next) => {
    try {
      const products = await prisma.product.findMany({
        orderBy: {createdAt: 'desc'}
      });

      const items = products.map(product => ({
        uniqueCode: product.uniqueCode,
        productCode: product.productCode,
        productName: product.productName,
        productImageUrl: product.imageUrl,
        createdAt: product.createdAt.toISOString()
      }));

      return res.json({items});
    } catch (error) {
      logger.error({error}, '제품 목록 조회 실패');
      next(error);
    }
  });

  return router;
}
