import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage() {
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
      <AuthForm mode="login" />
    </div>
  );
}
