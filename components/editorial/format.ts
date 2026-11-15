/**
 * Dates and reading time, said the same way everywhere.
 *
 * An explicit locale, because `toLocaleDateString()` with no argument follows
 * the reader's browser — the same essay was dated "05/09/2026" on the index and
 * "5 September 2026" on the article, and for a US reader the first is a
 * different day. The day-month-year order is the one an EU reader expects.
 */
export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** "4 min", or nothing when the column is empty. */
export function readingTime(minutes: number | null | undefined): string {
  return minutes ? `${minutes} min` : '';
}
