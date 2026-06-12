import { Router } from 'express';
import { prisma } from '../db/prisma';
import { serializeArticle } from '../lib/serialize';
import { getArticles } from '../data/articles';

export const articlesRouter = Router();

articlesRouter.get('/', async (req, res) => {
  const rawLimit = parseInt(String(req.query.limit ?? '10'), 10);
  const limit = Math.min(Number.isFinite(rawLimit) ? rawLimit : 10, 50);

  try {
    const articles = await prisma.article.findMany({
      where: { status: 'published' },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });

    if (articles.length > 0) {
      res.json({ articles: articles.map(serializeArticle) });
      return;
    }
  } catch {
    // fall through to static data
  }

  res.json({ articles: getArticles(limit) });
});
