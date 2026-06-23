import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Space, Testimonial, Widget } from "@/lib/supabase/types";

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

/** Public lookup of a space by its slug (RLS allows public read). */
export const getPublicSpaceBySlug = cache(
  async (slug: string): Promise<Space | null> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("spaces")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    return data;
  },
);

/** Public lookup of a widget by id (RLS allows public read). */
export const getPublicWidget = cache(
  async (widgetId: string): Promise<Widget | null> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("widgets")
      .select("*")
      .eq("id", widgetId)
      .maybeSingle();
    return data;
  },
);

/** Approved testimonials for a space, featured first (public-safe). */
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

/** The first widget of a space, if any. */
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
