-- ═══════════════════════════════════════════════════════════
--  Migration 002 — Two cards per player
--  Run this once in: Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════

-- Add carton_idxs array column (holds all cards a player has, 2 per player)
alter table public.players
  add column if not exists carton_idxs integer[] not null default '{}';

-- Backfill existing rows: wrap their single carton_idx into the array
update public.players
  set carton_idxs = array[carton_idx]
  where carton_idxs = '{}';
