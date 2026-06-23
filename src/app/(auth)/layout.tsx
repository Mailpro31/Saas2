import { redirect } from "next/navigation";
import { Brand } from "@/components/brand";
import { getUser } from "@/lib/auth";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4 py-12">
      <div className="mb-8">
        <Brand />
      </div>
      <div className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        {children}
      </div>
      <p className="mt-6 max-w-sm text-center text-xs text-muted-foreground">
        En continuant, vous acceptez nos conditions et notre{" "}
        <a href="/confidentialite" className="underline underline-offset-2">
          politique de confidentialité
        </a>
        .
      </p>
    </div>
  );
}
