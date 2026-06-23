"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import {
  loginAction,
  signupAction,
  type AuthState,
} from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const action = mode === "login" ? loginAction : signupAction;
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    action,
    {},
  );

  if (state.message) {
    return (
      <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-100">
        <CheckCircle2 className="size-4" />
        <AlertDescription className="text-emerald-900 dark:text-emerald-100">
          {state.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {mode === "signup" ? (
        <div className="space-y-2">
          <Label htmlFor="full_name">Nom (facultatif)</Label>
          <Input
            id="full_name"
            name="full_name"
            type="text"
            autoComplete="name"
            placeholder="Camille Martin"
          />
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="vous@exemple.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          placeholder="••••••••"
        />
        {mode === "signup" ? (
          <p className="text-xs text-muted-foreground">8 caractères minimum.</p>
        ) : null}
      </div>

      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        {mode === "login" ? "Se connecter" : "Créer mon compte"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {mode === "login" ? (
          <>
            Pas encore de compte ?{" "}
            <Link href="/signup" className="font-medium text-foreground underline-offset-4 hover:underline">
              Inscrivez-vous
            </Link>
          </>
        ) : (
          <>
            Déjà un compte ?{" "}
            <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
              Connectez-vous
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
