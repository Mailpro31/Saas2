-- ============================================================================
-- Preuvio — Hardening migration 0002
-- Apply AFTER 0001_init.sql (paste into the Supabase SQL editor, or db push).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Enforce the free-plan per-space testimonial cap at the database level.
--
-- The app also checks the cap before inserting, but that count-then-insert is
-- racy: concurrent public submissions can each read count < limit and all
-- insert, pushing a free space past its quota. This BEFORE INSERT trigger makes
-- the check atomic by taking a row lock on the parent space (so inserts for the
-- same space serialize) and then counting. Pro plans stay uncapped.
--
-- Keep `free_cap` in sync with PLAN_LIMITS.free.maxTestimonials in
-- src/lib/plans.ts.
-- ----------------------------------------------------------------------------
create or replace function public.enforce_testimonial_cap()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_plan    text;
  current_count int;
  free_cap      constant int := 15;
begin
  -- Serialize concurrent inserts for this space so the count below is atomic.
  perform 1 from public.spaces where id = new.space_id for update;

  select p.plan
    into owner_plan
    from public.spaces s
    join public.profiles p on p.id = s.owner_id
   where s.id = new.space_id;

  if owner_plan is distinct from 'pro' then
    select count(*) into current_count
      from public.testimonials
     where space_id = new.space_id;

    if current_count >= free_cap then
      raise exception 'testimonial cap reached for space %', new.space_id
        using errcode = 'check_violation';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists testimonials_cap on public.testimonials;
create trigger testimonials_cap
  before insert on public.testimonials
  for each row execute function public.enforce_testimonial_cap();
