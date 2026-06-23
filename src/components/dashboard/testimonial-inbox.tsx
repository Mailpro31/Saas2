"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Check,
  Star,
  Archive,
  Trash2,
  RotateCcw,
  Search,
  Video,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import type { Testimonial, TestimonialStatus } from "@/lib/supabase/types";
import {
  updateTestimonialStatus,
  toggleFeatured,
  deleteTestimonial,
} from "@/lib/actions/testimonials";
import { Stars } from "@/components/stars";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddManualDialog } from "@/components/dashboard/add-manual-dialog";
import { cn } from "@/lib/utils";

type Filter = "all" | TestimonialStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "pending", label: "En attente" },
  { key: "approved", label: "Approuvés" },
  { key: "archived", label: "Archivés" },
];

const STATUS_BADGE: Record<
  TestimonialStatus,
  { label: string; className: string }
> = {
  pending: { label: "En attente", className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200" },
  approved: { label: "Approuvé", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200" },
  archived: { label: "Archivé", className: "bg-muted text-muted-foreground" },
};

export function TestimonialInbox({
  spaceId,
  testimonials,
  manualImportAllowed,
}: {
  spaceId: string;
  testimonials: Testimonial[];
  manualImportAllowed: boolean;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const counts = useMemo(() => {
    const c = { all: testimonials.length, pending: 0, approved: 0, archived: 0 };
    for (const t of testimonials) c[t.status] += 1;
    return c;
  }, [testimonials]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return testimonials.filter((t) => {
      if (filter !== "all" && t.status !== filter) return false;
      if (!q) return true;
      return (
        t.author_name.toLowerCase().includes(q) ||
        t.content.toLowerCase().includes(q) ||
        (t.author_role ?? "").toLowerCase().includes(q)
      );
    });
  }, [testimonials, filter, query]);

  function run(id: string, fn: () => Promise<{ ok: boolean; error?: string }>, success: string) {
    setPendingId(id);
    startTransition(async () => {
      const res = await fn();
      setPendingId(null);
      if (res.ok) {
        toast.success(success);
        router.refresh();
      } else {
        toast.error(res.error ?? "Action impossible.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                filter === f.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70",
              )}
            >
              {f.label}{" "}
              <span className="tabular-nums opacity-70">{counts[f.key]}</span>
            </button>
          ))}
        </div>
        <AddManualDialog spaceId={spaceId} allowed={manualImportAllowed} />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un témoignage…"
          className="pl-9"
          aria-label="Rechercher"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-muted/30 px-6 py-16 text-center">
          <p className="text-sm font-medium">Aucun témoignage ici.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {testimonials.length === 0
              ? "Partagez votre page de collecte pour recevoir vos premiers témoignages."
              : "Aucun résultat pour ce filtre."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((t) => {
            const busy = pendingId === t.id;
            const badge = STATUS_BADGE[t.status];
            return (
              <li
                key={t.id}
                className={cn(
                  "rounded-2xl border bg-card p-4 transition-opacity",
                  busy && "opacity-50",
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      {t.author_avatar_url ? (
                        <AvatarImage src={t.author_avatar_url} alt={t.author_name} />
                      ) : null}
                      <AvatarFallback className="text-xs">
                        {t.author_name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        {t.author_name}
                        {t.featured ? (
                          <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        ) : null}
                      </div>
                      {t.author_role ? (
                        <div className="text-xs text-muted-foreground">
                          {t.author_role}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {t.type === "video" ? (
                      <Badge variant="outline" className="gap-1">
                        <Video className="size-3" /> Vidéo
                      </Badge>
                    ) : null}
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", badge.className)}>
                      {badge.label}
                    </span>
                  </div>
                </div>

                {t.rating ? <Stars rating={t.rating} className="mt-3" /> : null}

                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                  {t.content}
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(t.created_at), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {t.status !== "approved" ? (
                      <Button
                        size="sm"
                        variant="default"
                        disabled={busy}
                        onClick={() =>
                          run(
                            t.id,
                            () =>
                              updateTestimonialStatus({
                                id: t.id,
                                status: "approved",
                              }),
                            "Témoignage approuvé.",
                          )
                        }
                      >
                        <Check className="size-4" /> Approuver
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant={t.featured ? "secondary" : "outline"}
                        disabled={busy}
                        onClick={() =>
                          run(
                            t.id,
                            () => toggleFeatured(t.id, !t.featured),
                            t.featured ? "Retiré des favoris." : "Mis en avant.",
                          )
                        }
                      >
                        <Star
                          className={cn(
                            "size-4",
                            t.featured && "fill-amber-400 text-amber-400",
                          )}
                        />
                        {t.featured ? "En avant" : "Mettre en avant"}
                      </Button>
                    )}

                    {t.status !== "archived" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() =>
                          run(
                            t.id,
                            () =>
                              updateTestimonialStatus({
                                id: t.id,
                                status: "archived",
                              }),
                            "Témoignage archivé.",
                          )
                        }
                      >
                        <Archive className="size-4" /> Archiver
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() =>
                          run(
                            t.id,
                            () =>
                              updateTestimonialStatus({
                                id: t.id,
                                status: "pending",
                              }),
                            "Témoignage restauré.",
                          )
                        }
                      >
                        <RotateCcw className="size-4" /> Restaurer
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      disabled={busy}
                      onClick={() => {
                        if (
                          window.confirm(
                            "Supprimer définitivement ce témoignage ?",
                          )
                        ) {
                          run(
                            t.id,
                            () => deleteTestimonial(t.id),
                            "Témoignage supprimé.",
                          );
                        }
                      }}
                    >
                      <Trash2 className="size-4" />
                      <span className="sr-only">Supprimer</span>
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
