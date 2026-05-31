# Lota Chilena 🎱

A digital implementation of the traditional Chilean family bingo game, built for real-time multiplayer across devices. Made so a Chilean family split between New Zealand and Chile can play their Sunday game together remotely — with the same rules, stakes, and social energy they'd have in person.

---

## What is Lota?

Lota is the Chilean version of bingo. It uses **90 numbers** and **50 pre-defined cartones** (3×9 cards with 5 numbers per row). Players mark their own cards as numbers are called. There are three sequential prize tiers:

| Prize | Description |
|-------|-------------|
| **Terna** | First player to mark 3 in a row on any row |
| **Línea** | First to complete an entire row |
| **Lota** | First to fill the entire card |

Each prize is worth a configurable percentage of the total pot. Prizes are sequential — Línea only opens after Terna is claimed, Lota only after Línea.

One player is the **Animador** (MC) who draws numbers and validates prize claims.

### El Pique

A side wager that runs concurrently with the main game. The first participating player to have any called number land on their card wins the pique pot. If multiple players tie on the same number, they vote to split equally or keep drawing until the tie breaks.

---

## Features

- **50 cartones** with correct 3×9 structure and 5 numbers per row
- **Three prize tiers** (Terna → Línea → Lota) with sequential unlocking
- **Configurable prize percentages** and stake amount set by the MC before the game
- **El Pique** — opt-in side wager with tie-break voting (split or keep drawing)
- **MC Control Tower** — animated draw button, full number matrix (1–90), scrollable game log
- **Request-then-validate anti-cheat** — players claim prizes, MC approves or rejects; validation checks marks against called numbers
- **Snoop view** — MC can inspect all players' cards in real time (green = correct mark, red = incorrect, yellow = missed called number)
- **Session statistics** — running balance, wins per prize type, and total wagered across all rounds
- **Skin selector** — choose your marker: classic dot, X, Poroto, Peso $1, Peso $5, 20 Lucas
- **Sound settings** — classic Web Audio API tones or Chilean sound effects (pop/win/alert)
- **MC handover** — transfer the Animador role to another player mid-lobby without losing settings or balances
- **Language toggle** — 🇨🇱 Spanish (default) / 🇳🇿 English on every screen
- **Demo mode** — simulated players auto-mark their numbers so the snoop view shows realistic behavior

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Inline CSS (single-file, no external stylesheet) |
| Fonts | Google Fonts — Lobster + Nunito |
| Audio | Web Audio API (tones) + HTML Audio (MP3 files) |
| State | React `useState` / `useCallback` / `useRef` |
| Build | Vite |

The entire app lives in a single file: `src/LotaChilena.jsx`. This was a deliberate choice for the prototype phase — easy to read, easy to port to Supabase later.

---

## Running Locally

```bash
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

To build for production:

```bash
npm run build
```

---

## Infrastructure (Deployment Plan)

### Frontend — Cloudflare Pages (free)
The built React/Vite app is deployed here. Cloudflare Pages offers unlimited bandwidth on the free tier, a global CDN with excellent latency to both Chile and New Zealand, automatic deploys from GitHub on every push, and free SSL.

**Setup:** connect via GitHub repository, set build command to `npm run build`, output directory to `dist`.

### Backend — Supabase (free tier → $25/month Pro)
Supabase provides everything beyond the frontend:
- **PostgreSQL database** — rooms, players, game state, and history
- **Real-time subscriptions** — broadcast number draws and game events instantly to all connected devices
- **Storage buckets** — skin images and custom sound files with permanent CDN URLs

**Key tables needed:**
- `rooms` — code, settings, status, creation date, last activity
- `players` — room code, name, carton index, marked numbers, balance, skin, normalized_name
- `games` — room code, called numbers, prizes, log, status
- `storage` — `skins` and `sounds` public buckets

### Domain — NIC Chile (nic.cl), ~$10–15 USD/year
`.cl` domains are registered at nic.cl. Foreign individuals can register using a passport — a Chilean RUT is not required. Point the domain's nameservers to Cloudflare (free DNS management), then connect the custom domain inside Cloudflare Pages. SSL is automatic.

**Full flow:** `lota.cl` → Cloudflare Pages serves the React app → app calls Supabase for all data → Supabase broadcasts events to all players in real time.

---

## Planned Features (Supabase Integration)

- **Persistent rooms with URL-based joining** — `lota.cl/ABC123` restores full game state on refresh
- **Player reconnection by name** — rejoin a room with the same name to restore your card, marks, and balance (name matching is case-insensitive, accent-insensitive, and space-insensitive via a `normalized_name` field)
- **Automatic room cleanup** — Supabase Edge Function deletes rooms inactive for 30+ days
- **Custom draw sounds** — upload your own MP3s per number (1.mp3 … 90.mp3) stored in Supabase Storage

---

## Project Structure

```
src/
  LotaChilena.jsx    # entire app — components, logic, styles, data
public/
  skins/             # marker skin images (Poroto, Peso, 20 Lucas, etc.)
  sounds/            # sound effects (pop.mp3, win.mp3, alert.mp3)
  lota-logo.png
```

---

## Adjustable Constants

At the top of `src/LotaChilena.jsx`:

```js
const VISIBLE_LAST_CALLS = 3;  // how many past numbers non-MC players see (0–9)
```
