import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: { params: { eventsPerSecond: 10 } },
});

// ── Conversion helpers ────────────────────────────────────────
export const supaToPlayer = (row) => ({
  id:         row.id,
  name:       row.name,
  isMC:       row.is_mc,
  cartonIdxs: (row.carton_idxs && row.carton_idxs.length)
                ? row.carton_idxs
                : (row.carton_idx != null ? [row.carton_idx] : []),
  skin:       row.skin,
  marked:     row.marked    || [],
  balance:    row.balance,
  lastSeen:   row.last_seen || null,
});

// Player is online if they updated last_seen within 45s
export const isOnline = (player) => {
  if (!player?.lastSeen) return true; // no data yet — assume online
  return Date.now() - new Date(player.lastSeen).getTime() < 45000;
};

export const supaToGame = (row) => ({
  id:            row.id,
  status:        row.status,
  calledNumbers: row.called_numbers || [],
  lastDrawn:     row.last_drawn     ?? null,
  prizes:        row.prizes         || { terna: null, linea: null, lota: null },
  requests:      row.requests       || [],
  log:           row.log            || [],
  piqueState:    row.pique_state    || null,
});

// Normalize name for reconnection matching:
// lowercase, strip accents, strip spaces
export const normalizeName = (name) =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '');
