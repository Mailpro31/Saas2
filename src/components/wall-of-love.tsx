import Link from "next/link";
import { TestimonialCard, type TestimonialDisplay } from "@/components/testimonial-card";
import { cn } from "@/lib/utils";

export interface WallConfig {
  layout: "wall" | "grid" | "carousel";
  columns: number;
  show_rating: boolean;
  show_avatar: boolean;
  theme: "light" | "dark";
  show_branding: boolean;
}

const WALL_COLS: Record<number, string> = {
  1: "lg:columns-1",
  2: "lg:columns-2",
  3: "lg:columns-3",
  4: "lg:columns-4",
};
const GRID_COLS: Record<number, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

export function WallOfLove({
  testimonials,
  config,
  className,
}: {
  testimonials: TestimonialDisplay[];
  config: WallConfig;
  className?: string;
}) {
  const { layout, columns, show_rating, show_avatar, theme, show_branding } =
    config;

  const cards = testimonials.map((t, i) => (
    <TestimonialCard
      key={i}
      testimonial={t}
      showRating={show_rating}
      showAvatar={show_avatar}
      className={cn(
        layout === "wall" && "mb-4",
        layout === "carousel" && "w-[300px] shrink-0 snap-start sm:w-[340px]",
      )}
    />
  ));

  return (
    <div
      className={cn(
        theme === "dark" && "dark",
        "bg-background text-foreground",
        className,
      )}
    >
      {testimonials.length === 0 ? (
        <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Aucun témoignage approuvé pour le moment.
        </div>
      ) : layout === "carousel" ? (
        <div className="flex snap-x gap-4 overflow-x-auto pb-3">{cards}</div>
      ) : layout === "grid" ? (
        <div
          className={cn(
            "grid grid-cols-1 gap-4 sm:grid-cols-2",
            GRID_COLS[columns] ?? GRID_COLS[3],
          )}
        >
          {cards}
        </div>
      ) : (
        <div
          className={cn(
            "gap-4 [column-fill:_balance] columns-1 sm:columns-2",
            WALL_COLS[columns] ?? WALL_COLS[3],
          )}
        >
          {cards}
        </div>
      )}

      {show_branding ? (
        <div className="mt-5 text-center">
          <Link
            href={process.env.NEXT_PUBLIC_SITE_URL ?? "https://preuvio.app"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Propulsé par <span className="font-semibold">Preuvio</span>
          </Link>
        </div>
      ) : null}
    </div>
  );
}
