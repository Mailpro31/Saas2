/**
 * Hand-written database types mirroring `supabase/migrations/0001_init.sql`.
 * Used to type the Supabase clients (no `any`). Keep in sync with migrations.
 */

export type Plan = "free" | "pro";
export type TestimonialStatus = "pending" | "approved" | "archived";
export type TestimonialType = "text" | "video";
export type TestimonialSource = "form" | "manual";
export type WidgetLayout = "wall" | "grid" | "carousel";
export type WidgetTheme = "light" | "dark";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          plan: Plan;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          subscription_status: string | null;
          current_period_end: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          plan?: Plan;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_status?: string | null;
          current_period_end?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      spaces: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          slug: string;
          headline: string;
          description: string | null;
          brand_color: string;
          logo_url: string | null;
          collect_rating: boolean;
          collect_avatar: boolean;
          collect_video: boolean;
          thank_you_message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          slug: string;
          headline?: string;
          description?: string | null;
          brand_color?: string;
          logo_url?: string | null;
          collect_rating?: boolean;
          collect_avatar?: boolean;
          collect_video?: boolean;
          thank_you_message?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["spaces"]["Insert"]>;
        Relationships: [];
      };
      testimonials: {
        Row: {
          id: string;
          space_id: string;
          author_name: string;
          author_email: string | null;
          author_role: string | null;
          author_avatar_url: string | null;
          rating: number | null;
          content: string;
          type: TestimonialType;
          video_url: string | null;
          source: TestimonialSource;
          status: TestimonialStatus;
          featured: boolean;
          consent: boolean;
          created_at: string;
          approved_at: string | null;
        };
        Insert: {
          id?: string;
          space_id: string;
          author_name: string;
          author_email?: string | null;
          author_role?: string | null;
          author_avatar_url?: string | null;
          rating?: number | null;
          content: string;
          type?: TestimonialType;
          video_url?: string | null;
          source?: TestimonialSource;
          status?: TestimonialStatus;
          featured?: boolean;
          consent?: boolean;
          created_at?: string;
          approved_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["testimonials"]["Insert"]>;
        Relationships: [];
      };
      widgets: {
        Row: {
          id: string;
          space_id: string;
          name: string;
          layout: WidgetLayout;
          theme: WidgetTheme;
          columns: number;
          show_rating: boolean;
          show_avatar: boolean;
          show_branding: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          space_id: string;
          name?: string;
          layout?: WidgetLayout;
          theme?: WidgetTheme;
          columns?: number;
          show_rating?: boolean;
          show_avatar?: boolean;
          show_branding?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["widgets"]["Insert"]>;
        Relationships: [];
      };
      stripe_events: {
        Row: { id: string; type: string | null; received_at: string };
        Insert: { id: string; type?: string | null; received_at?: string };
        Update: Partial<{ id: string; type: string | null; received_at: string }>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Space = Database["public"]["Tables"]["spaces"]["Row"];
export type Testimonial = Database["public"]["Tables"]["testimonials"]["Row"];
export type Widget = Database["public"]["Tables"]["widgets"]["Row"];
