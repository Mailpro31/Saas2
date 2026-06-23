-- ============================================================================
-- Preuvio — Initial schema, RLS, auth trigger, storage
-- Run order: paste into Supabase SQL editor, or `supabase db push`.
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- profiles : 1:1 with auth.users, created by trigger on signup
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id                     uuid primary key references auth.users (id) on delete cascade,
  email                  text not null,
  full_name              text,
  plan                   text not null default 'free' check (plan in ('free', 'pro')),
  stripe_customer_id     text,
  stripe_subscription_id text,
  subscription_status    text,
  current_period_end     timestamptz,
  created_at             timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- spaces : a collection campaign / brand owned by a profile
-- ----------------------------------------------------------------------------
create table if not exists public.spaces (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid not null references public.profiles (id) on delete cascade,
  name              text not null check (char_length(name) between 1 and 80),
  slug              text not null unique check (slug ~ '^[a-z0-9-]{3,40}$'),
  headline          text not null default 'Partagez votre expérience',
  description       text,
  brand_color       text not null default '#6366f1' check (brand_color ~ '^#[0-9a-fA-F]{6}$'),
  logo_url          text,
  collect_rating    boolean not null default true,
  collect_avatar    boolean not null default true,
  collect_video     boolean not null default false,
  thank_you_message text not null default 'Merci beaucoup pour votre témoignage ! 🙏',
  created_at        timestamptz not null default now()
);

create index if not exists spaces_owner_id_idx on public.spaces (owner_id);

-- ----------------------------------------------------------------------------
-- testimonials
-- ----------------------------------------------------------------------------
create table if not exists public.testimonials (
  id                uuid primary key default gen_random_uuid(),
  space_id          uuid not null references public.spaces (id) on delete cascade,
  author_name       text not null check (char_length(author_name) between 1 and 120),
  author_email      text,
  author_role       text,
  author_avatar_url text,
  rating            int check (rating between 1 and 5),
  content           text not null check (char_length(content) between 1 and 2000),
  type              text not null default 'text' check (type in ('text', 'video')),
  video_url         text,
  source            text not null default 'form' check (source in ('form', 'manual')),
  status            text not null default 'pending' check (status in ('pending', 'approved', 'archived')),
  featured          boolean not null default false,
  consent           boolean not null default false,
  created_at        timestamptz not null default now(),
  approved_at       timestamptz
);

create index if not exists testimonials_space_status_idx on public.testimonials (space_id, status);
create index if not exists testimonials_space_created_idx on public.testimonials (space_id, created_at desc);

-- ----------------------------------------------------------------------------
-- widgets : an embeddable wall configuration for a space
-- ----------------------------------------------------------------------------
create table if not exists public.widgets (
  id            uuid primary key default gen_random_uuid(),
  space_id      uuid not null references public.spaces (id) on delete cascade,
  name          text not null default 'Mur de témoignages',
  layout        text not null default 'wall' check (layout in ('wall', 'grid', 'carousel')),
  theme         text not null default 'light' check (theme in ('light', 'dark')),
  columns       int not null default 3 check (columns between 1 and 4),
  show_rating   boolean not null default true,
  show_avatar   boolean not null default true,
  show_branding boolean not null default true,
  created_at    timestamptz not null default now()
);

create index if not exists widgets_space_id_idx on public.widgets (space_id);

-- ----------------------------------------------------------------------------
-- Auth trigger : create a profile row on signup
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.profiles     enable row level security;
alter table public.spaces       enable row level security;
alter table public.testimonials enable row level security;
alter table public.widgets      enable row level security;

-- profiles : owner can read/update own row (insert handled by trigger / service role)
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (id = (select auth.uid()));

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- spaces : owner-only read (public pages read via the service-role client
-- server-side, so anon never has direct table access). Owner writes.
drop policy if exists spaces_select_public on public.spaces;
drop policy if exists spaces_select_own on public.spaces;
create policy spaces_select_own on public.spaces
  for select using (owner_id = (select auth.uid()));

drop policy if exists spaces_insert_own on public.spaces;
create policy spaces_insert_own on public.spaces
  for insert with check (owner_id = (select auth.uid()));

drop policy if exists spaces_update_own on public.spaces;
create policy spaces_update_own on public.spaces
  for update using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

drop policy if exists spaces_delete_own on public.spaces;
create policy spaces_delete_own on public.spaces
  for delete using (owner_id = (select auth.uid()));

-- testimonials : owner-only read. Public pages render approved testimonials
-- via the service-role client server-side, so anon has NO direct access (this
-- prevents cross-tenant enumeration of testimonials, incl. author emails).
drop policy if exists testimonials_select_approved on public.testimonials;

drop policy if exists testimonials_select_owner on public.testimonials;
create policy testimonials_select_owner on public.testimonials
  for select using (
    exists (
      select 1 from public.spaces s
      where s.id = testimonials.space_id and s.owner_id = (select auth.uid())
    )
  );

drop policy if exists testimonials_insert_owner on public.testimonials;
create policy testimonials_insert_owner on public.testimonials
  for insert with check (
    exists (
      select 1 from public.spaces s
      where s.id = testimonials.space_id and s.owner_id = (select auth.uid())
    )
  );

drop policy if exists testimonials_update_owner on public.testimonials;
create policy testimonials_update_owner on public.testimonials
  for update using (
    exists (
      select 1 from public.spaces s
      where s.id = testimonials.space_id and s.owner_id = (select auth.uid())
    )
  ) with check (
    exists (
      select 1 from public.spaces s
      where s.id = testimonials.space_id and s.owner_id = (select auth.uid())
    )
  );

drop policy if exists testimonials_delete_owner on public.testimonials;
create policy testimonials_delete_owner on public.testimonials
  for delete using (
    exists (
      select 1 from public.spaces s
      where s.id = testimonials.space_id and s.owner_id = (select auth.uid())
    )
  );

-- widgets : owner-only read (public pages read via the service-role client).
drop policy if exists widgets_select_public on public.widgets;
drop policy if exists widgets_select_own on public.widgets;
create policy widgets_select_own on public.widgets
  for select using (
    exists (
      select 1 from public.spaces s
      where s.id = widgets.space_id and s.owner_id = (select auth.uid())
    )
  );

drop policy if exists widgets_insert_owner on public.widgets;
create policy widgets_insert_owner on public.widgets
  for insert with check (
    exists (
      select 1 from public.spaces s
      where s.id = widgets.space_id and s.owner_id = (select auth.uid())
    )
  );

drop policy if exists widgets_update_owner on public.widgets;
create policy widgets_update_owner on public.widgets
  for update using (
    exists (
      select 1 from public.spaces s
      where s.id = widgets.space_id and s.owner_id = (select auth.uid())
    )
  ) with check (
    exists (
      select 1 from public.spaces s
      where s.id = widgets.space_id and s.owner_id = (select auth.uid())
    )
  );

drop policy if exists widgets_delete_owner on public.widgets;
create policy widgets_delete_owner on public.widgets
  for delete using (
    exists (
      select 1 from public.spaces s
      where s.id = widgets.space_id and s.owner_id = (select auth.uid())
    )
  );

-- ============================================================================
-- Storage : public 'media' bucket for avatars / logos / videos
-- Public-form uploads happen via the service-role admin client (server side),
-- so no anon insert policy is required. Authenticated users may upload too.
-- ============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true, 52428800,
  array['image/png','image/jpeg','image/webp','image/gif','video/mp4','video/webm','video/quicktime']
)
on conflict (id) do nothing;

drop policy if exists media_public_read on storage.objects;
create policy media_public_read on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists media_auth_insert on storage.objects;
create policy media_auth_insert on storage.objects
  for insert to authenticated with check (bucket_id = 'media');

drop policy if exists media_auth_update on storage.objects;
create policy media_auth_update on storage.objects
  for update to authenticated using (bucket_id = 'media' and owner = (select auth.uid()));

drop policy if exists media_auth_delete on storage.objects;
create policy media_auth_delete on storage.objects
  for delete to authenticated using (bucket_id = 'media' and owner = (select auth.uid()));
