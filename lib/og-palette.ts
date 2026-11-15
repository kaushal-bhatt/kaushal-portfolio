/**
 * The editorial palette in hex, for the Open Graph cards.
 *
 * `next/og` renders with Satori, which does not understand `oklch()` — so the
 * tokens in app/editorial.css are converted here once, exactly, rather than
 * approximated by eye in two places. Composited tints (`ink60`, `rule`) are
 * pre-blended over paper, because a card is a flat PNG and has no "over".
 *
 * Regenerate if a token in editorial.css changes.
 */

export const OG = {
  paper: '#FAF7F1',
  paperSunk: '#F3EFE8',
  ink: '#18130E',
  ink60: '#726E69',
  rule: '#D6D2CD',
} as const;

const SIGNALS: Record<string, string> = {
  blue: '#0060C1',
  emerald: '#007F56',
  violet: '#7139CB',
  amber: '#A65700',
  rose: '#C72C4C',
};

/** Vermillion for anything this file does not know — the same default the CSS uses. */
export function ogSignal(accent: string | null | undefined): string {
  return SIGNALS[accent ?? ''] ?? '#CE3E0F';
}
