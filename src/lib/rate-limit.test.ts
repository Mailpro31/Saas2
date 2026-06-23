import { describe, it, expect } from "vitest";
import { rateLimit, clientIpFrom } from "./rate-limit";

describe("rateLimit", () => {
  it("allows up to the limit, then blocks within the window", () => {
    const key = `test-${Math.random()}`;
    expect(rateLimit(key, 3, 60_000).ok).toBe(true);
    expect(rateLimit(key, 3, 60_000).ok).toBe(true);
    expect(rateLimit(key, 3, 60_000).ok).toBe(true);
    const blocked = rateLimit(key, 3, 60_000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it("tracks keys independently", () => {
    const a = `a-${Math.random()}`;
    const b = `b-${Math.random()}`;
    expect(rateLimit(a, 1, 60_000).ok).toBe(true);
    expect(rateLimit(a, 1, 60_000).ok).toBe(false);
    // b has its own bucket.
    expect(rateLimit(b, 1, 60_000).ok).toBe(true);
  });

  it("resets after the window elapses", () => {
    const key = `win-${Math.random()}`;
    expect(rateLimit(key, 1, 1).ok).toBe(true); // 1ms window
    // Busy-wait a hair over the window.
    const start = Date.now();
    while (Date.now() - start < 3) {
      /* spin */
    }
    expect(rateLimit(key, 1, 1).ok).toBe(true);
  });
});

describe("clientIpFrom", () => {
  it("takes the first x-forwarded-for entry", () => {
    const h = new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" });
    expect(clientIpFrom(h)).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip", () => {
    const h = new Headers({ "x-real-ip": "198.51.100.9" });
    expect(clientIpFrom(h)).toBe("198.51.100.9");
  });

  it("returns 'unknown' when no IP header is present", () => {
    expect(clientIpFrom(new Headers())).toBe("unknown");
  });
});
