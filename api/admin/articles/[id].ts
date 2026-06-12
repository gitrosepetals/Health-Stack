import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../../server/src/db/prisma';
import { serializeArticle } from '../../../server/src/lib/serialize';
import { AuthError, requireAuth } from '../../../lib/vercel-api/auth';
import { methodNotAllowed, withApi } from '../../../lib/vercel-api/cors';

function paramId(req: VercelRequest): string {
  const id = req.query.id;
  return Array.isArray(id) ? id[0] : (id ?? '');
}

async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    requireAuth(req);
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    throw err;
  }

  const id = paramId(req);
  if (!id) {
    res.status(400).json({ error: 'Article id is required.' });
    return;
  }

  if (req.method === 'GET') {
    const article = await prisma.article.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!article) {
      res.status(404).json({ error: 'Article not found.' });
      return;
    }

    res.status(200).json({ article: serializeArticle(article) });
    return;
  }

  if (req.method === 'PUT') {
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
    const status =
      req.body?.status === 'published' || req.body?.status === 'draft' ? req.body.status : existing.status;
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

    res.status(200).json({ article: serializeArticle(article) });
    return;
  }

  if (req.method === 'DELETE') {
    const existing = await prisma.article.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      res.status(404).json({ error: 'Article not found.' });
      return;
    }

    await prisma.article.delete({ where: { id: existing.id } });
    res.status(200).json({ message: 'Article deleted.' });
    return;
  }

  methodNotAllowed(res, ['GET', 'PUT', 'DELETE']);
}

export default withApi(handler);
