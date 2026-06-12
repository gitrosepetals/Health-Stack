export const env = {
  port: Number(process.env.PORT) || 3001,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'file:./prisma/dev.db',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  beehiivApiKey: process.env.BEEHIIV_API_KEY || '',
  beehiivPubId: process.env.BEEHIIV_PUB_ID || '',
  resendApiKey: process.env.RESEND_API_KEY || '',
  contactFrom: process.env.CONTACT_FROM_EMAIL || 'hello@lumen.health',
  contactTo: process.env.CONTACT_TO_EMAIL || 'team@lumen.health',
};

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
