-- ═══════════════════════════════════════════════════════════
--  Migration 003 — Full replica identity for DELETE realtime
--  Run this once in: Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════
--
--  Why: Supabase Realtime filters (e.g. room_code=eq.ABC123) are applied
--  to the row payload. For DELETE events Postgres only includes the
--  PRIMARY KEY by default, so a room_code filter can never match and the
--  DELETE event is dropped for other clients. Setting REPLICA IDENTITY FULL
--  makes the entire old row available so the filter matches and every
--  device receives player-removal events.

alter table public.players replica identity full;
alter table public.games   replica identity full;
alter table public.rooms   replica identity full;
