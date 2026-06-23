import { describe, it, expect } from "vitest";
import { createSpaceSchema, updateSpaceSchema, slugSchema } from "./space";

describe("slugSchema", () => {
  it("accepts valid slugs", () => {
    expect(slugSchema.safeParse("ma-formation").success).toBe(true);
    expect(slugSchema.safeParse("abc").success).toBe(true);
  });

  it("rejects too short, uppercase, or special chars", () => {
    expect(slugSchema.safeParse("ab").success).toBe(false);
    expect(slugSchema.safeParse("Ma-Formation").success).toBe(false);
    expect(slugSchema.safeParse("mon espace").success).toBe(false);
  });
});

describe("createSpaceSchema", () => {
  it("accepts a name only (slug optional)", () => {
    expect(createSpaceSchema.safeParse({ name: "Ma formation" }).success).toBe(
      true,
    );
  });

  it("rejects an empty name", () => {
    expect(createSpaceSchema.safeParse({ name: "" }).success).toBe(false);
  });
});

describe("updateSpaceSchema", () => {
  const valid = {
    name: "Ma formation",
    headline: "Partagez votre avis",
    description: "",
    brand_color: "#6366f1",
    collect_rating: true,
    collect_avatar: true,
    collect_video: false,
    thank_you_message: "Merci !",
  };

  it("accepts a valid payload", () => {
    expect(updateSpaceSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an invalid hex color", () => {
    expect(
      updateSpaceSchema.safeParse({ ...valid, brand_color: "blue" }).success,
    ).toBe(false);
    expect(
      updateSpaceSchema.safeParse({ ...valid, brand_color: "#fff" }).success,
    ).toBe(false);
  });

  it("requires a headline and a thank-you message", () => {
    expect(
      updateSpaceSchema.safeParse({ ...valid, headline: "" }).success,
    ).toBe(false);
    expect(
      updateSpaceSchema.safeParse({ ...valid, thank_you_message: "" }).success,
    ).toBe(false);
  });

  it("normalizes empty description to undefined", () => {
    const res = updateSpaceSchema.safeParse(valid);
    expect(res.success).toBe(true);
    if (res.success) expect(res.data.description).toBeUndefined();
  });
});
