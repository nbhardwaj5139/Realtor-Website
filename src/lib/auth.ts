import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, SESSION_TTL_MS } from './session';

/**
 * Minimal shared-password auth for /admin.
 *
 * The session cookie is an HMAC-signed, expiring token — no database, no user
 * table. Adequate for a two-person team behind a single password; swap for
 * Supabase Auth if per-agent accounts are ever needed.
 */

export { SESSION_COOKIE };

function secret() {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    'dev-only-insecure-secret'
  );
}

function adminPassword() {
  return process.env.ADMIN_PASSWORD || 'kw-demo-2026';
}

function sign(payload: string) {
  return createHmac('sha256', secret()).update(payload).digest('hex');
}

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function verifyPassword(candidate: string) {
  return safeEqual(candidate, adminPassword());
}

export function createSessionToken() {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = `admin.${expires}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [subject, expiresRaw, signature] = parts;
  const payload = `${subject}.${expiresRaw}`;
  if (!safeEqual(signature, sign(payload))) return false;
  const expires = Number(expiresRaw);
  if (!Number.isFinite(expires) || expires < Date.now()) return false;
  return subject === 'admin';
}

export async function isAuthenticated() {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_TTL_MS / 1000,
};

/** True when the deployment is still using the built-in demo password. */
export function usingDefaultPassword() {
  return !process.env.ADMIN_PASSWORD;
}
