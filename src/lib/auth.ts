import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";
import type { User } from "@supabase/supabase-js";

/** Returns the authenticated user or null (validated against Supabase Auth). */
export async function getUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Returns the user + profile, or null if not authenticated. */
export async function getSession(): Promise<{
  user: User;
  profile: Profile;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return null;
  return { user, profile };
}

/** Like getSession but redirects to /login when unauthenticated. */
export async function requireSession(): Promise<{
  user: User;
  profile: Profile;
}> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}
