"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import type { Space } from "@/lib/supabase/types";
import { updateSpace, deleteSpace } from "@/lib/actions/spaces";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SpaceSettingsForm({
  space,
  videoAllowed,
}: {
  space: Space;
  videoAllowed: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  const [form, setForm] = useState({
    name: space.name,
    headline: space.headline,
    description: space.description ?? "",
    brand_color: space.brand_color,
    thank_you_message: space.thank_you_message,
    collect_rating: space.collect_rating,
    collect_avatar: space.collect_avatar,
    collect_video: space.collect_video && videoAllowed,
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateSpace(space.id, form);
      if (res.ok) {
        toast.success("Réglages enregistrés.");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  function handleDelete() {
    if (
      !window.confirm(
        `Supprimer l'espace « ${space.name} » et tous ses témoignages ? Cette action est irréversible.`,
      )
    )
      return;
    startDelete(async () => {
      const res = await deleteSpace(space.id);
      if (res.ok) {
        toast.success("Espace supprimé.");
        router.push("/dashboard");
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Réglages de l&apos;espace</CardTitle>
            <CardDescription>
              Personnalisez votre page de collecte publique.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l&apos;espace</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                maxLength={80}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="headline">Accroche (titre de la page)</Label>
              <Input
                id="headline"
                value={form.headline}
                onChange={(e) => set("headline", e.target.value)}
                maxLength={120}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Message d&apos;introduction</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Expliquez à vos clients pourquoi leur avis compte…"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand_color">Couleur de marque</Label>
              <div className="flex items-center gap-3">
                <input
                  id="brand_color"
                  type="color"
                  value={form.brand_color}
                  onChange={(e) => set("brand_color", e.target.value)}
                  className="h-9 w-14 cursor-pointer rounded border bg-transparent"
                  aria-label="Couleur de marque"
                />
                <Input
                  value={form.brand_color}
                  onChange={(e) => set("brand_color", e.target.value)}
                  className="w-32 font-mono"
                  maxLength={7}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="thank_you_message">Message de remerciement</Label>
              <Textarea
                id="thank_you_message"
                value={form.thank_you_message}
                onChange={(e) => set("thank_you_message", e.target.value)}
                maxLength={300}
                rows={2}
                required
              />
            </div>

            <div className="space-y-3 rounded-lg border p-4">
              <Toggle
                label="Demander une note (étoiles)"
                checked={form.collect_rating}
                onChange={(v) => set("collect_rating", v)}
              />
              <Toggle
                label="Demander une photo (avatar)"
                checked={form.collect_avatar}
                onChange={(v) => set("collect_avatar", v)}
              />
              <Toggle
                label="Autoriser les témoignages vidéo"
                description={
                  videoAllowed ? undefined : "Réservé au plan Pro"
                }
                checked={form.collect_video && videoAllowed}
                onChange={(v) => set("collect_video", v)}
                disabled={!videoAllowed}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Enregistrer
            </Button>
          </CardFooter>
        </Card>
      </form>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Zone de danger</CardTitle>
          <CardDescription>
            La suppression de l&apos;espace efface tous ses témoignages et
            widgets. Irréversible.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            Supprimer cet espace
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}
