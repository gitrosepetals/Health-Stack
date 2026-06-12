const { prisma } = require('../server/dist/db/prisma');
const { getArticles } = require('../server/dist/data/articles');
const { serializeArticle } = require('../server/dist/lib/serialize');
const { withApi, methodNotAllowed } = require('../lib/vercel-api/cors');

module.exports = withApi(async (req, res) => {
  if (req.method !== 'GET') {
    methodNotAllowed(res, ['GET']);
    return;
  }

  const rawLimit = parseInt(String(req.query.limit ?? '10'), 10);
  const limit = Math.min(Number.isFinite(rawLimit) ? rawLimit : 10, 50);

  try {
    const articles = await prisma.article.findMany({
      where: { status: 'published' },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });

    if (articles.length > 0) {
      res.status(200).json({ articles: articles.map(serializeArticle) });
      return;
    }
  } catch (err) {
    console.error('Articles DB error:', err);
  }

  res.status(200).json({ articles: getArticles(limit) });
});
