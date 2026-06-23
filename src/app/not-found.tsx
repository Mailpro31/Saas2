import Link from "next/link";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <Brand />
      <div>
        <p className="text-5xl font-bold tracking-tight">404</p>
        <h1 className="mt-2 text-xl font-semibold">Page introuvable</h1>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Retour à l&apos;accueil</Link>
      </Button>
    </div>
  );
}
