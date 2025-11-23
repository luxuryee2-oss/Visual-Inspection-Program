import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import {config} from './config/env.js';
import {createInspectionRouter} from './routes/inspections.js';
import {createProductRouter} from './routes/products.js';
import {createAuthRouter} from './routes/auth.js';
import {SharePointClient} from './services/sharepointClient.js';
import {logger} from './utils/logger.js';
import {prisma} from './lib/prisma.js';

const app = express();
const sharePointClient = new SharePointClient();

// Prisma 연결 확인
prisma.$connect()
  .then(() => {
    logger.info('Prisma 데이터베이스 연결 성공');
  })
  .catch((error) => {
    logger.error({error}, 'Prisma 데이터베이스 연결 실패');
  });

// CORS 설정: 여러 origin 지원 (쉼표로 구분)
const allowedOrigins = config.clientOrigin.split(',').map(origin => origin.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      // origin이 없거나 (같은 도메인 요청) 허용된 origin이면 통과
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn({origin, allowedOrigins}, 'CORS 차단된 origin');
        callback(new Error('CORS 정책에 의해 차단되었습니다.'));
      }
    },
    credentials: true
  })
);
app.use(express.json());

app.use('/api/auth', createAuthRouter());
app.use('/api/inspections', createInspectionRouter(sharePointClient));
app.use('/api/products', createProductRouter(sharePointClient));

app.get('/healthz', (_req, res) => {
  res.json({status: 'ok'});
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error(err, 'Unhandled error');
  const status = err.status ?? 500;
  res.status(status).json({message: err.message ?? '서버 오류', details: err.stack});
});

app.listen(config.port, () => {
  logger.info(`Server listening on http://localhost:${config.port}`);
});

