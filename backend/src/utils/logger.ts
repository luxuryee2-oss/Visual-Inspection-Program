import pino from 'pino';
import {createRequire} from 'module';

const require = createRequire(import.meta.url);

let transport: pino.TransportSingleOptions | undefined;

if (process.env.NODE_ENV !== 'production') {
  try {
    const prettyPath = require.resolve('pino-pretty');
    transport = {
      target: prettyPath,
      options: {
        colorize: true,
        translateTime: 'SYS:standard'
      }
    };
  } catch {
    // pino-pretty가 없어도 동작하도록 무시
  }
}

export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport
});

