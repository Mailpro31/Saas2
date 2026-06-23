import { describe, it, expect } from "vitest";
import { planLimits, isPro, formatLimit, PLAN_LIMITS } from "./plans";

describe("planLimits", () => {
  it("returns free limits for free plan", () => {
    expect(planLimits("free")).toEqual(PLAN_LIMITS.free);
  });

  it("returns pro limits for pro plan", () => {
    expect(planLimits("pro")).toEqual(PLAN_LIMITS.pro);
  });

  it("defaults to free for unknown/null/undefined", () => {
    expect(planLimits(null)).toEqual(PLAN_LIMITS.free);
    expect(planLimits(undefined)).toEqual(PLAN_LIMITS.free);
    expect(planLimits("enterprise")).toEqual(PLAN_LIMITS.free);
  });

  it("free is restricted, pro is unlimited", () => {
    expect(planLimits("free").maxSpaces).toBe(1);
    expect(planLimits("free").video).toBe(false);
    expect(planLimits("free").removeBranding).toBe(false);
    expect(planLimits("pro").maxSpaces).toBe(Number.POSITIVE_INFINITY);
    expect(planLimits("pro").video).toBe(true);
    expect(planLimits("pro").removeBranding).toBe(true);
  });
});

describe("isPro", () => {
  it("is true only for 'pro'", () => {
    expect(isPro("pro")).toBe(true);
    expect(isPro("free")).toBe(false);
    expect(isPro(null)).toBe(false);
    expect(isPro(undefined)).toBe(false);
  });
});

describe("formatLimit", () => {
  it("renders finite numbers as strings", () => {
    expect(formatLimit(15)).toBe("15");
  });

  it("renders Infinity as 'illimité'", () => {
    expect(formatLimit(Number.POSITIVE_INFINITY)).toBe("illimité");
  });
});
