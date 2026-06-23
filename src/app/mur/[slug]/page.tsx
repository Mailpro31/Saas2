import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import {
  publicGetSpaceBySlug,
  publicGetSpaceWidget,
  publicGetApprovedTestimonials,
} from "@/lib/queries";

export const dynamic = "force-dynamic";
import { WallOfLove } from "@/components/wall-of-love";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import type { TestimonialDisplay } from "@/components/testimonial-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const space = await publicGetSpaceBySlug(slug);
  if (!space) return { title: "Mur introuvable" };
  return {
    title: `Ce que disent les clients de ${space.name}`,
    description: `Découvrez les témoignages vérifiés des clients de ${space.name}.`,
  };
}

export default async function WallPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const space = await publicGetSpaceBySlug(slug);
  if (!space) notFound();

  const [widget, approved] = await Promise.all([
    publicGetSpaceWidget(space.id),
    publicGetApprovedTestimonials(space.id),
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

  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:py-16">
        <header className="mb-10 text-center">
          <span
            className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl text-xl font-bold text-white"
            style={{ backgroundColor: space.brand_color }}
          >
            {space.name.slice(0, 1).toUpperCase()}
          </span>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Ils parlent de {space.name}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {approved.length} témoignage{approved.length > 1 ? "s" : ""} vérifié
            {approved.length > 1 ? "s" : ""}
          </p>
        </header>

        <WallOfLove
          testimonials={testimonials}
          config={{
            layout: widget?.layout ?? "wall",
            theme: "light",
            columns: widget?.columns ?? 3,
            show_rating: widget?.show_rating ?? true,
            show_avatar: widget?.show_avatar ?? true,
            show_branding: false,
          }}
        />
      </main>

      <footer className="border-t bg-muted/30">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row">
          <Brand />
          <Button asChild size="sm" variant="outline">
            <Link href="/">
              Créez votre mur de témoignages <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </footer>
    </div>
  );
}
