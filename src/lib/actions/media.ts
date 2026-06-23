"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit, clientIpFrom } from "@/lib/rate-limit";
import { ok, fail, type ActionResult } from "./result";

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB

const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

/**
 * Uploads an avatar / logo / video to the public `media` bucket via the
 * service-role client (so the public collection form can upload without auth).
 * Validates MIME type and size server-side.
 */
export async function uploadMedia(
  formData: FormData,
): Promise<ActionResult<{ url: string }>> {
  const ip = clientIpFrom(await headers());
  if (!rateLimit(`upload:${ip}`, 15, 60_000).ok) {
    return fail("Trop d'envois de fichiers. Réessayez dans un instant.");
  }

  const file = formData.get("file");
  const kindRaw = formData.get("kind");
  const kind = kindRaw === "video" ? "video" : "image";

  if (!(file instanceof File) || file.size === 0) {
    return fail("Aucun fichier fourni.");
  }

  const allowed = kind === "video" ? VIDEO_TYPES : IMAGE_TYPES;
  const maxBytes = kind === "video" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;

  if (!allowed.includes(file.type)) {
    return fail(
      kind === "video"
        ? "Format vidéo non supporté (mp4, webm ou mov)."
        : "Format d'image non supporté (png, jpg, webp ou gif).",
    );
  }
  if (file.size > maxBytes) {
    return fail(
      `Fichier trop volumineux (max ${Math.round(maxBytes / 1024 / 1024)} Mo).`,
    );
  }

  const ext = EXT[file.type] ?? "bin";
  const path = `${kind}/${crypto.randomUUID()}.${ext}`;

  const admin = createAdminClient();
  const { error } = await admin.storage
    .from("media")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    console.error("[media] upload error:", error);
    return fail("Échec de l'envoi du fichier.");
  }

  const {
    data: { publicUrl },
  } = admin.storage.from("media").getPublicUrl(path);

  return ok({ url: publicUrl });
}
