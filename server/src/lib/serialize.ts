import { Article } from '@prisma/client';

export function serializeArticle(article: Article) {
  return {
    id: article.slug,
    category: article.category,
    title: article.title,
    summary: article.summary,
    url: article.url,
    published_at: article.publishedAt.toISOString().slice(0, 10),
    status: article.status,
    slug: article.slug,
    db_id: article.id,
  };
}
