import { describe, it, expect } from "vitest";
import { submitTestimonialSchema, manualTestimonialSchema } from "./testimonial";

const validBase = {
  spaceId: "00000000-0000-0000-0000-000000000000",
  author_name: "Marie Dupont",
  content: "Une formation vraiment excellente, je recommande à 100%.",
  consent: true,
};

describe("submitTestimonialSchema", () => {
  it("accepts a valid minimal submission", () => {
    const res = submitTestimonialSchema.safeParse(validBase);
    expect(res.success).toBe(true);
  });

  it("rejects when consent is not given (RGPD)", () => {
    const res = submitTestimonialSchema.safeParse({
      ...validBase,
      consent: false,
    });
    expect(res.success).toBe(false);
  });

  it("rejects content shorter than 10 characters", () => {
    const res = submitTestimonialSchema.safeParse({
      ...validBase,
      content: "Top",
    });
    expect(res.success).toBe(false);
  });

  it("rejects an empty author name", () => {
    const res = submitTestimonialSchema.safeParse({
      ...validBase,
      author_name: "",
    });
    expect(res.success).toBe(false);
  });

  it("rejects an invalid spaceId", () => {
    const res = submitTestimonialSchema.safeParse({
      ...validBase,
      spaceId: "not-a-uuid",
    });
    expect(res.success).toBe(false);
  });

  it("coerces a numeric-string rating and enforces 1..5", () => {
    const ok = submitTestimonialSchema.safeParse({ ...validBase, rating: "5" });
    expect(ok.success).toBe(true);
    if (ok.success) expect(ok.data.rating).toBe(5);

    const tooHigh = submitTestimonialSchema.safeParse({
      ...validBase,
      rating: "6",
    });
    expect(tooHigh.success).toBe(false);
  });

  it("treats empty optional strings as undefined", () => {
    const res = submitTestimonialSchema.safeParse({
      ...validBase,
      author_email: "",
      author_role: "",
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.author_email).toBeUndefined();
      expect(res.data.author_role).toBeUndefined();
    }
  });

  it("rejects an invalid email when provided", () => {
    const res = submitTestimonialSchema.safeParse({
      ...validBase,
      author_email: "bad-email",
    });
    expect(res.success).toBe(false);
  });

  it("allows a filled honeypot to pass validation (handled in the action)", () => {
    const res = submitTestimonialSchema.safeParse({
      ...validBase,
      website: "http://spam.example",
    });
    expect(res.success).toBe(true);
  });
});

describe("manualTestimonialSchema", () => {
  it("does not require consent (owner attests)", () => {
    const res = manualTestimonialSchema.safeParse({
      spaceId: "00000000-0000-0000-0000-000000000000",
      author_name: "Client X",
      content: "Super service.",
    });
    expect(res.success).toBe(true);
  });
});
