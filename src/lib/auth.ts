import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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
    .maybeSingle();

  if (profile) return { user, profile };

  // Self-heal: if the signup trigger didn't create the profile, create it now.
  const fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : "";
  const admin = createAdminClient();
  // Insert the missing row only. `ignoreDuplicates` leaves an already-existing
  // profile untouched (e.g. when the first SELECT missed it due to replica lag)
  // instead of overwriting its email / full_name with possibly-stale auth values
  // on this read path.
  await admin
    .from("profiles")
    .upsert(
      { id: user.id, email: user.email ?? "", full_name: fullName },
      { onConflict: "id", ignoreDuplicates: true },
    );
  const { data: created } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return created ? { user, profile: created } : null;
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
