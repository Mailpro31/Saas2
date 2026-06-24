"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth";
import { rateLimit, clientIpFrom } from "@/lib/rate-limit";
import { planLimits, type Plan } from "@/lib/plans";
import { removeMediaByPublicUrls } from "@/lib/storage";
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

  // Best-effort rate limit to curb scripted flooding of a space's quota.
  const ip = clientIpFrom(await headers());
  if (!rateLimit(`submit:${ip}`, 8, 60_000).ok) {
    return fail("Trop de soumissions. Réessayez dans une minute.");
  }

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

  // Verify ownership explicitly (defense in depth on top of RLS).
  const { data: space } = await supabase
    .from("spaces")
    .select("id")
    .eq("id", data.spaceId)
    .eq("owner_id", session.user.id)
    .single();
  if (!space) return fail("Espace introuvable.");

  // Cap check.
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
  revalidatePath(`/dashboard/${data.spaceId}/widgets`);
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
  // The widget editor's live preview reads approved testimonials and isn't
  // force-dynamic, so it must be revalidated when approval state changes.
  revalidatePath(`/dashboard/${row.space_id}/widgets`);
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
  revalidatePath(`/dashboard/${row.space_id}/widgets`);
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
  // RLS scopes this read to the owner, so a missing row means "not yours".
  const { data: row } = await supabase
    .from("testimonials")
    .select("space_id, author_avatar_url, video_url")
    .eq("id", parsed.data.id)
    .maybeSingle();
  if (!row) return fail("Témoignage introuvable.");

  const { error } = await supabase
    .from("testimonials")
    .delete()
    .eq("id", parsed.data.id);

  if (error) return fail("Suppression impossible.");

  // Remove the stored avatar/video so deleted content is no longer served from
  // the public bucket (privacy / RGPD) and storage isn't leaked.
  await removeMediaByPublicUrls([row.author_avatar_url, row.video_url]);

  revalidatePath(`/dashboard/${row.space_id}`);
  revalidatePath(`/dashboard/${row.space_id}/widgets`);
  return ok(undefined);
}
