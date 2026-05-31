-- ═══════════════════════════════════════════════════════════
--  ONE-OFF — Wipe ALL test data
--  Run once in: Supabase Dashboard → SQL Editor → New query
--  ⚠️ Deletes every room, player and game. Only run while testing.
-- ═══════════════════════════════════════════════════════════

-- players and games have ON DELETE CASCADE to rooms, so deleting rooms
-- clears everything. (Belt-and-suspenders deletes included for safety.)
delete from public.games;
delete from public.players;
delete from public.rooms;
