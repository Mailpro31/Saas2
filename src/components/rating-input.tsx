"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingInput({
  value,
  onChange,
  size = "size-7",
}: {
  value: number;
  onChange: (value: number) => void;
  size?: string;
}) {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div
      className="flex items-center gap-1"
      role="radiogroup"
      aria-label="Note sur 5"
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(value === n ? 0 : n)}
          className="rounded outline-none transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Star
            className={cn(
              size,
              n <= active
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-muted-foreground/40",
            )}
          />
        </button>
      ))}
    </div>
  );
}
