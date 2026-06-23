import { describe, it, expect } from "vitest";
import { widgetConfigSchema } from "./widget";

const valid = {
  spaceId: "00000000-0000-0000-0000-000000000000",
  layout: "wall",
  theme: "light",
  columns: 3,
  show_rating: true,
  show_avatar: true,
  show_branding: true,
};

describe("widgetConfigSchema", () => {
  it("accepts a valid config", () => {
    expect(widgetConfigSchema.safeParse(valid).success).toBe(true);
  });

  it("coerces numeric-string columns and enforces 1..4", () => {
    const ok = widgetConfigSchema.safeParse({ ...valid, columns: "4" });
    expect(ok.success).toBe(true);
    if (ok.success) expect(ok.data.columns).toBe(4);

    expect(widgetConfigSchema.safeParse({ ...valid, columns: 5 }).success).toBe(
      false,
    );
    expect(widgetConfigSchema.safeParse({ ...valid, columns: 0 }).success).toBe(
      false,
    );
  });

  it("rejects invalid layout/theme", () => {
    expect(
      widgetConfigSchema.safeParse({ ...valid, layout: "spiral" }).success,
    ).toBe(false);
    expect(
      widgetConfigSchema.safeParse({ ...valid, theme: "neon" }).success,
    ).toBe(false);
  });

  it("defaults the widget name when omitted", () => {
    const res = widgetConfigSchema.safeParse(valid);
    expect(res.success).toBe(true);
    if (res.success) expect(res.data.name).toBe("Mur de témoignages");
  });
});
