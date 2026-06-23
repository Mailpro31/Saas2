import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { getOwnedSpace, getSpaceTestimonials } from "@/lib/queries";
import { planLimits } from "@/lib/plans";
import { TestimonialInbox } from "@/components/dashboard/testimonial-inbox";

export default async function InboxPage({
  params,
}: {
  params: Promise<{ spaceId: string }>;
}) {
  const { spaceId } = await params;
  const { user, profile } = await requireSession();
  const space = await getOwnedSpace(spaceId, user.id);
  if (!space) notFound();

  const testimonials = await getSpaceTestimonials(spaceId);
  const limits = planLimits(profile.plan);

  return (
    <TestimonialInbox
      spaceId={spaceId}
      testimonials={testimonials}
      manualImportAllowed={limits.manualImport}
    />
  );
}
