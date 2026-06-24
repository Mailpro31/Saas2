import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { publicGetSpaceBySlug } from "@/lib/queries";
import { CollectionForm } from "@/components/collection/collection-form";
import { readableTextColor } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const space = await publicGetSpaceBySlug(slug);
  if (!space) return { title: "Espace introuvable" };
  return {
    title: `${space.headline} — ${space.name}`,
    description: space.description ?? `Laissez un témoignage à ${space.name}.`,
    robots: { index: false }, // collection pages aren't for SEO indexing
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const space = await publicGetSpaceBySlug(slug);
  if (!space) notFound();

  return (
    <div className="flex min-h-screen flex-col items-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-lg">
        <div
          className="rounded-t-2xl border border-b-0 p-6 text-center"
          style={{
            background: `linear-gradient(180deg, ${space.brand_color}14, transparent)`,
          }}
        >
          {space.logo_url ? (
            <Image
              src={space.logo_url}
              alt={space.name}
              width={56}
              height={56}
              className="mx-auto mb-3 size-14 rounded-xl object-cover"
              unoptimized
            />
          ) : (
            <span
              className="mx-auto mb-3 flex size-14 items-center justify-center rounded-xl text-xl font-bold"
              style={{
                backgroundColor: space.brand_color,
                color: readableTextColor(space.brand_color),
              }}
            >
              {space.name.slice(0, 1).toUpperCase()}
            </span>
          )}
          <h1 className="text-xl font-bold tracking-tight">{space.headline}</h1>
          {space.description ? (
            <p className="mx-auto mt-2 max-w-md whitespace-pre-line text-sm text-muted-foreground">
              {space.description}
            </p>
          ) : null}
        </div>

        <div className="rounded-b-2xl border bg-card p-6 shadow-sm">
          {/* Pass only public-safe fields — never the full row (owner_id, …). */}
          <CollectionForm
            space={{
              id: space.id,
              name: space.name,
              brand_color: space.brand_color,
              thank_you_message: space.thank_you_message,
              collect_rating: space.collect_rating,
              collect_avatar: space.collect_avatar,
              collect_video: space.collect_video,
            }}
          />
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Propulsé par <span className="font-semibold">Preuvio</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
