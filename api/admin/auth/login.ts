import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { prisma } from '../../../server/src/db/prisma';
import { env, EMAIL_RE } from '../../../server/src/lib/env';
import { methodNotAllowed, withApi } from '../../lib/cors';

async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    methodNotAllowed(res, ['POST']);
    return;
  }

  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!email || !EMAIL_RE.test(email) || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }

    const token = jwt.sign(
      { sub: admin.id, email: admin.email },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'] }
    );

    res.status(200).json({
      token,
      admin: { id: admin.id, email: admin.email },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(503).json({
      error: 'Database unavailable. Check DATABASE_URL on Vercel and run db:setup.',
    });
  }
}

export default withApi(handler);
