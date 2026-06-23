/**
 * Plan definitions and limits. Enforced server-side in every mutating
 * action; reflected in the UI. The source of truth for what Free vs Pro
 * can do.
 */
export type Plan = "free" | "pro";

export interface PlanLimits {
  maxSpaces: number;
  maxTestimonials: number; // per space
  maxWidgets: number; // per space
  video: boolean;
  removeBranding: boolean;
  customTheme: boolean;
  manualImport: boolean;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    maxSpaces: 1,
    maxTestimonials: 15,
    maxWidgets: 1,
    video: false,
    removeBranding: false,
    customTheme: false,
    manualImport: false,
  },
  pro: {
    maxSpaces: Number.POSITIVE_INFINITY,
    maxTestimonials: Number.POSITIVE_INFINITY,
    maxWidgets: Number.POSITIVE_INFINITY,
    video: true,
    removeBranding: true,
    customTheme: true,
    manualImport: true,
  },
};

export function planLimits(plan: Plan | string | null | undefined): PlanLimits {
  if (plan === "pro") return PLAN_LIMITS.pro;
  return PLAN_LIMITS.free;
}

export function isPro(plan: Plan | string | null | undefined): boolean {
  return plan === "pro";
}

/** Human-readable, for UI. Infinity rendered as « illimité ». */
export function formatLimit(n: number): string {
  return Number.isFinite(n) ? String(n) : "illimité";
}

export const PRO_PRICE_MONTHLY_EUR = 15;
export const PRO_PRICE_YEARLY_EUR = 144; // 12€/mois facturé annuellement
