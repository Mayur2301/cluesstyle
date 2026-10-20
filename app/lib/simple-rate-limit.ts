// app/lib/simple-rate-limit.ts
//
// Tiny in-memory limiter for abuse-prone auth endpoints (OTP send / verify).
// State lives in this Node process, which is enough for the single
// `next start` / standalone server this site runs on; if the site is ever
// scaled to several instances, move this to Redis or a DB table.

const hits = new Map<string, number[]>();

/**
 * Returns true if `key` has already used `max` attempts within `windowMs`
 * (the call is then rejected and NOT counted). Otherwise records the attempt
 * and returns false.
 */
export function isRateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);

  // Opportunistic cleanup so the map can't grow without bound.
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= windowMs)) hits.delete(k);
    }
  }
  return false;
}

export function clearRateLimit(key: string): void {
  hits.delete(key);
}

export function clientIp(headers: Headers): string {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}
