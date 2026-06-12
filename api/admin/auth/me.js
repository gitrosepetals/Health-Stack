const { prisma } = require('../../../server/dist/db/prisma');
const { AuthError, requireAuth } = require('../../../lib/vercel-api/auth');
const { withApi, methodNotAllowed } = require('../../../lib/vercel-api/cors');

module.exports = withApi(async (req, res) => {
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
});
