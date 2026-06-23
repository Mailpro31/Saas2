import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({
  rating,
  className,
  size = "size-4",
}: {
  rating: number | null | undefined;
  className?: string;
  size?: string;
}) {
  if (!rating || rating < 1) return null;
  const rounded = Math.round(rating);
  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      role="img"
      aria-label={`${rounded} sur 5 étoiles`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          aria-hidden
          className={cn(
            size,
            i < rounded
              ? "fill-amber-400 text-amber-400"
              : "fill-transparent text-muted-foreground/30",
          )}
        />
      ))}
    </div>
  );
}
