import Link from "next/link";
import { MessageSquare, ExternalLink, Inbox } from "lucide-react";
import type { Space } from "@/lib/supabase/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function SpaceCard({
  space,
  total,
  pending,
}: {
  space: Space;
  total: number;
  pending: number;
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: space.brand_color }}
              aria-hidden
            >
              {space.name.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <Link
                href={`/dashboard/${space.id}`}
                className="block truncate font-semibold hover:underline"
              >
                {space.name}
              </Link>
              <p className="truncate text-xs text-muted-foreground">
                /c/{space.slug}
              </p>
            </div>
          </div>
          {pending > 0 ? (
            <Badge variant="secondary" className="shrink-0">
              {pending} en attente
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MessageSquare className="size-4" /> {total} témoignage
            {total > 1 ? "s" : ""}
          </span>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button asChild size="sm" className="flex-1">
          <Link href={`/dashboard/${space.id}`}>
            <Inbox className="size-4" /> Gérer
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href={`/c/${space.slug}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-4" /> Page
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
