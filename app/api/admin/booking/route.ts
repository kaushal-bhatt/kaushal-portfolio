import { NextRequest, NextResponse } from 'next/server';
import { writerSite } from '@/lib/access';
import { normaliseBookingInput } from '@/lib/booking-content';
import { getBooking, saveBooking } from '@/lib/content/booking';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Verified server-side: signature, issuer, audience, the required role and a
    // grant on this site. The middleware ahead of this only chooses redirects —
    // it verifies nothing.
    const writer = await writerSite();
    if (!writer.ok) return writer.response;

    return NextResponse.json(await getBooking(writer.siteId));
  } catch (error) {
    console.error('Booking fetch error:', error);
    const detail = error instanceof Error ? error.message.split('\n')[0] : String(error);
    return NextResponse.json({ error: `Failed to load — ${detail}` }, { status: 500 });
  }
}

/**
 * An upsert: there is one row per site and it may not exist yet, so a PUT has
 * to be able to make it.
 */
export async function PUT(request: NextRequest) {
  try {
    const writer = await writerSite();
    if (!writer.ok) return writer.response;

    const parsed = normaliseBookingInput(await request.json());
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    return NextResponse.json(await saveBooking(writer.siteId, parsed.value));
  } catch (error) {
    console.error('Booking update error:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
