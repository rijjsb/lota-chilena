-- ═══════════════════════════════════════════════════════════
--  Migration 005 — Auto-delete rooms inactive > 120 days
--  Run once in: Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════
--
--  Note: implemented with pg_cron (built into Supabase) instead of an
--  Edge Function. For a pure scheduled DB cleanup this is simpler and more
--  reliable — no deploy step, no cold starts, runs inside Postgres.
--  Deleting a room cascades to its players and games (ON DELETE CASCADE).

-- 1) Enable the scheduler extension (safe to run repeatedly)
create extension if not exists pg_cron;

-- 2) Reusable cleanup function
create or replace function public.cleanup_stale_rooms()
returns void
language sql
as $$
  delete from public.rooms
  where last_activity < now() - interval '120 days';
$$;

-- 3) Schedule it daily at 03:00 UTC (unschedule first so re-runs don't duplicate)
select cron.unschedule('cleanup-stale-rooms')
  where exists (select 1 from cron.job where jobname = 'cleanup-stale-rooms');

select cron.schedule(
  'cleanup-stale-rooms',
  '0 3 * * *',
  $$ select public.cleanup_stale_rooms(); $$
);

-- To verify later:   select * from cron.job;
-- To run it now:     select public.cleanup_stale_rooms();
