import { z } from "zod";

export const widgetConfigSchema = z.object({
  id: z.string().uuid().optional(),
  spaceId: z.string().uuid(),
  name: z.string().trim().min(1).max(80).default("Mur de témoignages"),
  layout: z.enum(["wall", "grid", "carousel"]),
  theme: z.enum(["light", "dark"]),
  columns: z.preprocess((v) => Number(v), z.number().int().min(1).max(4)),
  show_rating: z.boolean(),
  show_avatar: z.boolean(),
  show_branding: z.boolean(),
});

export type WidgetConfigInput = z.infer<typeof widgetConfigSchema>;
