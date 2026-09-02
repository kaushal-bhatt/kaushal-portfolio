import { NextResponse } from 'next/server';
import { getBooking } from '@/lib/booking';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(await getBooking());
  } catch (error) {
    console.error('Booking fetch error:', error);
    // Not a 500: every caller of this treats "no URL" as "the section is off",
    // and a failure here should take the section away rather than break the
    // page it sits on.
    return NextResponse.json({ calendlyUrl: '', heading: '', headingAccent: '', subtitle: '' });
  }
}
