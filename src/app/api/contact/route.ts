import { NextResponse } from 'next/server';
import { contactSchema } from '@/lib/schemas';
import { createLead } from '@/lib/leads-store';
import { handleNewLead } from '@/lib/notify';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const limited = checkRateLimit(request, 'contact');
  if (limited) return limited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please check the form and try again', issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const data = parsed.data;
  const lead = await createLead({
    type: 'contact',
    name: data.name,
    email: data.email,
    phone: data.phone || undefined,
    message: data.message,
    source: data.source ?? 'Website contact form',
  });

  handleNewLead(lead).catch((error) => {
    console.error('[contact] notification pipeline failed:', error);
  });

  return NextResponse.json({ ok: true, leadId: lead.id });
}
