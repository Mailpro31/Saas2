import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Inscription" };

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          Créez votre compte gratuit
        </h1>
        <p className="text-sm text-muted-foreground">
          Commencez à collecter des témoignages en quelques minutes.
        </p>
      </div>
      <AuthForm mode="signup" />
    </div>
  );
}
