/**
 * Seeds the database from prisma/seed-data.json.
 *
 * The content in that file is the real site content, exported once out of the
 * old SQLite database. Keeping it as JSON rather than a binary .db means changes
 * to the résumé show up in a diff and any host can be brought up from scratch.
 *
 * This script is NOT destructive. The previous version called deleteMany() and
 * then inserted template placeholders ("Tech Innovation Corp", "StartupXYZ"),
 * so running `npm run db:seed` on a populated database silently replaced the
 * real work history with sample data. Tables that already have rows are now
 * left alone unless SEED_FORCE=true is set.
 */
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const prisma = new PrismaClient();

type SeedData = {
  portfolio: Array<{
    company: string;
    role: string;
    startDate: string;
    endDate: string | null;
    current: boolean;
    description: string;
    technologies: string[];
    achievements: string[];
    order: number;
  }>;
  techSections: Array<{
    name: string;
    slug: string;
    description: string;
    icon: string;
    order: number;
    color: string;
  }>;
  blogPosts: Array<{
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    technology: string;
    published: boolean;
    tags: string[];
    readTime: number;
    createdAt: string | null;
  }>;
};

const force = process.env.SEED_FORCE === 'true';

/** Skip a table that already has rows, so seeding can never clobber real edits. */
async function shouldSeed(label: string, count: number): Promise<boolean> {
  if (count === 0) return true;
  if (force) {
    console.log(`⚠️  ${label}: ${count} existing row(s), SEED_FORCE=true — replacing`);
    return true;
  }
  console.log(`⏭️  ${label}: ${count} existing row(s), leaving alone (SEED_FORCE=true to replace)`);
  return false;
}

async function main() {
  const data: SeedData = JSON.parse(
    readFileSync(join(__dirname, '..', 'prisma', 'seed-data.json'), 'utf8')
  );

  // No user row is created any more. Sign-in is auth-platform's job, and this
  // database holds no accounts, no password hashes and no sessions — the blog's
  // author is a byline on the post, not a login.
  if (await shouldSeed('Portfolio', await prisma.portfolio.count())) {
    await prisma.portfolio.deleteMany();
    for (const item of data.portfolio) {
      await prisma.portfolio.create({ data: item });
    }
    console.log(`✅ Portfolio: ${data.portfolio.length} entries`);
  }

  if (await shouldSeed('TechSection', await prisma.techSection.count())) {
    for (const section of data.techSections) {
      await prisma.techSection.upsert({
        where: { slug: section.slug },
        update: section,
        create: section,
      });
    }
    console.log(`✅ TechSection: ${data.techSections.length} entries`);
  }

  if (await shouldSeed('BlogPost', await prisma.blogPost.count())) {
    for (const post of data.blogPosts) {
      const { createdAt, ...rest } = post;
      const record = {
        ...rest,
        ...(createdAt ? { createdAt: new Date(createdAt) } : {}),
      };
      await prisma.blogPost.upsert({
        where: { slug: post.slug },
        update: record,
        create: record,
      });
    }
    console.log(`✅ BlogPost: ${data.blogPosts.length} entries`);
  }

  console.log('🎉 Seeding complete');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
