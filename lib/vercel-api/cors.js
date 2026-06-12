const { env } = require('../../server/dist/lib/env');

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (env.corsOrigin === '*') return true;

  const allowed = env.corsOrigin.split(',').map((s) => s.trim()).filter(Boolean);
  if (allowed.includes(origin)) return true;

  if (/^https:\/\/[\w.-]+\.vercel\.app$/.test(origin)) return true;

  return false;
}

function applyCors(req, res) {
  const origin = req.headers.origin;

  if (origin && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function withApi(handler) {
  return async (req, res) => {
    applyCors(req, res);

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    try {
      await handler(req, res);
    } catch (err) {
      console.error('API error:', err);
      if (!res.writableEnded) {
        res.status(500).json({
          error: err instanceof Error ? err.message : 'Internal server error.',
        });
      }
    }
  };
}

function methodNotAllowed(res, allowed) {
  res.setHeader('Allow', allowed.join(', '));
  res.status(405).json({ error: 'Method not allowed.' });
}

module.exports = { withApi, methodNotAllowed };
