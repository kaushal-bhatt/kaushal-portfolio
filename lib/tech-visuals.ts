/**
 * The icons and accent colours a blog topic may use.
 *
 * This map existed in three files — `components/blog-section.tsx`,
 * `app/blog/page.tsx` and `app/blog/technology/[slug]/page.tsx` — byte for
 * byte identical in each. Adding an icon meant remembering all three, and
 * nobody would have.
 *
 * Keys, not values, for the same reason as `lib/about-visuals.ts`: the colour
 * is a Tailwind class and Tailwind reads source rather than the database, so a
 * stored `text-orange-400` would name a class that was purged at build time.
 * `TechSection.color` used to hold a raw hex string that three components
 * fetched and none rendered — dead data, now a key that is actually used.
 */

export const TECH_ICONS: Record<string, string> = {
  Coffee: '☕',
  Leaf: '🍃',
  Database: '🗄️',
  Workflow: '⚡',
  Activity: '📊',
  Brain: '🧠',
  Cloud: '☁️',
  Cpu: '🧠',
  Lock: '🔒',
  Rocket: '🚀',
  Server: '🖥️',
  Sparkles: '✨',
  Terminal: '⌨️',
  Wrench: '🔧',
  Zap: '⚡',
  FileText: '📄',
};

export const TECH_ICON_NAMES = Object.keys(TECH_ICONS);

/** The fallback is a real icon, not an empty string — a topic always has one. */
export const DEFAULT_TECH_ICON = 'FileText';

export function techIcon(name: string | null | undefined): string {
  return TECH_ICONS[name ?? ''] ?? TECH_ICONS[DEFAULT_TECH_ICON];
}

/** Written out in full — a template literal would defeat the point of the file. */
export const TECH_COLORS: Record<string, string> = {
  blue: 'text-blue-400',
  cyan: 'text-cyan-400',
  emerald: 'text-emerald-400',
  green: 'text-green-400',
  indigo: 'text-indigo-400',
  orange: 'text-orange-400',
  pink: 'text-pink-400',
  purple: 'text-purple-400',
  red: 'text-red-400',
  teal: 'text-teal-400',
  yellow: 'text-yellow-400',
};

export const TECH_COLOR_NAMES = Object.keys(TECH_COLORS);

export const DEFAULT_TECH_COLOR = 'blue';

export function techColor(name: string | null | undefined): string {
  return TECH_COLORS[name ?? ''] ?? TECH_COLORS[DEFAULT_TECH_COLOR];
}

/**
 * Rejects an icon or colour this build cannot render, so the admin is told the
 * value did not take rather than saving happily and wondering why the topic is
 * still grey. Returns null when there is nothing wrong.
 */
export function invalidTechVisual(data: { icon?: string; color?: string }): string | null {
  if (data.icon && !TECH_ICONS[data.icon]) return `Unknown icon "${data.icon}"`;
  if (data.color && !TECH_COLORS[data.color]) return `Unknown colour "${data.color}"`;
  return null;
}

/**
 * A URL-safe slug. Shared with the résumé's version rather than a fourth copy.
 */
export function topicSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}
