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

/**
 * Extracts a best-effort client IP for rate-limit keying.
 *
 * SECURITY: a client can send any `x-forwarded-for`, and its *left-most* entry
 * is the client-supplied value — keying on it lets an attacker mint a fresh
 * bucket per request and bypass the limit. We therefore prefer `x-real-ip`
 * (set by the platform / reverse proxy to the real peer, not forgeable via the
 * request body) and otherwise take the *right-most* forwarded entry, which is
 * the one appended by the closest trusted proxy. For hard guarantees, front the
 * limiter with the platform's verified IP and a durable store (see DEPLOY.md).
 */
export function clientIpFrom(headers: Headers): string {
  const realIp = headers.get("x-real-ip");
  if (realIp?.trim()) return realIp.trim();
  const fwd = headers.get("x-forwarded-for");
  if (fwd) {
    const parts = fwd
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    return parts[parts.length - 1] || "unknown";
  }
  return "unknown";
}
