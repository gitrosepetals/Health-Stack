const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../../../server/dist/db/prisma');
const { env, EMAIL_RE } = require('../../../server/dist/lib/env');
const { withApi, methodNotAllowed } = require('../../../lib/vercel-api/cors');

module.exports = withApi(async (req, res) => {
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
      { expiresIn: env.jwtExpiresIn }
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
});
