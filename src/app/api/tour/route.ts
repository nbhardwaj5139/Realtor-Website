import { NextResponse } from 'next/server';
import { tourSchema } from '@/lib/schemas';
import { createLead } from '@/lib/leads-store';
import { handleNewLead } from '@/lib/notify';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const limited = checkRateLimit(request, 'tour');
  if (limited) return limited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = tourSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please check the form and try again', issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const data = parsed.data;
  const lead = await createLead({
    type: 'tour',
    name: data.name,
    email: data.email,
    phone: data.phone || undefined,
    message: data.message,
    source: `Tour request — ${data.listingAddress}`,
    tour: {
      listingId: data.listingId,
      listingAddress: data.listingAddress,
      preferredDate: data.preferredDate,
      preferredTime: data.preferredTime,
      tourType: data.tourType,
    },
  });

  handleNewLead(lead).catch((error) => {
    console.error('[tour] notification pipeline failed:', error);
  });

  return NextResponse.json({ ok: true, leadId: lead.id });
}
