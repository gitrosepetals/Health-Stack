import type { Express } from 'express';

function loadApp(): Express {
  // Compiled server is copied to api/_server during build:vercel so Vercel bundles it.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createApp } = require('./_server/app') as { createApp: () => Express };
  return createApp();
}

let app: Express;

try {
  app = loadApp();
} catch (err) {
  console.error('API startup failed:', err);
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const express = require('express') as typeof import('express');
  app = express();
  const message = err instanceof Error ? err.message : String(err);
  app.all('*', (_req, res) => {
    res.status(500).json({
      error: message,
      hint: 'Check Vercel function logs, DATABASE_URL, and that prisma generate ran at build time.',
    });
  });
}

export default app;
