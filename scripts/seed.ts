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
import { Prisma, PrismaClient } from '@prisma/client';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const prisma = new PrismaClient();

type SeedData = {
  portfolio: Array<{
    /// Explicit, unlike every other table here. `Portfolio` has no unique column
    /// other than the primary key, so an id in the fixture is the only way a
    /// re-seed and a hand-run UPDATE can be talking about the same row.
    id: string;
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
  projects: Array<{
    title: string;
    description: string;
    technologies: string[];
    demoUrl: string | null;
    githubUrl: string;
    status: string;
    category: string;
    featured: boolean;
    completionDate: string;
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
    ogImageUrl: string;
    published: boolean;
    tags: string[];
    readTime: number;
    createdAt: string | null;
  }>;
  about: {
    content: {
      heading: string;
      headingAccent: string;
      subtitle: string;
      journeyTitle: string;
      journey: string;
    };
    skills: Array<{
      category: string;
      icon: string;
      items: string[];
      color: string;
      order: number;
    }>;
    stats: Array<{
      label: string;
      description: string;
      icon: string;
      order: number;
    }>;
  };
  /**
   * The /resume records. Typed loosely on purpose: `skills`, `experience`,
   * `projects` and `education` are Json columns, and repeating their shape here
   * would put a second definition of it next to the one in lib/resume.ts that
   * the page actually reads through. That file narrows at the point of use,
   * which is where a wrong shape needs catching.
   */
  resumes: Array<{
    slug: string;
    label: string;
    published: boolean;
    order: number;
    fullName: string;
    headline: string;
    location: string;
    email: string;
    phone: string | null;
    linkedin: string;
    github: string;
    website: string;
    summary: string;
    skills: unknown;
    experience: unknown;
    projects: unknown;
    education: unknown;
    certifications: string;
    languages: string;
  }>;
  /**
   * The site itself: everything that used to be a string literal in a
   * component. `host` is what a request is matched against, so a fresh install
   * on a different domain has to change it before anything resolves.
   */
  site: {
    host: string;
    isDefault: boolean;
    [field: string]: string | string[] | boolean;
  };
  /**
   * The "book a call" section. `calendlyUrl` is empty in the fixture on
   * purpose — the URL is a live third-party endpoint and belongs in the admin
   * panel, not in a file that gets committed and read by anyone.
   */
  booking: {
    calendlyUrl: string;
    heading: string;
    headingAccent: string;
    subtitle: string;
  };
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

  // The site first, and not only because it is the frame: every other table
  // below hangs off its id. `siteId` is not optional anywhere, so there is no
  // longer a way to seed content that belongs to nobody — which is the whole
  // point of the column.
  //
  // Upserted on `host`, because that is what a request resolves against. Note
  // the guard is on this table having NO rows at all: on a deployment that
  // already serves two portfolios, seeding is not the tool for adding content
  // to one of them.
  if (await shouldSeed('Site', await prisma.site.count())) {
    const { host, ...rest } = data.site;
    await prisma.site.upsert({
      where: { host },
      update: rest as never,
      create: { host, ...rest } as never,
    });
    console.log(`✅ Site: ${host}`);
  }

  const site = await prisma.site.findUnique({
    where: { host: data.site.host },
    select: { id: true },
  });

  // Refused rather than skipped. Everything below writes into a site, and
  // carrying on without one would either throw twelve times or — worse, if the
  // column were ever nullable again — quietly create orphans.
  if (!site) {
    throw new Error(
      `No Site row for ${data.site.host}. It exists in the fixture, so this means the ` +
        `Site table already had rows for other hosts and the guard above skipped it. ` +
        `Insert the site by hand, or run with SEED_FORCE=true.`
    );
  }
  const siteId = site.id;

  // The counts below are per site, not per table. On a deployment with two
  // portfolios, "BlogPost has rows" is true the moment the other one has
  // written anything — and that is not a reason to leave this site's blog
  // unseeded.

  // No user row is created any more. Sign-in is auth-platform's job, and this
  // database holds no accounts, no password hashes and no sessions — the blog's
  // author is a byline on the post, not a login.
  if (await shouldSeed('Portfolio', await prisma.portfolio.count({ where: { siteId } }))) {
    await prisma.portfolio.deleteMany({ where: { siteId } });
    for (const item of data.portfolio) {
      await prisma.portfolio.create({ data: { siteId, ...item } });
    }
    console.log(`✅ Portfolio: ${data.portfolio.length} entries`);
  }

  if (await shouldSeed('Project', await prisma.project.count({ where: { siteId } }))) {
    // Upsert by (site, title), which is unique — so re-seeding updates a
    // project's copy rather than creating a second one. Anything no longer in
    // the fixture goes, for the same reason the other tables prune: removing a
    // project here has to remove it from the site.
    const removed = await prisma.project.deleteMany({
      where: { siteId, title: { notIn: data.projects.map((p) => p.title) } },
    });
    for (const project of data.projects) {
      await prisma.project.upsert({
        where: { siteId_title: { siteId, title: project.title } },
        update: project,
        create: { siteId, ...project },
      });
    }
    console.log(
      `✅ Project: ${data.projects.length} entries` + (removed.count ? `, ${removed.count} removed` : '')
    );
  }

  if (await shouldSeed('TechSection', await prisma.techSection.count({ where: { siteId } }))) {
    // Upsert alone would only ever add. Removing a section from the fixture has
    // to remove it from the database too, or a topic dropped here lingers in
    // production showing "0 articles" — which is exactly the state this was
    // written to clear up.
    const removed = await prisma.techSection.deleteMany({
      where: { siteId, slug: { notIn: data.techSections.map((s) => s.slug) } },
    });
    for (const section of data.techSections) {
      await prisma.techSection.upsert({
        where: { siteId_slug: { siteId, slug: section.slug } },
        update: section,
        create: { siteId, ...section },
      });
    }
    console.log(
      `✅ TechSection: ${data.techSections.length} entries` +
        (removed.count ? `, ${removed.count} removed` : '')
    );
  }

  if (await shouldSeed('BlogPost', await prisma.blogPost.count({ where: { siteId } }))) {
    // Same reasoning as above: a post replaced in the fixture gets a new slug,
    // so without this the old one stays published alongside it.
    const removedPosts = await prisma.blogPost.deleteMany({
      where: { siteId, slug: { notIn: data.blogPosts.map((p) => p.slug) } },
    });
    if (removedPosts.count) {
      console.log(`🗑️  BlogPost: ${removedPosts.count} no longer in the fixture, removed`);
    }
    for (const post of data.blogPosts) {
      const { createdAt, ...rest } = post;
      const record = {
        ...rest,
        ...(createdAt ? { createdAt: new Date(createdAt) } : {}),
      };
      await prisma.blogPost.upsert({
        where: { siteId_slug: { siteId, slug: post.slug } },
        update: record,
        create: { siteId, ...record },
      });
    }
    console.log(`✅ BlogPost: ${data.blogPosts.length} entries`);
  }

  // The About section. Guarded like everything else, so a re-seed cannot
  // overwrite copy edited in the admin panel; the upsert is on `siteId` — which
  // is what replaced the fixed id "main", one row that both portfolios would
  // otherwise have shared.
  if (await shouldSeed('AboutContent', await prisma.aboutContent.count({ where: { siteId } }))) {
    await prisma.aboutContent.upsert({
      where: { siteId },
      update: data.about.content,
      create: { siteId, ...data.about.content },
    });
    console.log('✅ AboutContent: 1 entry');
  }

  if (await shouldSeed('AboutSkill', await prisma.aboutSkill.count({ where: { siteId } }))) {
    // Prunes for the same reason TechSection does: a card dropped from the
    // fixture has to disappear from the site, and upsert alone only ever adds.
    const removed = await prisma.aboutSkill.deleteMany({
      where: { siteId, category: { notIn: data.about.skills.map((s) => s.category) } },
    });
    for (const skill of data.about.skills) {
      await prisma.aboutSkill.upsert({
        where: { siteId_category: { siteId, category: skill.category } },
        update: skill,
        create: { siteId, ...skill },
      });
    }
    console.log(
      `✅ AboutSkill: ${data.about.skills.length} entries` +
        (removed.count ? `, ${removed.count} removed` : '')
    );
  }

  if (await shouldSeed('AboutStat', await prisma.aboutStat.count({ where: { siteId } }))) {
    const removed = await prisma.aboutStat.deleteMany({
      where: { siteId, label: { notIn: data.about.stats.map((s) => s.label) } },
    });
    for (const stat of data.about.stats) {
      await prisma.aboutStat.upsert({
        where: { siteId_label: { siteId, label: stat.label } },
        update: stat,
        create: { siteId, ...stat },
      });
    }
    console.log(
      `✅ AboutStat: ${data.about.stats.length} entries` +
        (removed.count ? `, ${removed.count} removed` : '')
    );
  }

  // The résumés, upserted on the slug. Nothing is pruned here, unlike the
  // other tables: an unpublished résumé that is no longer in the fixture is the
  // history of the document, and deleting it is exactly what keeping several
  // rows was for.
  if (await shouldSeed('Resume', await prisma.resume.count({ where: { siteId } }))) {
    for (const resume of data.resumes) {
      const { skills, experience, projects, education, ...scalars } = resume;
      const record = {
        ...scalars,
        skills: skills as Prisma.InputJsonValue,
        experience: experience as Prisma.InputJsonValue,
        projects: projects as Prisma.InputJsonValue,
        education: education as Prisma.InputJsonValue,
      };
      await prisma.resume.upsert({
        where: { siteId_slug: { siteId, slug: resume.slug } },
        update: record,
        create: { siteId, ...record },
      });
    }
    console.log(`✅ Resume: ${data.resumes.length} entries`);
  }

  // The booking section, upserted on `siteId` like AboutContent. Seeding it
  // does not switch it on: the fixture carries the copy and an empty URL, and
  // an empty URL is the off position.
  if (await shouldSeed('Booking', await prisma.booking.count({ where: { siteId } }))) {
    await prisma.booking.upsert({
      where: { siteId },
      update: data.booking,
      create: { siteId, ...data.booking },
    });
    console.log('✅ Booking: 1 entry');
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
