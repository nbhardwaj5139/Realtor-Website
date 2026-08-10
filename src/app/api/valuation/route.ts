import { NextResponse } from 'next/server';
import { valuationSchema } from '@/lib/schemas';
import { estimateValue } from '@/lib/valuation';
import { createLead } from '@/lib/leads-store';
import { handleNewLead } from '@/lib/notify';
import { getNeighbourhood } from '@/lib/data';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const limited = checkRateLimit(request, 'valuation');
  if (limited) return limited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = valuationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please check the form and try again', issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const data = parsed.data;
  const estimate = estimateValue({
    neighbourhoodId: data.neighbourhoodId,
    propertyType: data.propertyType,
    beds: data.beds,
    baths: data.baths,
    sqft: data.sqft,
    renovations: data.renovations,
  });

  const lead = await createLead({
    type: 'valuation',
    name: data.name,
    email: data.email,
    phone: data.phone || undefined,
    source: 'Home valuation wizard',
    valuation: {
      address: data.address,
      neighbourhoodId: data.neighbourhoodId,
      neighbourhoodName: getNeighbourhood(data.neighbourhoodId)?.name ?? 'Waterloo Region',
      propertyType: data.propertyType,
      beds: data.beds,
      baths: data.baths,
      sqft: data.sqft ?? 0,
      renovations: data.renovations,
      estimateLow: estimate.low,
      estimateHigh: estimate.high,
      estimateMid: estimate.mid,
      timeline: data.timeline,
    },
  });

  // Email + CRM sync must never block the visitor seeing their number.
  handleNewLead(lead).catch((error) => {
    console.error('[valuation] notification pipeline failed:', error);
  });

  return NextResponse.json({ ok: true, estimate, leadId: lead.id });
}
