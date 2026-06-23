import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { planLimits } from "@/lib/plans";
import { CreateSpaceDialog } from "@/components/dashboard/create-space-dialog";
import { SpaceCard } from "@/components/dashboard/space-card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Mes espaces" };

export default async function DashboardPage() {
  const { user, profile } = await requireSession();
  const supabase = await createClient();

  const { data: spaces } = await supabase
    .from("spaces")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const spaceList = spaces ?? [];
  const ids = spaceList.map((s) => s.id);

  // Counts (total + pending) per space, scoped to the user's spaces.
  const counts = new Map<string, { total: number; pending: number }>();
  if (ids.length > 0) {
    const { data: rows } = await supabase
      .from("testimonials")
      .select("space_id, status")
      .in("space_id", ids);
    for (const r of rows ?? []) {
      const c = counts.get(r.space_id) ?? { total: 0, pending: 0 };
      c.total += 1;
      if (r.status === "pending") c.pending += 1;
      counts.set(r.space_id, c);
    }
  }

  const limits = planLimits(profile.plan);
  const canCreate = spaceList.length < limits.maxSpaces;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mes espaces</h1>
          <p className="text-sm text-muted-foreground">
            Collectez et affichez les témoignages de vos clients.
          </p>
        </div>
        {canCreate ? (
          <CreateSpaceDialog />
        ) : (
          <Button asChild variant="outline">
            <Link href="/dashboard/billing">
              <Sparkles className="size-4" /> Passer Pro pour plus d&apos;espaces
            </Link>
          </Button>
        )}
      </div>

      {spaceList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/30 px-6 py-16 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="size-6" />
          </div>
          <h2 className="text-lg font-semibold">Créez votre premier espace</h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Un espace vous donne une page de collecte partageable et un mur de
            témoignages à intégrer sur votre site.
          </p>
          <div className="mt-6">
            <CreateSpaceDialog label="Créer mon premier espace" />
          </div>
          <Link
            href="/tarifs"
            className="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            Voir les tarifs <ArrowUpRight className="size-3" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {spaceList.map((space) => {
            const c = counts.get(space.id) ?? { total: 0, pending: 0 };
            return (
              <SpaceCard
                key={space.id}
                space={space}
                total={c.total}
                pending={c.pending}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
