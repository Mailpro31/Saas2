import "server-only";

/**
 * Best-effort in-memory fixed-window rate limiter. Mitigates casual abuse of
 * the unauthenticated public endpoints (testimonial submission, media upload).
 *
 * NOTE: state is per server instance and resets on cold start. For hard
 * guarantees in production behind multiple instances, front this with a durable
 * store (Upstash Redis / Vercel KV) or the platform WAF. Documented in DEPLOY.md.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();
const MAX_KEYS = 10_000;

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; retryAfterMs: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    // Opportunistic cleanup to keep the map bounded.
    if (buckets.size > MAX_KEYS) {
      for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterMs: 0 };
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { ok: true, retryAfterMs: 0 };
}

/** Extracts a best-effort client IP from forwarded headers. */
export function clientIpFrom(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || "unknown";
  return headers.get("x-real-ip") ?? "unknown";
}
