import type { VercelRequest } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { env } from '../../server/src/lib/env';

export interface AuthPayload {
  sub: string;
  email: string;
}

export function getBearerToken(req: VercelRequest): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice(7);
}

export function requireAuth(req: VercelRequest): AuthPayload {
  const token = getBearerToken(req);
  if (!token) {
    throw new AuthError('Authentication required.', 401);
  }

  try {
    return jwt.verify(token, env.jwtSecret) as AuthPayload;
  } catch {
    throw new AuthError('Invalid or expired token.', 401);
  }
}

export class AuthError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = 'AuthError';
  }
}
