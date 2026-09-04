/**
 * The "book a call" section's shape, defaults and validation.
 *
 * Split from the reads for the same reason `lib/site-content.ts` is split from
 * `lib/site.ts`: `hooks/use-booking.ts` is a client hook and imports the type
 * and the defaults from here. It used to import them from a module that also
 * imported Prisma, which built only because the import happened to be
 * tree-shaken — `lib/site.ts` had the identical shape and failed the build
 * outright. That was luck, and this removes the need for it.
 *
 * Nothing in this file touches a request or a database.
 */

export const BOOKING_DEFAULTS = {
  calendlyUrl: '',
  heading: 'Book',
  headingAccent: 'a Call',
  subtitle: '',
};

export type BookingContent = typeof BOOKING_DEFAULTS;

/**
 * Only a Calendly URL over https is accepted.
 *
 * This string ends up as the `data-url` of a third-party embed that runs in the
 * page, so it is not just a link — a wrong value here is a script pointed
 * somewhere unintended. The admin panel is the only writer today, but the check
 * costs nothing and does not depend on that staying true.
 *
 * Returns the reason instead when it does not pass.
 */
export function validateCalendlyUrl(value: string): string | null {
  if (!value) return null; // Empty is valid: it means "off".

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return 'That is not a URL. It should look like https://calendly.com/you/30min';
  }

  if (url.protocol !== 'https:') return 'The URL has to be https.';

  // Calendly serves embeds from calendly.com and its subdomains, and nothing
  // else should be loaded into the page from this field.
  if (url.hostname !== 'calendly.com' && !url.hostname.endsWith('.calendly.com')) {
    return 'That is not a calendly.com URL.';
  }

  return null;
}

export function normaliseBookingInput(
  input: unknown
): { ok: true; value: BookingContent } | { ok: false; error: string } {
  if (typeof input !== 'object' || input === null) {
    return { ok: false, error: 'Expected an object' };
  }

  const body = input as Record<string, unknown>;
  const str = (value: unknown, fallback: string) =>
    typeof value === 'string' && value.trim() ? value.trim() : fallback;

  const calendlyUrl = typeof body.calendlyUrl === 'string' ? body.calendlyUrl.trim() : '';
  const invalid = validateCalendlyUrl(calendlyUrl);
  if (invalid) return { ok: false, error: invalid };

  return {
    ok: true,
    value: {
      calendlyUrl,
      heading: str(body.heading, BOOKING_DEFAULTS.heading),
      headingAccent: str(body.headingAccent, BOOKING_DEFAULTS.headingAccent),
      // The one field allowed to be genuinely empty — a heading with no
      // sentence under it is a fine section.
      subtitle: typeof body.subtitle === 'string' ? body.subtitle.trim() : '',
    },
  };
}
