"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const credsSchema = z.object({
  email: z.string().email("Adresse email invalide."),
  password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères."),
});

export type AuthState = { error?: string; message?: string };

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = credsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { error: "Email ou mot de passe incorrect." };
  }
  redirect("/dashboard");
}

export async function signupAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const schema = credsSchema.extend({
    full_name: z.string().trim().max(80).optional(),
  });
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    full_name: formData.get("full_name") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
      data: { full_name: parsed.data.full_name ?? "" },
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already")) {
      return { error: "Un compte existe déjà avec cet email." };
    }
    return { error: "Inscription impossible. Réessayez." };
  }

  // Email confirmation disabled → session present → straight to dashboard.
  if (data.session) {
    redirect("/dashboard");
  }
  return {
    message:
      "Inscription réussie ! Vérifiez votre boîte mail pour confirmer votre adresse.",
  };
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
