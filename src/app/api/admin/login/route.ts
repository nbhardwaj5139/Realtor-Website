import { NextResponse } from 'next/server';
import { loginSchema } from '@/lib/schemas';
import {
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
  verifyPassword,
} from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const limited = checkRateLimit(request, 'admin-login');
  if (limited) return limited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Enter the team password' }, { status: 422 });
  }

  if (!verifyPassword(parsed.data.password)) {
    return NextResponse.json({ error: 'That password is incorrect' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, createSessionToken(), sessionCookieOptions);
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, '', { ...sessionCookieOptions, maxAge: 0 });
  return response;
}
