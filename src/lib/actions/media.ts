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

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function bytesMatch(buf: Uint8Array, sig: number[], offset = 0): boolean {
  for (let i = 0; i < sig.length; i++) {
    if (buf[offset + i] !== sig[i]) return false;
  }
  return true;
}
function asciiAt(buf: Uint8Array, offset: number, len: number): string {
  let s = "";
  for (let i = 0; i < len; i++) s += String.fromCharCode(buf[offset + i] ?? 0);
  return s;
}

/** Validate the file's real magic bytes against its declared MIME type. */
async function sniffMatches(file: File, declared: string): Promise<boolean> {
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  switch (declared) {
    case "image/png":
      return bytesMatch(head, [0x89, 0x50, 0x4e, 0x47]);
    case "image/jpeg":
      return bytesMatch(head, [0xff, 0xd8, 0xff]);
    case "image/gif":
      return bytesMatch(head, [0x47, 0x49, 0x46, 0x38]);
    case "image/webp":
      return asciiAt(head, 0, 4) === "RIFF" && asciiAt(head, 8, 4) === "WEBP";
    case "video/webm":
      return bytesMatch(head, [0x1a, 0x45, 0xdf, 0xa3]);
    case "video/mp4":
      return asciiAt(head, 4, 4) === "ftyp";
    case "video/quicktime":
      return ["ftyp", "moov", "mdat", "wide", "free", "skip"].includes(
        asciiAt(head, 4, 4),
      );
    default:
      return false;
  }
}

/**
 * Uploads an avatar / logo / video to the public `media` bucket via the
 * service-role client. Bound to an existing space, MIME validated by magic
 * bytes (not the spoofable Content-Type), size-capped and rate-limited.
 */
export async function uploadMedia(
  formData: FormData,
): Promise<ActionResult<{ url: string }>> {
  const ip = clientIpFrom(await headers());
  if (!rateLimit(`upload:${ip}`, 15, 60_000).ok) {
    return fail("Trop d'envois de fichiers. Réessayez dans un instant.");
  }

  const spaceId = formData.get("spaceId");
  if (typeof spaceId !== "string" || !UUID_RE.test(spaceId)) {
    return fail("Espace invalide.");
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
  if (!(await sniffMatches(file, file.type))) {
    return fail("Le contenu du fichier ne correspond pas à son type déclaré.");
  }

  const admin = createAdminClient();

  // Bind the upload to a real space (prevents anonymous "free CDN" abuse).
  const { data: space } = await admin
    .from("spaces")
    .select("id")
    .eq("id", spaceId)
    .maybeSingle();
  if (!space) return fail("Espace introuvable.");

  const ext = EXT[file.type] ?? "bin";
  const path = `space/${spaceId}/${kind}/${crypto.randomUUID()}.${ext}`;

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
