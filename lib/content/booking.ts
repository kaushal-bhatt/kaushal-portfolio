import { prisma } from '@/lib/db';
import { BOOKING_DEFAULTS, type BookingContent } from '@/lib/booking-content';

/**
 * The "book a call" section.
 *
 * Everything here hangs off one question: is `calendlyUrl` set? If it is not,
 * the section does not render, the navigation entry is not there, and the
 * browser never asks assets.calendly.com for anything. That is deliberately the
 * default — a fresh site has no row at all, and it is correct in that state
 * rather than showing an empty calendar.
 *
 * The shape, the defaults and `validateCalendlyUrl` live in
 * `lib/booking-content.ts`, which the client hook imports. This half touches
 * Prisma and takes `siteId` first — see `lib/site.ts`.
 */

export async function getBooking(siteId: string): Promise<BookingContent> {
  const row = await prisma.booking.findUnique({ where: { siteId } });
  if (!row) return { ...BOOKING_DEFAULTS };

  return {
    calendlyUrl: row.calendlyUrl,
    heading: row.heading,
    headingAccent: row.headingAccent,
    subtitle: row.subtitle,
  };
}

/**
 * An upsert on `siteId`: there is one row per site and it may not exist yet, so
 * a PUT has to be able to make it. It used to upsert on the literal id "main",
 * which was one row for everybody.
 */
export async function saveBooking(siteId: string, value: BookingContent) {
  await prisma.booking.upsert({
    where: { siteId },
    update: value,
    create: { siteId, ...value },
  });
  return getBooking(siteId);
}
