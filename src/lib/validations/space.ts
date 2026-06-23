import { z } from "zod";

export const slugSchema = z
  .string()
  .regex(
    /^[a-z0-9-]{3,40}$/,
    "Le lien doit contenir 3 à 40 caractères : lettres minuscules, chiffres et tirets.",
  );

export const createSpaceSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis.").max(80),
  slug: slugSchema.optional(),
});

const emptyToUndefined = (v: unknown) => (v === "" ? undefined : v);

export const updateSpaceSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis.").max(80),
  headline: z.string().trim().min(1, "L'accroche est requise.").max(120),
  description: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(500).optional(),
  ),
  brand_color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Couleur hexadécimale invalide (ex. #6366f1)."),
  collect_rating: z.boolean(),
  collect_avatar: z.boolean(),
  collect_video: z.boolean(),
  thank_you_message: z
    .string()
    .trim()
    .min(1, "Le message de remerciement est requis.")
    .max(300),
});

export type CreateSpaceInput = z.infer<typeof createSpaceSchema>;
export type UpdateSpaceInput = z.infer<typeof updateSpaceSchema>;
