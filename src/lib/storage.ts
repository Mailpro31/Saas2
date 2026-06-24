import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Storage cleanup helpers for the public `media` bucket.
 *
 * NB: these live in a plain `server-only` module — NOT a `"use server"` action
 * file — on purpose. Exporting them as server actions would expose them as
 * callable RPC endpoints, letting anyone delete arbitrary tenants' media. They
 * are only ever invoked from owner-checked actions (deleteTestimonial /
 * deleteSpace).
 */

/** Maps one of our public media URLs back to its storage object path, or null
 *  when the URL isn't ours (e.g. an externally-hosted avatar). */
function storagePathFromPublicUrl(url: string): string | null {
  const marker = "/storage/v1/object/public/media/";
  const i = url.indexOf(marker);
  return i === -1 ? null : url.slice(i + marker.length);
}

/**
 * Deletes the media objects behind the given public URLs. Best-effort: external
 * URLs are skipped and storage errors are logged, not thrown. Called when a
 * testimonial is deleted so its avatar/video stop being publicly served.
 */
export async function removeMediaByPublicUrls(
  urls: (string | null | undefined)[],
): Promise<void> {
  const paths = urls
    .filter((u): u is string => typeof u === "string" && u.length > 0)
    .map(storagePathFromPublicUrl)
    .filter((p): p is string => p !== null);
  if (paths.length === 0) return;
  const admin = createAdminClient();
  const { error } = await admin.storage.from("media").remove(paths);
  if (error) console.error("[media] cleanup error:", error);
}

/** Deletes every media object stored under a space's prefix (avatars, logos,
 *  videos). Best-effort; called when a whole space is deleted. */
export async function removeSpaceMedia(spaceId: string): Promise<void> {
  const admin = createAdminClient();
  for (const kind of ["image", "video"] as const) {
    const prefix = `space/${spaceId}/${kind}`;
    const { data: files } = await admin.storage
      .from("media")
      .list(prefix, { limit: 1000 });
    if (files && files.length > 0) {
      const { error } = await admin.storage
        .from("media")
        .remove(files.map((f) => `${prefix}/${f.name}`));
      if (error) console.error("[media] space cleanup error:", error);
    }
  }
}
