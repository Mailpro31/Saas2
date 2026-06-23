"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";
import Link from "next/link";
import type { Widget } from "@/lib/supabase/types";
import type { TestimonialDisplay } from "@/components/testimonial-card";
import { upsertWidget } from "@/lib/actions/widgets";
import { WallOfLove, type WallConfig } from "@/components/wall-of-love";
import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const LAYOUTS: { value: WallConfig["layout"]; label: string }[] = [
  { value: "wall", label: "Mur (mosaïque)" },
  { value: "grid", label: "Grille" },
  { value: "carousel", label: "Carrousel" },
];

export function WidgetEditor({
  spaceId,
  slug,
  widget,
  testimonials,
  removeBrandingAllowed,
  customThemeAllowed,
  siteUrl,
}: {
  spaceId: string;
  slug: string;
  widget: Widget | null;
  testimonials: TestimonialDisplay[];
  removeBrandingAllowed: boolean;
  customThemeAllowed: boolean;
  siteUrl: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [config, setConfig] = useState<WallConfig>({
    layout: widget?.layout ?? "wall",
    theme: customThemeAllowed ? (widget?.theme ?? "light") : "light",
    columns: widget?.columns ?? 3,
    show_rating: widget?.show_rating ?? true,
    show_avatar: widget?.show_avatar ?? true,
    show_branding: removeBrandingAllowed ? (widget?.show_branding ?? true) : true,
  });

  function set<K extends keyof WallConfig>(key: K, value: WallConfig[K]) {
    setConfig((c) => ({ ...c, [key]: value }));
  }

  function save() {
    startTransition(async () => {
      const res = await upsertWidget({
        id: widget?.id,
        spaceId,
        name: widget?.name ?? "Mur de témoignages",
        ...config,
      });
      if (res.ok) {
        toast.success("Widget enregistré.");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  const widgetId = widget?.id;
  const embedSnippet = widgetId
    ? `<div data-preuvio-widget="${widgetId}"></div>\n<script async src="${siteUrl}/embed.js"></script>`
    : "";

  return (
    <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
      {/* Controls */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Apparence</CardTitle>
            <CardDescription>Personnalisez votre mur.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Mise en page</Label>
              <div className="grid gap-1.5">
                {LAYOUTS.map((l) => (
                  <button
                    key={l.value}
                    type="button"
                    aria-pressed={config.layout === l.value}
                    onClick={() => set("layout", l.value)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                      config.layout === l.value
                        ? "border-primary bg-primary/5 font-medium"
                        : "hover:bg-muted",
                    )}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {config.layout !== "carousel" ? (
              <div className="space-y-2">
                <Label>Colonnes</Label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map((n) => (
                    <button
                      key={n}
                      type="button"
                      aria-pressed={config.columns === n}
                      onClick={() => set("columns", n)}
                      className={cn(
                        "flex-1 rounded-lg border py-2 text-sm transition-colors",
                        config.columns === n
                          ? "border-primary bg-primary/5 font-medium"
                          : "hover:bg-muted",
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label>Thème</Label>
              <div className="flex gap-1.5">
                {(["light", "dark"] as const).map((th) => (
                  <button
                    key={th}
                    type="button"
                    aria-pressed={config.theme === th}
                    disabled={!customThemeAllowed && th === "dark"}
                    onClick={() => set("theme", th)}
                    className={cn(
                      "flex-1 rounded-lg border py-2 text-sm capitalize transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                      config.theme === th
                        ? "border-primary bg-primary/5 font-medium"
                        : "hover:bg-muted",
                    )}
                  >
                    {th === "light" ? "Clair" : "Sombre"}
                  </button>
                ))}
              </div>
              {!customThemeAllowed ? (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Lock className="size-3" /> Thème sombre réservé au Pro
                </p>
              ) : null}
            </div>

            <div className="space-y-3 border-t pt-4">
              <Row
                label="Afficher les notes"
                checked={config.show_rating}
                onChange={(v) => set("show_rating", v)}
              />
              <Row
                label="Afficher les avatars"
                checked={config.show_avatar}
                onChange={(v) => set("show_avatar", v)}
              />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Badge « Preuvio »</p>
                  {!removeBrandingAllowed ? (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Lock className="size-3" /> Retrait réservé au Pro
                    </p>
                  ) : null}
                </div>
                <Switch
                  checked={removeBrandingAllowed ? config.show_branding : true}
                  onCheckedChange={(v) => set("show_branding", v)}
                  disabled={!removeBrandingAllowed}
                />
              </div>
            </div>

            <Button onClick={save} disabled={isPending} className="w-full">
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Enregistrer
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Preview + embed */}
      <div className="space-y-6">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Aperçu en direct
            </h3>
            {testimonials.length === 0 ? (
              <span className="text-xs text-muted-foreground">
                Approuvez des témoignages pour les voir ici
              </span>
            ) : null}
          </div>
          <div className="rounded-2xl border bg-muted/20 p-4 sm:p-6">
            <WallOfLove
              testimonials={
                testimonials.length > 0 ? testimonials : PREVIEW_PLACEHOLDER
              }
              config={config}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Code d&apos;intégration</CardTitle>
            <CardDescription>
              Collez ce code dans le HTML de votre site, là où vous voulez
              afficher le mur.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {widgetId ? (
              <>
                <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">
                  <code>{embedSnippet}</code>
                </pre>
                <div className="flex flex-wrap gap-2">
                  <CopyButton text={embedSnippet} label="Copier le code" />
                  <Button asChild variant="outline">
                    <Link
                      href={`/mur/${slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Voir la page publique
                    </Link>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Compatible avec n&apos;importe quel site (WordPress, Webflow,
                  Systeme.io, Notion, code…). Le mur s&apos;adapte
                  automatiquement en hauteur.
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Enregistrez le widget pour générer votre code d&apos;intégration.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm font-medium">{label}</p>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

const PREVIEW_PLACEHOLDER: TestimonialDisplay[] = [
  {
    author_name: "Sophie Lambert",
    author_role: "Coach business",
    author_avatar_url: null,
    rating: 5,
    content:
      "Un outil simple et redoutablement efficace. J'ai collecté 12 témoignages en une semaine !",
    type: "text",
    video_url: null,
  },
  {
    author_name: "Marc Dubois",
    author_role: "Fondateur, Studio Pixel",
    author_avatar_url: null,
    rating: 5,
    content:
      "Le mur s'intègre parfaitement à ma page de vente. La preuve sociale a boosté mes conversions.",
    type: "text",
    video_url: null,
  },
  {
    author_name: "Inès Caron",
    author_role: "Formatrice",
    author_avatar_url: null,
    rating: 4,
    content: "Exactement ce qu'il me fallait, et en français en plus. Bravo !",
    type: "text",
    video_url: null,
  },
];
