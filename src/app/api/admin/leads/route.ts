import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { listLeads, updateLead } from '@/lib/leads-store';
import { leadUpdateSchema } from '@/lib/schemas';
import { sendCmaEmail } from '@/lib/notify';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const leads = await listLeads();
  return NextResponse.json({ leads });
}

export async function PATCH(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = leadUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid update' }, { status: 422 });
  }

  const lead = await updateLead(parsed.data.id, {
    status: parsed.data.status,
    note: parsed.data.note,
  });

  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  return NextResponse.json({ ok: true, lead });
}

/** Fires the "Send instant CMA" action from the lead inbox. */
export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { id?: string; action?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (body.action !== 'send-cma' || !body.id) {
    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  }

  const leads = await listLeads();
  const lead = leads.find((l) => l.id === body.id);
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  if (!lead.valuation) {
    return NextResponse.json(
      { error: 'This lead has no valuation attached — nothing to send.' },
      { status: 400 },
    );
  }

  try {
    await sendCmaEmail(lead);
  } catch (error) {
    console.error('[admin] CMA send failed:', error);
    return NextResponse.json({ error: 'Email provider rejected the send' }, { status: 502 });
  }

  await updateLead(lead.id, { status: 'contacted', note: 'CMA email sent' });
  return NextResponse.json({ ok: true });
}
