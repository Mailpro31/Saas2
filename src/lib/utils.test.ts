import { describe, it, expect } from "vitest";
import { cn, readableTextColor } from "./utils";

describe("cn", () => {
  it("merges class names and dedupes conflicting Tailwind utilities", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-sm", false, undefined, "font-bold")).toBe(
      "text-sm font-bold",
    );
  });
});

describe("readableTextColor", () => {
  it("returns dark text on light backgrounds", () => {
    expect(readableTextColor("#ffffff")).toBe("#0a0a0a");
    expect(readableTextColor("#ffe100")).toBe("#0a0a0a"); // bright yellow
  });

  it("returns white text on dark backgrounds", () => {
    expect(readableTextColor("#000000")).toBe("#ffffff");
    expect(readableTextColor("#6366f1")).toBe("#ffffff"); // indigo (default brand)
  });

  it("defaults to white for malformed input", () => {
    expect(readableTextColor("blue")).toBe("#ffffff");
    expect(readableTextColor("#fff")).toBe("#ffffff");
  });
});
