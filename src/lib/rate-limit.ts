import { NextResponse } from 'next/server';

/**
 * In-memory sliding-window rate limiter for the public form endpoints.
 *
 * Per-instance only — enough to stop a naive form-spam script on a single
 * server. Put a real limiter (Upstash, Vercel KV, Cloudflare) in front of this
 * before a serious traffic spike.
 */

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 8;

type Bucket = { count: number; resetAt: number };

const globalBuckets = globalThis as unknown as { __rateBuckets?: Map<string, Bucket> };
globalBuckets.__rateBuckets ??= new Map();

function clientKey(request: Request, scope: string) {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
  return `${scope}:${ip}`;
}

/** Returns a 429 response when the caller is over the limit, otherwise null. */
export function checkRateLimit(request: Request, scope: string): NextResponse | null {
  const buckets = globalBuckets.__rateBuckets as Map<string, Bucket>;
  const key = clientKey(request, scope);
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return null;
  }

  bucket.count += 1;
  if (bucket.count > MAX_REQUESTS) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    return NextResponse.json(
      { error: 'Too many requests — please wait a moment and try again.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }

  // Opportunistic cleanup so the map can't grow without bound.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (v.resetAt < now) buckets.delete(k);
    }
  }

  return null;
}
