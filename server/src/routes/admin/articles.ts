import { Router } from 'express';
import { prisma } from '../../db/prisma';
import { serializeArticle } from '../../lib/serialize';
import { AuthRequest, requireAuth } from '../../middleware/auth';

export const adminArticlesRouter = Router();

adminArticlesRouter.use(requireAuth);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

adminArticlesRouter.get('/', async (req, res) => {
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const articles = await prisma.article.findMany({
    where: status ? { status } : undefined,
    orderBy: { publishedAt: 'desc' },
  });
  res.json({ articles: articles.map(serializeArticle) });
});

function paramId(req: { params: { id?: string | string[] } }): string {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : (id ?? '');
}

adminArticlesRouter.get('/:id', async (req, res) => {
  const id = paramId(req);
  const article = await prisma.article.findFirst({
    where: { OR: [{ id }, { slug: id }] },
  });

  if (!article) {
    res.status(404).json({ error: 'Article not found.' });
    return;
  }

  res.json({ article: serializeArticle(article) });
});

adminArticlesRouter.post('/', async (req: AuthRequest, res) => {
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
});

adminArticlesRouter.put('/:id', async (req: AuthRequest, res) => {
  const id = paramId(req);
  const existing = await prisma.article.findFirst({
    where: { OR: [{ id }, { slug: id }] },
  });

  if (!existing) {
    res.status(404).json({ error: 'Article not found.' });
    return;
  }

  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : existing.title;
  const summary = typeof req.body?.summary === 'string' ? req.body.summary.trim() : existing.summary;
  const category = typeof req.body?.category === 'string' ? req.body.category.trim() : existing.category;
  const url = typeof req.body?.url === 'string' ? req.body.url.trim() : existing.url;
  const status = req.body?.status === 'published' || req.body?.status === 'draft' ? req.body.status : existing.status;
  const slugInput = typeof req.body?.slug === 'string' ? req.body.slug.trim() : existing.slug;
  const publishedAt = req.body?.published_at ? new Date(req.body.published_at) : existing.publishedAt;

  if (!title || !summary || !category) {
    res.status(400).json({ error: 'Title, summary, and category are required.' });
    return;
  }

  if (slugInput !== existing.slug) {
    const conflict = await prisma.article.findUnique({ where: { slug: slugInput } });
    if (conflict) {
      res.status(409).json({ error: 'An article with this slug already exists.' });
      return;
    }
  }

  const article = await prisma.article.update({
    where: { id: existing.id },
    data: { slug: slugInput, title, summary, category, url, status, publishedAt },
  });

  res.json({ article: serializeArticle(article) });
});

adminArticlesRouter.delete('/:id', async (req: AuthRequest, res) => {
  const id = paramId(req);
  const existing = await prisma.article.findFirst({
    where: { OR: [{ id }, { slug: id }] },
  });

  if (!existing) {
    res.status(404).json({ error: 'Article not found.' });
    return;
  }

  await prisma.article.delete({ where: { id: existing.id } });
  res.json({ message: 'Article deleted.' });
});
