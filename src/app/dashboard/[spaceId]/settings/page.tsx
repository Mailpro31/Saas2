import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { getOwnedSpace } from "@/lib/queries";
import { planLimits } from "@/lib/plans";
import { SpaceSettingsForm } from "@/components/dashboard/space-settings-form";

export default async function SpaceSettingsPage({
  params,
}: {
  params: Promise<{ spaceId: string }>;
}) {
  const { spaceId } = await params;
  const { user, profile } = await requireSession();
  const space = await getOwnedSpace(spaceId, user.id);
  if (!space) notFound();

  const limits = planLimits(profile.plan);

  return (
    <div className="max-w-2xl">
      <SpaceSettingsForm space={space} videoAllowed={limits.video} />
    </div>
  );
}
