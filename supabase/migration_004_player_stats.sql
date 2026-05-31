-- ═══════════════════════════════════════════════════════════
--  Migration 004 — Per-player session stats (visible to all)
--  Run this once in: Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════
--
--  Why: win counts (Ternas/Líneas/Lotas/Piques), games played and total
--  wagered were tracked only in the MC's browser, so non-MC players saw
--  zeros. Storing them on the player row syncs them to every device via
--  Realtime.

alter table public.players
  add column if not exists games_played  integer not null default 0,
  add column if not exists total_wagered integer not null default 0,
  add column if not exists wins          jsonb   not null default '{"terna":0,"linea":0,"lota":0,"pique":0}';
