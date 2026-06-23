import { Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Stars } from "@/components/stars";
import { cn } from "@/lib/utils";

export interface TestimonialDisplay {
  author_name: string;
  author_role: string | null;
  author_avatar_url: string | null;
  rating: number | null;
  content: string;
  type: "text" | "video";
  video_url: string | null;
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function TestimonialCard({
  testimonial,
  showRating = true,
  showAvatar = true,
  className,
}: {
  testimonial: TestimonialDisplay;
  showRating?: boolean;
  showAvatar?: boolean;
  className?: string;
}) {
  const t = testimonial;
  return (
    <figure
      className={cn(
        "break-inside-avoid rounded-2xl border bg-card p-5 text-card-foreground shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      {t.type === "video" && t.video_url ? (
        <video
          controls
          preload="metadata"
          src={t.video_url}
          className="mb-4 aspect-video w-full rounded-lg bg-muted object-cover"
        />
      ) : (
        <Quote
          aria-hidden
          className="mb-3 size-6 text-muted-foreground/40"
        />
      )}

      {showRating && t.rating ? (
        <Stars rating={t.rating} className="mb-3" />
      ) : null}

      <blockquote className="whitespace-pre-line text-[15px] leading-relaxed text-foreground/90">
        {t.content}
      </blockquote>

      <figcaption className="mt-4 flex items-center gap-3">
        {showAvatar ? (
          <Avatar className="size-9">
            {t.author_avatar_url ? (
              <AvatarImage src={t.author_avatar_url} alt={t.author_name} />
            ) : null}
            <AvatarFallback className="text-xs">
              {initials(t.author_name)}
            </AvatarFallback>
          </Avatar>
        ) : null}
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{t.author_name}</div>
          {t.author_role ? (
            <div className="truncate text-xs text-muted-foreground">
              {t.author_role}
            </div>
          ) : null}
        </div>
      </figcaption>
    </figure>
  );
}
