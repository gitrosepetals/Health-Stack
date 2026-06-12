const jwt = require('jsonwebtoken');
const { env } = require('../../server/dist/lib/env');

class AuthError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

function getBearerToken(req) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice(7);
}

function requireAuth(req) {
  const token = getBearerToken(req);
  if (!token) {
    throw new AuthError('Authentication required.', 401);
  }

  try {
    return jwt.verify(token, env.jwtSecret);
  } catch {
    throw new AuthError('Invalid or expired token.', 401);
  }
}

module.exports = { AuthError, getBearerToken, requireAuth };
