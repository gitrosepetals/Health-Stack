import { Router } from 'express';
import { getArticles } from '../data/articles';

export const articlesRouter = Router();

articlesRouter.get('/', (req, res) => {
  const rawLimit = parseInt(String(req.query.limit ?? '10'), 10);
  const limit = Number.isFinite(rawLimit) ? rawLimit : 10;
  res.json({ articles: getArticles(limit) });
});
