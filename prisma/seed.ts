import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SEED_ARTICLES = [
  {
    slug: 'ambient-clinical-ai',
    category: 'Health Tech',
    title: 'Why ambient clinical AI just crossed the adoption chasm',
    summary:
      "Three health systems went live in Q1. Here's what changed in procurement, liability, and clinician buy-in — and what it means for the next wave of deployments.",
    url: '#',
    publishedAt: new Date('2026-06-05'),
    status: 'published',
  },
  {
    slug: 'cms-prior-auth',
    category: 'Policy',
    title: "CMS's new prior-auth rule: what operators need to know",
    summary:
      'The 72-hour mandate hits July 1. We mapped compliance gaps for mid-size provider groups still on legacy workflows.',
    url: '#',
    publishedAt: new Date('2026-05-29'),
    status: 'published',
  },
  {
    slug: 'biotech-q1-charts',
    category: 'Markets',
    title: "Biotech Q1 in 6 charts: who's funding, who's folding",
    summary:
      'Series A volume held steady while crossover rounds dried up. The therapeutic areas still pulling term sheets.',
    url: '#',
    publishedAt: new Date('2026-05-22'),
    status: 'published',
  },
];

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@lumen.health';
  const password = process.env.ADMIN_PASSWORD || 'changeme123';
  const hash = await bcrypt.hash(password, 12);

  await prisma.admin.upsert({
    where: { email },
    update: { password: hash },
    create: { email, password: hash },
  });

  for (const article of SEED_ARTICLES) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: article,
      create: article,
    });
  }

  console.log(`Seeded admin: ${email}`);
  console.log(`Seeded ${SEED_ARTICLES.length} articles`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
