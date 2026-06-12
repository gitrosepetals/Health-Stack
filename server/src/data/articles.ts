export interface Article {
  id: string;
  category: string;
  title: string;
  summary: string;
  url: string;
  published_at: string;
}

export const ARTICLES: Article[] = [
  {
    id: 'ambient-clinical-ai',
    category: 'Health Tech',
    title: 'Why ambient clinical AI just crossed the adoption chasm',
    summary:
      "Three health systems went live in Q1. Here's what changed in procurement, liability, and clinician buy-in — and what it means for the next wave of deployments.",
    url: '#',
    published_at: '2026-06-05',
  },
  {
    id: 'cms-prior-auth',
    category: 'Policy',
    title: "CMS's new prior-auth rule: what operators need to know",
    summary:
      'The 72-hour mandate hits July 1. We mapped compliance gaps for mid-size provider groups still on legacy workflows.',
    url: '#',
    published_at: '2026-05-29',
  },
  {
    id: 'biotech-q1-charts',
    category: 'Markets',
    title: "Biotech Q1 in 6 charts: who's funding, who's folding",
    summary:
      'Series A volume held steady while crossover rounds dried up. The therapeutic areas still pulling term sheets.',
    url: '#',
    published_at: '2026-05-22',
  },
];

export function getArticles(limit = 10): Article[] {
  const capped = Math.min(Math.max(limit, 1), 50);
  return [...ARTICLES].sort((a, b) => b.published_at.localeCompare(a.published_at)).slice(0, capped);
}
