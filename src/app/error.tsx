"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <Brand />
      <div>
        <h1 className="text-xl font-semibold">Une erreur est survenue</h1>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Quelque chose s&apos;est mal passé de notre côté. Réessayez dans un
          instant.
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={reset}>Réessayer</Button>
        <Button asChild variant="outline">
          <Link href="/">Accueil</Link>
        </Button>
      </div>
    </div>
  );
}
