import { z } from "zod";

const emptyToUndefined = (v: unknown) => (v === "" ? undefined : v);

/** Public collection form submission. `website` is a honeypot (must be empty). */
export const submitTestimonialSchema = z.object({
  spaceId: z.string().uuid("Espace invalide."),
  author_name: z
    .string()
    .trim()
    .min(1, "Votre nom est requis.")
    .max(120),
  author_email: z.preprocess(
    emptyToUndefined,
    z.string().email("Email invalide.").optional(),
  ),
  author_role: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(120).optional(),
  ),
  author_avatar_url: z.preprocess(
    emptyToUndefined,
    z.string().url().optional(),
  ),
  rating: z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z.number().int().min(1).max(5).optional(),
  ),
  content: z
    .string()
    .trim()
    .min(10, "Votre témoignage doit faire au moins 10 caractères.")
    .max(2000),
  type: z.enum(["text", "video"]).default("text"),
  video_url: z.preprocess(emptyToUndefined, z.string().url().optional()),
  consent: z
    .boolean()
    .refine((v) => v === true, "Vous devez autoriser la publication."),
  website: z.string().optional(), // honeypot — checked manually in the action
});

/** Owner manually adds a testimonial they received elsewhere. */
export const manualTestimonialSchema = z.object({
  spaceId: z.string().uuid(),
  author_name: z.string().trim().min(1, "Le nom est requis.").max(120),
  author_role: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(120).optional(),
  ),
  author_avatar_url: z.preprocess(
    emptyToUndefined,
    z.string().url().optional(),
  ),
  rating: z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z.number().int().min(1).max(5).optional(),
  ),
  content: z.string().trim().min(1, "Le contenu est requis.").max(2000),
});

export const updateStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "approved", "archived"]),
});

export const testimonialIdSchema = z.object({ id: z.string().uuid() });

export type SubmitTestimonialInput = z.infer<typeof submitTestimonialSchema>;
export type ManualTestimonialInput = z.infer<typeof manualTestimonialSchema>;
