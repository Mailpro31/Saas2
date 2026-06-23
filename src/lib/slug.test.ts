import { describe, it, expect } from "vitest";
import { slugify, withRandomSuffix } from "./slug";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Ma Formation Copywriting")).toBe("ma-formation-copywriting");
  });

  it("strips accents", () => {
    expect(slugify("Témoignages Élégants")).toBe("temoignages-elegants");
  });

  it("removes special characters", () => {
    expect(slugify("Acme & Co. (2026)!")).toBe("acme-co-2026");
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugify("  --Hello--  ")).toBe("hello");
  });

  it("caps length at 40 characters", () => {
    const long = "a".repeat(100);
    expect(slugify(long).length).toBeLessThanOrEqual(40);
  });

  it("falls back when result is too short", () => {
    const result = slugify("!!");
    expect(result).toMatch(/^espace-[a-z0-9]{4}$/);
  });

  it("always matches the DB slug constraint", () => {
    const inputs = ["Hi", "café", "🚀 Lancement", "A".repeat(50), "---"];
    for (const input of inputs) {
      expect(slugify(input)).toMatch(/^[a-z0-9-]{3,40}$/);
    }
  });
});

describe("withRandomSuffix", () => {
  it("appends a random suffix", () => {
    const result = withRandomSuffix("mon-espace");
    expect(result).toMatch(/^mon-espace-[a-z0-9]{4}$/);
  });

  it("stays within 40 characters", () => {
    const result = withRandomSuffix("a".repeat(40));
    expect(result.length).toBeLessThanOrEqual(40);
    expect(result).toMatch(/^[a-z0-9-]{3,40}$/);
  });
});
