import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { listingKitSchema } from '@/lib/schemas';
import { generateListingKit } from '@/lib/listing-kit';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const limited = checkRateLimit(request, 'listing-kit');
  if (limited) return limited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = listingKitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Check the listing details', issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  try {
    const kit = await generateListingKit(parsed.data);
    return NextResponse.json({ ok: true, kit });
  } catch (error) {
    console.error('[listing-kit] generation failed:', error);
    return NextResponse.json({ error: 'Could not generate the kit' }, { status: 500 });
  }
}
