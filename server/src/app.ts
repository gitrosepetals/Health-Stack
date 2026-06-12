import express, { Express } from 'express';
import cors from 'cors';
import { env } from './lib/env';
import { subscribeRouter } from './routes/subscribe';
import { contactRouter } from './routes/contact';
import { articlesRouter } from './routes/articles';
import { adminRouter } from './routes/admin';

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  if (env.corsOrigin === '*') return true;

  const allowed = env.corsOrigin.split(',').map((s) => s.trim()).filter(Boolean);
  if (allowed.includes(origin)) return true;

  // Allow Vercel production + preview URLs automatically
  if (/^https:\/\/[\w.-]+\.vercel\.app$/.test(origin)) return true;

  return false;
}

export function createApp(): Express {
  const app = express();

  app.use(
    cors({
      origin: (origin, callback) => {
        callback(null, isAllowedOrigin(origin));
      },
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

  // Always return JSON errors (never raw objects/HTML)
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('API error:', err);
    res.status(500).json({ error: err.message || 'Internal server error.' });
  });

  return app;
}
