import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Space, Testimonial, Widget } from "@/lib/supabase/types";

// ---------------------------------------------------------------------------
// Owner-scoped reads (user client + RLS). Used by the authenticated dashboard.
// ---------------------------------------------------------------------------

/** Fetch a space owned by the user, deduped within a request. */
export const getOwnedSpace = cache(
  async (spaceId: string, userId: string): Promise<Space | null> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("spaces")
      .select("*")
      .eq("id", spaceId)
      .eq("owner_id", userId)
      .single();
    return data;
  },
);

/** All testimonials for a space (owner view), newest first. */
export const getSpaceTestimonials = cache(
  async (spaceId: string): Promise<Testimonial[]> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("testimonials")
      .select("*")
      .eq("space_id", spaceId)
      .order("created_at", { ascending: false });
    return data ?? [];
  },
);

/** Approved testimonials for an owned space (owner preview), featured first. */
export const getApprovedTestimonials = cache(
  async (spaceId: string): Promise<Testimonial[]> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("testimonials")
      .select("*")
      .eq("space_id", spaceId)
      .eq("status", "approved")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });
    return data ?? [];
  },
);

/** The first widget of an owned space, if any. */
export const getSpaceWidget = cache(
  async (spaceId: string): Promise<Widget | null> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("widgets")
      .select("*")
      .eq("space_id", spaceId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    return data;
  },
);

// ---------------------------------------------------------------------------
// Public reads (service-role admin client, server-side only). Anon never has
// direct table access; these scope strictly by slug / id / space_id and the
// callers render only public-safe fields.
// ---------------------------------------------------------------------------

export const publicGetSpaceBySlug = cache(
  async (slug: string): Promise<Space | null> => {
    const admin = createAdminClient();
    const { data } = await admin
      .from("spaces")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    return data;
  },
);

export const publicGetWidgetById = cache(
  async (widgetId: string): Promise<Widget | null> => {
    const admin = createAdminClient();
    const { data } = await admin
      .from("widgets")
      .select("*")
      .eq("id", widgetId)
      .maybeSingle();
    return data;
  },
);

export const publicGetSpaceWidget = cache(
  async (spaceId: string): Promise<Widget | null> => {
    const admin = createAdminClient();
    const { data } = await admin
      .from("widgets")
      .select("*")
      .eq("space_id", spaceId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    return data;
  },
);

export const publicGetApprovedTestimonials = cache(
  async (spaceId: string): Promise<Testimonial[]> => {
    const admin = createAdminClient();
    const { data } = await admin
      .from("testimonials")
      .select("*")
      .eq("space_id", spaceId)
      .eq("status", "approved")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });
    return data ?? [];
  },
);
