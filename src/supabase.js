import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: { params: { eventsPerSecond: 10 } },
});

// ── Conversion helpers ────────────────────────────────────────
export const supaToPlayer = (row) => ({
  id:        row.id,
  name:      row.name,
  isMC:      row.is_mc,
  cartonIdx: row.carton_idx,
  skin:      row.skin,
  marked:    row.marked    || [],
  balance:   row.balance,
});

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
