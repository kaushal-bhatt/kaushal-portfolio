import { NextResponse } from 'next/server';
import { BOOKING_DEFAULTS } from '@/lib/booking-content';
import { getBooking } from '@/lib/content/booking';
import { currentSiteId } from '@/lib/site';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const siteId = await currentSiteId();
    if (!siteId) return NextResponse.json(BOOKING_DEFAULTS);

    return NextResponse.json(await getBooking(siteId));
  } catch (error) {
    console.error('Booking fetch error:', error);
    // Not a 500: every caller of this treats "no URL" as "the section is off",
    // and a failure here should take the section away rather than break the
    // page it sits on.
    return NextResponse.json({ calendlyUrl: '', heading: '', headingAccent: '', subtitle: '' });
  }
}
