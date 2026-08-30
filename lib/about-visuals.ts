/**
 * The icons and accent colours the About section may use.
 *
 * Both are keyed lookups rather than free text, for two different reasons.
 *
 * The colour one matters most: Tailwind decides what CSS to generate by reading
 * the source files, and it never reads the database. A column holding
 * `text-orange-400` would name a class that was purged at build time, so the
 * card would render with no colour at all and nothing would look broken until
 * someone noticed everything was grey. The class strings live here, in a file
 * Tailwind does scan (see the `lib/**` glob in tailwind.config.ts), and the
 * database stores only the key.
 *
 * The icon one is simpler: `lucide-react` exports several hundred components
 * and picking one by name at runtime would pull all of them into the bundle.
 * This is the curated list the admin dropdown offers.
 */
import {
  Activity,
  Award,
  Braces,
  Briefcase,
  Cloud,
  Code2,
  Cpu,
  Database,
  GitBranch,
  Globe,
  Layers,
  LineChart,
  Lock,
  Rocket,
  Server,
  Shield,
  Terminal,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export const ABOUT_ICONS: Record<string, LucideIcon> = {
  Activity,
  Award,
  Braces,
  Briefcase,
  Cloud,
  Code2,
  Cpu,
  Database,
  GitBranch,
  Globe,
  Layers,
  LineChart,
  Lock,
  Rocket,
  Server,
  Shield,
  Terminal,
  Users,
  Zap,
};

export const ABOUT_ICON_NAMES = Object.keys(ABOUT_ICONS);

/** Falls back rather than rendering nothing if a row names an icon that has since gone. */
export function aboutIcon(name: string | null | undefined): LucideIcon {
  return ABOUT_ICONS[name ?? ''] ?? Code2;
}

/** Written out in full — a template literal would defeat the point of the file. */
export const ABOUT_COLORS: Record<string, string> = {
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

export const ABOUT_COLOR_NAMES = Object.keys(ABOUT_COLORS);

export function aboutColor(name: string | null | undefined): string {
  return ABOUT_COLORS[name ?? ''] ?? ABOUT_COLORS.blue;
}

/**
 * Rejects an icon or colour this build cannot render.
 *
 * Both columns are keys into the maps above, and an unknown key falls back
 * silently at render time. Catching it on the way in means the admin is told the
 * value did not take, rather than saving happily and wondering why the card is
 * still blue. Returns null when there is nothing wrong.
 *
 * It lives here rather than in the route because a route file may export only
 * HTTP methods and route config — an extra exported helper fails the build.
 */
export function invalidAboutVisual(data: { icon?: string; color?: string }): string | null {
  if (data.icon && !ABOUT_ICONS[data.icon]) return `Unknown icon "${data.icon}"`;
  if (data.color && !ABOUT_COLORS[data.color]) return `Unknown colour "${data.color}"`;
  return null;
}
