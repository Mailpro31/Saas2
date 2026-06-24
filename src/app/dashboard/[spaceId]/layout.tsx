import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { getOwnedSpace } from "@/lib/queries";
import { SpaceTabs } from "@/components/dashboard/space-tabs";
import { Button } from "@/components/ui/button";
import { readableTextColor } from "@/lib/utils";

export default async function SpaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ spaceId: string }>;
}) {
  const { spaceId } = await params;
  const { user } = await requireSession();
  const space = await getOwnedSpace(spaceId, user.id);
  if (!space) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-xl text-base font-semibold"
            style={{
              backgroundColor: space.brand_color,
              color: readableTextColor(space.brand_color),
            }}
            aria-hidden
          >
            {space.name.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{space.name}</h1>
            <p className="text-xs text-muted-foreground">/c/{space.slug}</p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/c/${space.slug}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-4" /> Page de collecte
          </Link>
        </Button>
      </div>

      <SpaceTabs spaceId={spaceId} />

      <div>{children}</div>
    </div>
  );
}
