import type { VercelRequest, VercelResponse } from '@vercel/node';
import { env } from '../server/src/lib/env';
import { withApi } from './lib/cors';

async function handler(_req: VercelRequest, res: VercelResponse): Promise<void> {
  res.status(200).json({ status: 'ok', service: 'lumen-api', env: env.nodeEnv });
}

export default withApi(handler);
