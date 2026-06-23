"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { planLimits } from "@/lib/plans";
import { widgetConfigSchema } from "@/lib/validations/widget";
import { ok, fail, type ActionResult } from "./result";

export async function upsertWidget(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const session = await getSession();
  if (!session) return fail("Vous devez être connecté.");

  const parsed = widgetConfigSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Configuration invalide.", parsed.error.flatten().fieldErrors);
  }
  const data = parsed.data;

  const supabase = await createClient();

  // Verify the space belongs to the user.
  const { data: space } = await supabase
    .from("spaces")
    .select("id")
    .eq("id", data.spaceId)
    .eq("owner_id", session.user.id)
    .single();
  if (!space) return fail("Espace introuvable.");

  const limits = planLimits(session.profile.plan);
  // Pro gates: removing branding, and dark/custom theme.
  const show_branding = limits.removeBranding ? data.show_branding : true;
  const theme = limits.customTheme ? data.theme : "light";

  const payload = {
    space_id: data.spaceId,
    name: data.name,
    layout: data.layout,
    theme,
    columns: data.columns,
    show_rating: data.show_rating,
    show_avatar: data.show_avatar,
    show_branding,
  };

  if (data.id) {
    const { data: row, error } = await supabase
      .from("widgets")
      .update(payload)
      .eq("id", data.id)
      .select("id")
      .single();
    if (error || !row) return fail("Mise à jour du widget impossible.");
    revalidatePath(`/dashboard/${data.spaceId}/widgets`);
    return ok({ id: row.id });
  }

  // New widget: enforce per-space widget cap.
  const { count } = await supabase
    .from("widgets")
    .select("*", { count: "exact", head: true })
    .eq("space_id", data.spaceId);
  if ((count ?? 0) >= limits.maxWidgets) {
    return fail("Limite de widgets atteinte pour votre plan.");
  }

  const { data: row, error } = await supabase
    .from("widgets")
    .insert(payload)
    .select("id")
    .single();
  if (error || !row) return fail("Création du widget impossible.");

  revalidatePath(`/dashboard/${data.spaceId}/widgets`);
  return ok({ id: row.id });
}
