import type { VercelRequest, VercelResponse } from '@vercel/node';
import { env } from '../../server/src/lib/env';

export type ApiHandler = (req: VercelRequest, res: VercelResponse) => Promise<void> | void;

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  if (env.corsOrigin === '*') return true;

  const allowed = env.corsOrigin.split(',').map((s) => s.trim()).filter(Boolean);
  if (allowed.includes(origin)) return true;

  if (/^https:\/\/[\w.-]+\.vercel\.app$/.test(origin)) return true;

  return false;
}

function applyCors(req: VercelRequest, res: VercelResponse): void {
  const origin = req.headers.origin as string | undefined;

  if (origin && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export function withApi(handler: ApiHandler): ApiHandler {
  return async (req, res) => {
    applyCors(req, res);

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    try {
      await handler(req, res);
    } catch (err) {
      console.error('API error:', err);
      if (!res.writableEnded) {
        res.status(500).json({
          error: err instanceof Error ? err.message : 'Internal server error.',
        });
      }
    }
  };
}

export function methodNotAllowed(res: VercelResponse, allowed: string[]): void {
  res.setHeader('Allow', allowed.join(', '));
  res.status(405).json({ error: 'Method not allowed.' });
}
