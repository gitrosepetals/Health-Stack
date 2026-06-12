export const env = {
  port: Number(process.env.PORT) || 3001,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  beehiivApiKey: process.env.BEEHIIV_API_KEY || '',
  beehiivPubId: process.env.BEEHIIV_PUB_ID || '',
  resendApiKey: process.env.RESEND_API_KEY || '',
  contactFrom: process.env.CONTACT_FROM_EMAIL || 'hello@lumen.health',
  contactTo: process.env.CONTACT_TO_EMAIL || 'team@lumen.health',
  nodeEnv: process.env.NODE_ENV || 'development',
};

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
