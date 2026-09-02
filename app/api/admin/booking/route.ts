import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { BOOKING_ID, getBooking, normaliseBookingInput } from '@/lib/booking';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Verified server-side: signature, issuer, audience and the required role.
    // The middleware ahead of this only chooses redirects — it verifies nothing.
    if (!(await getAdminSession())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(await getBooking());
  } catch (error) {
    console.error('Booking fetch error:', error);
    const detail = error instanceof Error ? error.message.split('\n')[0] : String(error);
    return NextResponse.json({ error: `Failed to load — ${detail}` }, { status: 500 });
  }
}

/**
 * An upsert: there is exactly one row and it may not exist yet, so a PUT has to
 * be able to make it.
 */
export async function PUT(request: NextRequest) {
  try {
    if (!(await getAdminSession())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = normaliseBookingInput(await request.json());
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    await prisma.booking.upsert({
      where: { id: BOOKING_ID },
      update: parsed.value,
      create: { id: BOOKING_ID, ...parsed.value },
    });

    return NextResponse.json(await getBooking());
  } catch (error) {
    console.error('Booking update error:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
