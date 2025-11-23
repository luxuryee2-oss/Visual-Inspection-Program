import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import {config} from './config/env.js';
import {createInspectionRouter} from './routes/inspections.js';
import {createProductRouter} from './routes/products.js';
import {createAuthRouter} from './routes/auth.js';
import {SharePointClient} from './services/sharepointClient.js';
import {logger} from './utils/logger.js';

const app = express();
const sharePointClient = new SharePointClient();

app.use(
  cors({
    origin: config.clientOrigin,
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

