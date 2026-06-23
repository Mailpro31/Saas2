"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { planLimits } from "@/lib/plans";
import { slugify, withRandomSuffix } from "@/lib/slug";
import {
  createSpaceSchema,
  updateSpaceSchema,
} from "@/lib/validations/space";
import { ok, fail, type ActionResult } from "./result";
import type { Space } from "@/lib/supabase/types";

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
      // immediately available.
      await supabase.from("widgets").insert({ space_id: data.id });
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
  // Video collection is a Pro feature.
  const collect_video = limits.video ? parsed.data.collect_video : false;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("spaces")
    .update({ ...parsed.data, collect_video })
    .eq("id", spaceId)
    .eq("owner_id", session.user.id) // defense in depth on top of RLS
    .select("*")
    .single();

  if (error || !data) return fail("Mise à jour impossible.");

  revalidatePath(`/dashboard/${spaceId}/settings`);
  revalidatePath(`/c/${data.slug}`);
  return ok(data);
}

export async function deleteSpace(
  spaceId: string,
): Promise<ActionResult<undefined>> {
  const session = await getSession();
  if (!session) return fail("Vous devez être connecté.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("spaces")
    .delete()
    .eq("id", spaceId)
    .eq("owner_id", session.user.id);

  if (error) return fail("Suppression impossible.");
  revalidatePath("/dashboard");
  return ok(undefined);
}
