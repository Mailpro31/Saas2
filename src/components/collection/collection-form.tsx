"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Upload, Video, Type } from "lucide-react";
import type { Space } from "@/lib/supabase/types";
import { submitTestimonial } from "@/lib/actions/testimonials";
import { uploadMedia } from "@/lib/actions/media";
import { RatingInput } from "@/components/rating-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function CollectionForm({ space }: { space: Space }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [mode, setMode] = useState<"text" | "video">("text");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  async function upload(file: File, kind: "image" | "video"): Promise<string | null> {
    const fd = new FormData();
    fd.set("file", file);
    fd.set("kind", kind);
    const res = await uploadMedia(fd);
    if (!res.ok) {
      setError(res.error);
      return null;
    }
    return res.data.url;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const form = new FormData(e.currentTarget);

      let avatarUrl: string | undefined;
      if (space.collect_avatar && avatarFile) {
        const url = await upload(avatarFile, "image");
        if (!url) return;
        avatarUrl = url;
      }

      let videoUrl: string | undefined;
      const isVideo = space.collect_video && mode === "video" && !!videoFile;
      if (isVideo && videoFile) {
        const url = await upload(videoFile, "video");
        if (!url) return;
        videoUrl = url;
      }

      const res = await submitTestimonial({
        spaceId: space.id,
        author_name: String(form.get("author_name") ?? ""),
        author_email: String(form.get("author_email") ?? ""),
        author_role: String(form.get("author_role") ?? ""),
        author_avatar_url: avatarUrl,
        rating: space.collect_rating ? rating || undefined : undefined,
        content: String(form.get("content") ?? ""),
        type: isVideo ? "video" : "text",
        video_url: videoUrl,
        consent: form.get("consent") === "on",
        website: String(form.get("website") ?? ""), // honeypot
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(res.error);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="size-8" />
        </div>
        <h2 className="text-xl font-semibold">Merci ! 🎉</h2>
        <p className="max-w-sm text-muted-foreground">{space.thank_you_message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {space.collect_video ? (
        <div className="flex gap-2">
          {(["text", "video"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-lg border py-2 text-sm font-medium transition-colors",
                mode === m ? "border-primary bg-primary/5" : "hover:bg-muted",
              )}
            >
              {m === "text" ? <Type className="size-4" /> : <Video className="size-4" />}
              {m === "text" ? "Écrit" : "Vidéo"}
            </button>
          ))}
        </div>
      ) : null}

      {space.collect_rating ? (
        <div className="space-y-2">
          <Label>Votre note</Label>
          <RatingInput value={rating} onChange={setRating} />
        </div>
      ) : null}

      {mode === "video" && space.collect_video ? (
        <div className="space-y-2">
          <Label htmlFor="video">Votre vidéo (mp4, webm, mov — 50 Mo max)</Label>
          <Input
            id="video"
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
          />
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="content">
          Votre témoignage <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="content"
          name="content"
          required
          minLength={10}
          maxLength={2000}
          rows={4}
          placeholder="Qu'avez-vous le plus apprécié ? Quels résultats avez-vous obtenus ?"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="author_name">
            Nom <span className="text-destructive">*</span>
          </Label>
          <Input id="author_name" name="author_name" required maxLength={120} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="author_role">Rôle / société</Label>
          <Input
            id="author_role"
            name="author_role"
            maxLength={120}
            placeholder="Cliente, Acme…"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="author_email">Email (non publié)</Label>
        <Input
          id="author_email"
          name="author_email"
          type="email"
          placeholder="vous@exemple.com"
        />
      </div>

      {space.collect_avatar ? (
        <div className="space-y-2">
          <Label htmlFor="avatar">
            <span className="inline-flex items-center gap-1.5">
              <Upload className="size-4" /> Photo (facultatif)
            </span>
          </Label>
          <Input
            id="avatar"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
          />
        </div>
      ) : null}

      {/* Honeypot — hidden from humans */}
      <div aria-hidden className="absolute left-[-9999px]" tabIndex={-1}>
        <label>
          Ne pas remplir
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
        <input
          id="consent"
          name="consent"
          type="checkbox"
          required
          className="mt-0.5 size-4 accent-current"
        />
        <Label htmlFor="consent" className="text-xs font-normal leading-relaxed text-muted-foreground">
          J&apos;autorise {space.name} à publier ce témoignage (nom, photo,
          contenu) sur ses supports de communication. Conforme RGPD.
        </Label>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={submitting}
        className="w-full"
        style={{ backgroundColor: space.brand_color }}
      >
        {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
        Envoyer mon témoignage
      </Button>
    </form>
  );
}
