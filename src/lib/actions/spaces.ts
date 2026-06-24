"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { planLimits } from "@/lib/plans";
import { slugify, withRandomSuffix } from "@/lib/slug";
import { removeSpaceMedia } from "@/lib/storage";
import {
  createSpaceSchema,
  updateSpaceSchema,
} from "@/lib/validations/space";
import { ok, fail, type ActionResult } from "./result";
import type { Database, Space } from "@/lib/supabase/types";

export async function createSpace(input: {
  name: string;
  slug?: string;
}): Promise<ActionResult<{ id: string }>> {
  const session = await getSession();
  if (!session) return fail("Vous devez être connecté.");

  const parsed = createSpaceSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Données invalides.", parsed.error.flatten().fieldErrors);
  }

  const supabase = await createClient();
  const limits = planLimits(session.profile.plan);

  const { count } = await supabase
    .from("spaces")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", session.user.id);

  if ((count ?? 0) >= limits.maxSpaces) {
    return fail(
      "Vous avez atteint la limite d'espaces de votre plan. Passez à Pro pour en créer davantage.",
    );
  }

  let slug = parsed.data.slug
    ? slugify(parsed.data.slug)
    : slugify(parsed.data.name);

  // Insert with up to 3 attempts to dodge slug collisions.
  for (let attempt = 0; attempt < 4; attempt++) {
    const { data, error } = await supabase
      .from("spaces")
      .insert({
        owner_id: session.user.id,
        name: parsed.data.name,
        slug,
      })
      .select("id")
      .single();

    if (!error && data) {
      // Every space ships with a default widget so the embed code is
      // immediately available. Don't fail space creation on a hiccup, but log
      // it instead of dropping the error silently.
      const { error: widgetError } = await supabase
        .from("widgets")
        .insert({ space_id: data.id });
      if (widgetError) {
        console.error("[spaces] default widget insert failed:", widgetError);
      }
      revalidatePath("/dashboard");
      return ok({ id: data.id });
    }
    // 23505 = unique_violation (slug already taken)
    if (error?.code === "23505") {
      slug = withRandomSuffix(slugify(parsed.data.name));
      continue;
    }
    return fail("Impossible de créer l'espace. Réessayez.");
  }

  return fail("Ce lien est déjà utilisé. Choisissez-en un autre.");
}

export async function updateSpace(
  spaceId: string,
  input: unknown,
): Promise<ActionResult<Space>> {
  const session = await getSession();
  if (!session) return fail("Vous devez être connecté.");

  const parsed = updateSpaceSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Données invalides.", parsed.error.flatten().fieldErrors);
  }

  const limits = planLimits(session.profile.plan);

  // Video collection is a Pro feature. For non-Pro plans we simply never write
  // this field, so an unrelated settings save can't silently flip a previously
  // enabled value off (nor turn it on — submitTestimonial enforces the gate
  // independently).
  const updates: Database["public"]["Tables"]["spaces"]["Update"] = {
    ...parsed.data,
  };
  if (!limits.video) delete updates.collect_video;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("spaces")
    .update(updates)
    .eq("id", spaceId)
    .eq("owner_id", session.user.id) // defense in depth on top of RLS
    .select("*")
    .single();

  if (error || !data) return fail("Mise à jour impossible.");

  revalidatePath(`/dashboard/${spaceId}/settings`);
  revalidatePath(`/c/${data.slug}`);
  revalidatePath(`/mur/${data.slug}`);
  return ok(data);
}

export async function deleteSpace(
  spaceId: string,
): Promise<ActionResult<undefined>> {
  const session = await getSession();
  if (!session) return fail("Vous devez être connecté.");

  const supabase = await createClient();
  const { data: deleted, error } = await supabase
    .from("spaces")
    .delete()
    .eq("id", spaceId)
    .eq("owner_id", session.user.id)
    .select("id")
    .maybeSingle();

  if (error) return fail("Suppression impossible.");
  if (!deleted) return fail("Espace introuvable.");

  // DB rows cascade, but storage objects don't — remove all of this space's
  // media so nothing is left publicly served after deletion.
  await removeSpaceMedia(spaceId);

  revalidatePath("/dashboard");
  return ok(undefined);
}
