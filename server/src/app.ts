import express, { Express } from 'express';
import cors from 'cors';
import { env } from './lib/env';
import { subscribeRouter } from './routes/subscribe';
import { contactRouter } from './routes/contact';
import { articlesRouter } from './routes/articles';
import { adminRouter } from './routes/admin';

export function createApp(): Express {
  const app = express();

  app.use(
    cors({
      origin: env.corsOrigin,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'lumen-api', env: env.nodeEnv });
  });

  app.use('/api/subscribe', subscribeRouter);
  app.use('/api/contact', contactRouter);
  app.use('/api/articles', articlesRouter);
  app.use('/api/admin', adminRouter);

  return app;
}
