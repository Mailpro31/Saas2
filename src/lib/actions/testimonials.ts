"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth";
import { planLimits, type Plan } from "@/lib/plans";
import { sendNewTestimonialEmail } from "@/lib/email/resend";
import {
  submitTestimonialSchema,
  manualTestimonialSchema,
  updateStatusSchema,
  testimonialIdSchema,
} from "@/lib/validations/testimonial";
import { ok, fail, type ActionResult } from "./result";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * PUBLIC submission from the collection page. Runs with the service-role
 * admin client (after Zod validation + honeypot + existence/limit checks),
 * so we never need a permissive anon RLS insert policy.
 */
export async function submitTestimonial(
  input: unknown,
): Promise<ActionResult<undefined>> {
  const parsed = submitTestimonialSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Formulaire invalide.", parsed.error.flatten().fieldErrors);
  }
  const data = parsed.data;

  // Honeypot: a filled `website` field means a bot. Pretend success.
  if (data.website && data.website.length > 0) return ok(undefined);

  const admin = createAdminClient();

  const { data: space } = await admin
    .from("spaces")
    .select("id, name, owner_id, collect_video")
    .eq("id", data.spaceId)
    .single();

  if (!space) return fail("Cet espace de collecte est introuvable.");

  // Owner plan governs the per-space testimonial cap and video availability.
  const { data: owner } = await admin
    .from("profiles")
    .select("email, plan")
    .eq("id", space.owner_id)
    .single();

  const limits = planLimits(owner?.plan as Plan | undefined);

  const { count } = await admin
    .from("testimonials")
    .select("*", { count: "exact", head: true })
    .eq("space_id", space.id);

  if ((count ?? 0) >= limits.maxTestimonials) {
    return fail(
      "Cet espace a atteint sa capacité de témoignages pour le moment.",
    );
  }

  const isVideo = data.type === "video" && !!data.video_url;
  if (isVideo && (!space.collect_video || !limits.video)) {
    return fail("Les témoignages vidéo ne sont pas activés pour cet espace.");
  }

  const { error } = await admin.from("testimonials").insert({
    space_id: space.id,
    author_name: data.author_name,
    author_email: data.author_email ?? null,
    author_role: data.author_role ?? null,
    author_avatar_url: data.author_avatar_url ?? null,
    rating: data.rating ?? null,
    content: data.content,
    type: isVideo ? "video" : "text",
    video_url: isVideo ? data.video_url! : null,
    source: "form",
    status: "pending",
    consent: true,
  });

  if (error) return fail("Envoi impossible. Réessayez dans un instant.");

  // Best-effort notification (no-op if Resend isn't configured).
  if (owner?.email) {
    await sendNewTestimonialEmail({
      to: owner.email,
      spaceName: space.name,
      authorName: data.author_name,
      excerpt:
        data.content.length > 160
          ? `${data.content.slice(0, 160)}…`
          : data.content,
      manageUrl: `${siteUrl}/dashboard/${space.id}`,
    });
  }

  return ok(undefined);
}

/** Owner manually adds a testimonial they received elsewhere (Pro feature). */
export async function addManualTestimonial(
  input: unknown,
): Promise<ActionResult<undefined>> {
  const session = await getSession();
  if (!session) return fail("Vous devez être connecté.");

  const parsed = manualTestimonialSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Données invalides.", parsed.error.flatten().fieldErrors);
  }
  const data = parsed.data;

  const limits = planLimits(session.profile.plan);
  if (!limits.manualImport) {
    return fail("L'ajout manuel est réservé au plan Pro.");
  }

  const supabase = await createClient();

  // Ownership + cap check.
  const { count } = await supabase
    .from("testimonials")
    .select("*", { count: "exact", head: true })
    .eq("space_id", data.spaceId);

  if ((count ?? 0) >= limits.maxTestimonials) {
    return fail("Limite de témoignages atteinte pour cet espace.");
  }

  const { error } = await supabase.from("testimonials").insert({
    space_id: data.spaceId,
    author_name: data.author_name,
    author_role: data.author_role ?? null,
    author_avatar_url: data.author_avatar_url ?? null,
    rating: data.rating ?? null,
    content: data.content,
    type: "text",
    source: "manual",
    status: "approved",
    consent: true,
    approved_at: new Date().toISOString(),
  });

  if (error) return fail("Ajout impossible (vérifiez vos droits).");

  revalidatePath(`/dashboard/${data.spaceId}`);
  return ok(undefined);
}

export async function updateTestimonialStatus(
  input: unknown,
): Promise<ActionResult<undefined>> {
  const session = await getSession();
  if (!session) return fail("Vous devez être connecté.");

  const parsed = updateStatusSchema.safeParse(input);
  if (!parsed.success) return fail("Statut invalide.");

  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("testimonials")
    .update({
      status: parsed.data.status,
      approved_at:
        parsed.data.status === "approved" ? new Date().toISOString() : null,
    })
    .eq("id", parsed.data.id)
    .select("space_id")
    .single();

  if (error || !row) return fail("Action impossible.");

  revalidatePath(`/dashboard/${row.space_id}`);
  return ok(undefined);
}

export async function toggleFeatured(
  id: string,
  featured: boolean,
): Promise<ActionResult<undefined>> {
  const session = await getSession();
  if (!session) return fail("Vous devez être connecté.");

  const parsed = testimonialIdSchema.safeParse({ id });
  if (!parsed.success) return fail("Identifiant invalide.");

  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("testimonials")
    .update({ featured })
    .eq("id", parsed.data.id)
    .select("space_id")
    .single();

  if (error || !row) return fail("Action impossible.");

  revalidatePath(`/dashboard/${row.space_id}`);
  return ok(undefined);
}

export async function deleteTestimonial(
  id: string,
): Promise<ActionResult<undefined>> {
  const session = await getSession();
  if (!session) return fail("Vous devez être connecté.");

  const parsed = testimonialIdSchema.safeParse({ id });
  if (!parsed.success) return fail("Identifiant invalide.");

  const supabase = await createClient();
  const { data: row } = await supabase
    .from("testimonials")
    .select("space_id")
    .eq("id", parsed.data.id)
    .single();

  const { error } = await supabase
    .from("testimonials")
    .delete()
    .eq("id", parsed.data.id);

  if (error) return fail("Suppression impossible.");

  if (row) revalidatePath(`/dashboard/${row.space_id}`);
  return ok(undefined);
}
