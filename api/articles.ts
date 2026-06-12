import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../server/src/db/prisma';
import { getArticles } from '../server/src/data/articles';
import { serializeArticle } from '../server/src/lib/serialize';
import { methodNotAllowed, withApi } from './lib/cors';

async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
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
}

export default withApi(handler);
