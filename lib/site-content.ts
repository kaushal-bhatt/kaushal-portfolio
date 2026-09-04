/**
 * The site's shape, its defaults and its accent lookup.
 *
 * Split from `lib/site.ts` because the admin form and the `useSite` hook are
 * client components: importing the module that reads `next/headers` and Prisma
 * pulls the server runtime into the browser bundle, and Next refuses to build
 * it. Nothing in this file touches a request or a database.
 */

/**
 * The accent gradient, as keys.
 *
 * Tailwind decides what CSS to emit by reading source files, and it never reads
 * the database. A column holding `from-blue-400 via-purple-500` would name
 * classes that were purged at build time — every heading would render as plain
 * transparent text and nothing would look obviously broken. So the database
 * stores a key, and the gradients themselves live in `app/globals.css` where
 * `@apply` forces them to be generated.
 *
 * Same reasoning as `lib/about-visuals.ts`, which exists for exactly this bug.
 */
export const ACCENTS: Record<string, string> = {
  blue: 'accent-blue',
  emerald: 'accent-emerald',
  violet: 'accent-violet',
  amber: 'accent-amber',
  rose: 'accent-rose',
};

export const ACCENT_NAMES = Object.keys(ACCENTS);

/** Falls back rather than rendering an unstyled heading. */
export function accentClass(name: string | null | undefined): string {
  return ACCENTS[name ?? ''] ?? ACCENTS.blue;
}

/**
 * What renders before the fetch resolves, and what a fresh database starts
 * from.
 *
 * Deliberately generic rather than a copy of the real content: a template
 * someone forgets to finish is worse than a blank one, because it looks
 * finished. The one exception is the labels that are pure UI ("View My Work"),
 * which are the same for anybody.
 */
export const SITE_DEFAULTS = {
  host: '',
  fullName: '',
  headline: '',
  locationLine: '',
  navBrand: '',

  heroGreeting: "Hi, I'm",
  heroIntro: '',
  primaryCtaLabel: 'View My Work',
  demoUrl: '',
  demoLabel: '',

  email: '',
  linkedinUrl: '',
  githubUrl: '',

  footerTagline: '',

  experienceHeading: 'Professional',
  experienceHeadingAccent: 'Experience',
  experienceSubtitle: '',

  projectsHeading: 'My',
  projectsHeadingAccent: 'Portfolio',
  projectsSubtitle: '',

  blogHeading: 'Technical',
  blogHeadingAccent: 'Blog',
  blogSubtitle: '',

  blogPageHeading: 'Technical',
  blogPageHeadingAccent: 'Blog',
  blogPageSubtitle: '',

  contactHeading: '',
  contactSubtitle: '',

  metaTitle: '',
  metaDescription: '',
  metaKeywords: [] as string[],
  ogImageUrl: '',

  accent: 'blue',
};

export type SiteContent = typeof SITE_DEFAULTS;

// ---------------------------------------------------------------------------
// Writing
// ---------------------------------------------------------------------------

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function optionalUrl(value: string, label: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return `${label} must be an http(s) URL.`;
    }
  } catch {
    return `${label} is not a URL.`;
  }
  return null;
}

/**
 * Narrows and validates the admin form's payload.
 *
 * Returns the reason instead when something required is missing. Only two
 * fields are required: a site with no host cannot be resolved, and one with no
 * name is not a portfolio. Everything else may legitimately be empty — empty is
 * how a link or a section is switched off.
 */
export function normaliseSiteInput(
  input: unknown
): { ok: true; value: SiteContent } | { ok: false; error: string } {
  if (typeof input !== 'object' || input === null) {
    return { ok: false, error: 'Expected an object' };
  }

  const body = input as Record<string, unknown>;

  const value: SiteContent = {
    // Stored lowercase and without a port, because that is what `requestHost()`
    // compares against. "WEKT.in" typed into the form would otherwise resolve
    // to nothing and quietly serve the default site.
    host: str(body.host).toLowerCase().split(':')[0],
    fullName: str(body.fullName),
    headline: str(body.headline),
    locationLine: str(body.locationLine),
    navBrand: str(body.navBrand),

    heroGreeting: str(body.heroGreeting) || SITE_DEFAULTS.heroGreeting,
    heroIntro: str(body.heroIntro),
    primaryCtaLabel: str(body.primaryCtaLabel) || SITE_DEFAULTS.primaryCtaLabel,
    demoUrl: str(body.demoUrl),
    demoLabel: str(body.demoLabel),

    email: str(body.email),
    linkedinUrl: str(body.linkedinUrl),
    githubUrl: str(body.githubUrl),

    footerTagline: str(body.footerTagline),

    experienceHeading: str(body.experienceHeading),
    experienceHeadingAccent: str(body.experienceHeadingAccent),
    experienceSubtitle: str(body.experienceSubtitle),

    projectsHeading: str(body.projectsHeading),
    projectsHeadingAccent: str(body.projectsHeadingAccent),
    projectsSubtitle: str(body.projectsSubtitle),

    blogHeading: str(body.blogHeading),
    blogHeadingAccent: str(body.blogHeadingAccent),
    blogSubtitle: str(body.blogSubtitle),

    blogPageHeading: str(body.blogPageHeading),
    blogPageHeadingAccent: str(body.blogPageHeadingAccent),
    blogPageSubtitle: str(body.blogPageSubtitle),

    contactHeading: str(body.contactHeading),
    contactSubtitle: str(body.contactSubtitle),

    metaTitle: str(body.metaTitle),
    metaDescription: str(body.metaDescription),
    metaKeywords: Array.isArray(body.metaKeywords)
      ? body.metaKeywords.map(str).filter(Boolean)
      : [],
    ogImageUrl: str(body.ogImageUrl),

    accent: ACCENTS[str(body.accent)] ? str(body.accent) : SITE_DEFAULTS.accent,
  };

  if (!value.host) return { ok: false, error: 'Required: host' };
  if (!value.fullName) return { ok: false, error: 'Required: full name' };

  for (const [field, label] of [
    ['demoUrl', 'Demo URL'],
    ['linkedinUrl', 'LinkedIn URL'],
    ['githubUrl', 'GitHub URL'],
    ['ogImageUrl', 'OG image URL'],
  ] as const) {
    const invalid = optionalUrl(value[field], label);
    if (invalid) return { ok: false, error: invalid };
  }

  return { ok: true, value };
}
