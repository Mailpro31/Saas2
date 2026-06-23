import { notFound } from "next/navigation";
import {
  publicGetWidgetById,
  publicGetApprovedTestimonials,
} from "@/lib/queries";
import { WallOfLove } from "@/components/wall-of-love";
import { EmbedResizer } from "@/components/embed/embed-resizer";
import type { TestimonialDisplay } from "@/components/testimonial-card";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EmbedPage({
  params,
}: {
  params: Promise<{ widgetId: string }>;
}) {
  const { widgetId } = await params;
  const widget = await publicGetWidgetById(widgetId);
  if (!widget) notFound();

  const approved = await publicGetApprovedTestimonials(widget.space_id);
  const testimonials: TestimonialDisplay[] = approved.map((t) => ({
    author_name: t.author_name,
    author_role: t.author_role,
    author_avatar_url: t.author_avatar_url,
    rating: t.rating,
    content: t.content,
    type: t.type,
    video_url: t.video_url,
  }));

  return (
    <div
      id="preuvio-embed-root"
      className={cn(
        "p-3",
        widget.theme === "dark" ? "dark bg-background" : "bg-background",
      )}
    >
      <WallOfLove
        testimonials={testimonials}
        config={{
          layout: widget.layout,
          theme: widget.theme,
          columns: widget.columns,
          show_rating: widget.show_rating,
          show_avatar: widget.show_avatar,
          show_branding: widget.show_branding,
        }}
      />
      <EmbedResizer id={widget.id} />
    </div>
  );
}
