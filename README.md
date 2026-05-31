# Lota Chilena 🎱

**Live at → [https://lotachilena.cl](https://lotachilena.cl)**

A real-time multiplayer implementation of the traditional Chilean family bingo game. Built so a Chilean family split between New Zealand and Chile can play their Sunday game together remotely — same rules, same stakes, same social chaos.

Made by **Caqui & Rafi**.

---

## What is Lota?

Lota is the Chilean version of bingo: **90 numbers** and **48 pre-defined cartones** (3×9 cards, 5 numbers per row) matching the real physical cards. Players mark their own cards as the MC (Animador) calls numbers. Prizes are sequential:

| Prize | Win condition |
|-------|---------------|
| **Terna** | 3 marked in a row |
| **Línea** | a full row |
| **Lota** | the whole card |

Each is worth a configurable % of the pot, and they unlock in order (Línea after Terna, Lota after Línea). One player is the **Animador (MC)** who draws numbers and validates wins.

**El Pique** is a side wager that runs alongside the main game — a 4th skill-based prize that participants claim the moment a called number lands on their card.

---

## Features

- **Real-time multiplayer** across devices via Supabase (no accounts, just a name)
- **Share a link** (`lotachilena.cl/ROOMCODE`) — opening it pre-fills the room code
- **Reconnect by name** — rejoin a room with the same name to restore your cards, marks and balance (case/accent/space-insensitive)
- **2 cards per player**, auto-assigned from the highest free numbers (low numbers stay open to pick)
- **Four claimable prizes** — Terna, Línea, Lota, and ⚡ El Pique — all via a request → MC-validate flow
- **MC control tower** — draw button, 1–90 matrix, live game log, snoop view of every player's cards
- **Anti-cheat** — players' own cards don't reveal called numbers; MC validates claims; invalid claims are broadcast to everyone ("shame")
- **Dividir / split** — MC can split any prize among multiple simultaneous claimants
- **Manual override** (🏆 Premios) — MC can assign prizes directly, for elders playing on paper cards
- **Remove players** — MC can kick inactive players (frees their cards; they can rejoin)
- **Connection dots** — green/red per-player presence indicator
- **Session balances & stats** — games played, wins per prize type, total wagered, running balance — synced to every device
- **El Pique** opt-in, MC-configured stake, tie/split handling
- **MC handover** to another player
- **Image skins** (Poroto, Peso, 20 Lucas…), **sound settings** (tones or Chilean mp3s)
- **Language toggle** 🇨🇱 Spanish (default) / 🇳🇿 English on every screen

Game terms (Lota, Terna, Línea, Lota, Pique, Cartón, Animador) stay in Spanish in both languages — they're the names of the game.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 7 |
| Backend / realtime / DB | Supabase (Postgres + Realtime) |
| Hosting | Cloudflare Workers (static assets) |
| Domain / DNS / SSL | nic.cl + Cloudflare (free auto-renewing SSL) |
| Styling | Inline CSS (single file) |
| Audio | Web Audio API + HTML Audio |

Almost everything lives in `src/LotaChilena.jsx`; Supabase client + helpers in `src/supabase.js`.

---

## Running locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
```

Create a `.env` (see `.env.example`):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xxx
```

---

## Deployment

- **Auto-deploy:** every push to `main` triggers a Cloudflare Workers build (`npm run build` → `npx wrangler deploy`) and goes live in ~2 minutes.
- **Config:** `wrangler.jsonc` serves `dist/` as static assets with SPA routing (`not_found_handling: single-page-application`). Node pinned to 22 via `.nvmrc`.
- **Env vars:** `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set as plaintext build variables in Cloudflare (they're public, baked into the bundle by Vite).

---

## Database

SQL lives in `supabase/`, run in the Supabase SQL editor (Run without RLS):

- `schema.sql` — tables (`rooms`, `players`, `games`), realtime publication, full replica identity
- `migration_002_two_cards.sql` — 2 cards per player (`carton_idxs`)
- `migration_003_replica_identity.sql` — full replica identity (needed for DELETE realtime / player removal)
- `migration_004_player_stats.sql` — per-player session stats (games/wins/wagered) so all devices see them
- `migration_005_cleanup_cron.sql` — pg_cron job deleting rooms inactive > 120 days
- `oneoff_wipe_test_data.sql` — wipe all rooms/players/games (testing only)

Tables: `rooms` (code, settings, status, last_activity), `players` (name, normalized_name, carton_idxs, marked, balance, wins, presence), `games` (called_numbers, prizes, requests, log, pique_state).

---

## Adjustable constants (top of `src/LotaChilena.jsx`)

```js
const VISIBLE_LAST_CALLS = 3;   // past numbers non-MC players see
const CARDS_PER_PLAYER   = 2;   // cards each player holds
```

---

## Roadmap / pending

- **Mobile polish pass** — responsive but needs real-device tuning
- **Custom 1–90 draw sounds** — drop `1.mp3`…`90.mp3` (+ winner sounds) into `public/sounds/` (awaiting recordings)
- **Updated carton numbers** — verify against photos of the real physical cards from Chile
- **RLS policies** — before sharing the link widely
