import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import {
  getOwnedSpace,
  getSpaceWidget,
  getApprovedTestimonials,
} from "@/lib/queries";
import { planLimits } from "@/lib/plans";
import { WidgetEditor } from "@/components/dashboard/widget-editor";
import type { TestimonialDisplay } from "@/components/testimonial-card";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function WidgetsPage({
  params,
}: {
  params: Promise<{ spaceId: string }>;
}) {
  const { spaceId } = await params;
  const { user, profile } = await requireSession();
  const space = await getOwnedSpace(spaceId, user.id);
  if (!space) notFound();

  const [widget, approved] = await Promise.all([
    getSpaceWidget(spaceId),
    getApprovedTestimonials(spaceId),
  ]);

  const testimonials: TestimonialDisplay[] = approved.map((t) => ({
    author_name: t.author_name,
    author_role: t.author_role,
    author_avatar_url: t.author_avatar_url,
    rating: t.rating,
    content: t.content,
    type: t.type,
    video_url: t.video_url,
  }));

  const limits = planLimits(profile.plan);

  return (
    <WidgetEditor
      spaceId={spaceId}
      slug={space.slug}
      widget={widget}
      testimonials={testimonials}
      removeBrandingAllowed={limits.removeBranding}
      customThemeAllowed={limits.customTheme}
      siteUrl={siteUrl}
    />
  );
}
