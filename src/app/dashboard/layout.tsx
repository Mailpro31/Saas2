import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { Brand } from "@/components/brand";
import { UserMenu } from "@/components/dashboard/user-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await requireSession();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-4">
            <Brand href="/dashboard" />
            <nav className="hidden items-center gap-1 sm:flex">
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">Mes espaces</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/billing">Facturation</Link>
              </Button>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {profile.plan === "pro" ? (
              <Badge className="hidden sm:inline-flex">Pro</Badge>
            ) : (
              <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex">
                <Link href="/dashboard/billing">Passer Pro</Link>
              </Button>
            )}
            <UserMenu email={user.email ?? ""} plan={profile.plan} />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
