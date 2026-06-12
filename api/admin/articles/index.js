const { prisma } = require('../../../server/dist/db/prisma');
const { serializeArticle } = require('../../../server/dist/lib/serialize');
const { AuthError, requireAuth } = require('../../../lib/vercel-api/auth');
const { withApi, methodNotAllowed } = require('../../../lib/vercel-api/cors');

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

module.exports = withApi(async (req, res) => {
  try {
    requireAuth(req);
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    throw err;
  }

  if (req.method === 'GET') {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const articles = await prisma.article.findMany({
      where: status ? { status } : undefined,
      orderBy: { publishedAt: 'desc' },
    });
    res.status(200).json({ articles: articles.map(serializeArticle) });
    return;
  }

  if (req.method === 'POST') {
    const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
    const summary = typeof req.body?.summary === 'string' ? req.body.summary.trim() : '';
    const category = typeof req.body?.category === 'string' ? req.body.category.trim() : '';
    const url = typeof req.body?.url === 'string' ? req.body.url.trim() : '#';
    const status = req.body?.status === 'published' ? 'published' : 'draft';
    const slugInput = typeof req.body?.slug === 'string' ? req.body.slug.trim() : '';
    const slug = slugInput || slugify(title);
    const publishedAt = req.body?.published_at ? new Date(req.body.published_at) : new Date();

    if (!title || !summary || !category) {
      res.status(400).json({ error: 'Title, summary, and category are required.' });
      return;
    }

    const existing = await prisma.article.findUnique({ where: { slug } });
    if (existing) {
      res.status(409).json({ error: 'An article with this slug already exists.' });
      return;
    }

    const article = await prisma.article.create({
      data: { slug, title, summary, category, url, status, publishedAt },
    });

    res.status(201).json({ article: serializeArticle(article) });
    return;
  }

  methodNotAllowed(res, ['GET', 'POST']);
});
