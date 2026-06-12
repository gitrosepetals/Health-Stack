import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../../server/src/db/prisma';
import { AuthError, requireAuth } from '../../lib/auth';
import { methodNotAllowed, withApi } from '../../lib/cors';

async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'GET') {
    methodNotAllowed(res, ['GET']);
    return;
  }

  try {
    const payload = requireAuth(req);
    const admin = await prisma.admin.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, createdAt: true },
    });

    if (!admin) {
      res.status(401).json({ error: 'Admin not found.' });
      return;
    }

    res.status(200).json({ admin });
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    throw err;
  }
}

export default withApi(handler);
