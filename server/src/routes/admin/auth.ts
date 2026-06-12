import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { prisma } from '../../db/prisma';
import { env, EMAIL_RE } from '../../lib/env';
import { AuthRequest, requireAuth } from '../../middleware/auth';

export const adminAuthRouter = Router();

adminAuthRouter.post('/login', async (req, res) => {
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

  res.json({
    token,
    admin: { id: admin.id, email: admin.email },
  });
});

adminAuthRouter.get('/me', requireAuth, async (req: AuthRequest, res) => {
  const admin = await prisma.admin.findUnique({
    where: { id: req.admin!.sub },
    select: { id: true, email: true, createdAt: true },
  });

  if (!admin) {
    res.status(401).json({ error: 'Admin not found.' });
    return;
  }

  res.json({ admin });
});
