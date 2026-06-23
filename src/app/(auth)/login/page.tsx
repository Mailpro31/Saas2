import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          Connexion à votre compte
        </h1>
        <p className="text-sm text-muted-foreground">
          Heureux de vous revoir 👋
        </p>
      </div>
      {sp.error === "callback" ? (
        <Alert variant="destructive">
          <AlertDescription>
            Le lien de confirmation a expiré ou est invalide. Connectez-vous ou
            renvoyez un lien.
          </AlertDescription>
        </Alert>
      ) : null}
      <AuthForm mode="login" />
    </div>
  );
}
