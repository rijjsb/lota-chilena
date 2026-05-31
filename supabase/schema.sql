-- ═══════════════════════════════════════════════════════════
--  LOTA CHILENA — Supabase Schema
--  Run this once in: Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════

-- ── Rooms ────────────────────────────────────────────────────
create table if not exists public.rooms (
  code          text primary key,
  settings      jsonb not null default '{
    "apuesta":100,"ternaPct":10,"lineaPct":25,"lotaPct":65,
    "currency":"CLP","soundMode":"default"
  }',
  status        text not null default 'lobby',  -- lobby | active | settled
  created_at    timestamptz not null default now(),
  last_activity timestamptz not null default now()
);

-- ── Players ──────────────────────────────────────────────────
create table if not exists public.players (
  id              text primary key,
  room_code       text not null references public.rooms(code) on delete cascade,
  name            text not null,
  normalized_name text not null,   -- lowercase, no accents, no spaces
  is_mc           boolean not null default false,
  carton_idx      integer not null default 0,        -- first card (legacy + sorting)
  carton_idxs     integer[] not null default '{}',   -- all cards for this player (2 per player)
  skin            text not null default 'dot',
  marked          integer[] not null default '{}',
  balance         integer not null default 0,
  created_at      timestamptz not null default now(),
  last_seen       timestamptz not null default now()
);

-- ── Games ────────────────────────────────────────────────────
create table if not exists public.games (
  id              text primary key,
  room_code       text not null references public.rooms(code) on delete cascade,
  called_numbers  integer[] not null default '{}',
  last_drawn      integer,
  prizes          jsonb not null default '{"terna":null,"linea":null,"lota":null}',
  requests        jsonb not null default '[]',
  log             jsonb not null default '[]',
  pique_state     jsonb not null default '{
    "enabled":false,"stake":100,"participants":[],
    "active":false,"settled":false,"winner":null,"tied":[]
  }',
  status          text not null default 'idle',  -- idle | active | settled
  created_at      timestamptz not null default now()
);

-- ── Indexes ──────────────────────────────────────────────────
create index if not exists idx_players_room        on public.players(room_code);
create index if not exists idx_players_room_norm   on public.players(room_code, normalized_name);
create index if not exists idx_games_room          on public.games(room_code);
create index if not exists idx_games_room_status   on public.games(room_code, status);

-- ── Enable Realtime ──────────────────────────────────────────
-- After running this SQL, also go to:
-- Database → Replication → Supabase Realtime → enable rooms, players, games
alter publication supabase_realtime add table public.rooms;
alter publication supabase_realtime add table public.players;
alter publication supabase_realtime add table public.games;
