# Closer — Couples Card Game (MVP)

A React + Vite starter for a two-player couples card game with eight categories, five depth levels, flip cards, and a random mode.

## What's included

- React + Vite frontend
- Black, burgundy, and gold visual design
- Six categories and five levels
- A starter set of sample cards (not yet the full 300-card library)
- Flip-to-reveal cards, follow-up prompts, random cards
- Supabase Realtime Broadcast wiring for a shared room
- Responsive desktop and mobile layout

## Requirements

- Node.js 20 or newer (Node.js 22 LTS is a good choice)
- npm
- A Supabase project for cross-device room synchronization

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

The app runs in **local preview mode** until Supabase environment variables are set. In local preview mode, the UI works, but state is not synchronized across browsers/devices.

## Enable shared rooms with Supabase

1. Create a project at https://supabase.com.
2. In Project Settings → API, copy the Project URL and the anon/publishable key.
3. Add them to `.env`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY
```

4. Stop and restart Vite after changing `.env`.
5. Open the app in two browsers/devices.
6. Enter the exact same room code on both devices and press Join.

This MVP uses Supabase Realtime Broadcast and does not need a database table. The room code is not authentication; use an unguessable room code and do not include sensitive details in it. For a public release, add room access controls, a proper host/join flow, and reconnect/state recovery.

## Build for production

```bash
npm run build
npm run preview
```

The production build is generated in `dist/`.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel, import the repository.
3. Set the framework preset to **Vite**.
4. Set the build command to `npm run build`.
5. Set the output directory to `dist`.
6. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as project environment variables.
7. Deploy.

Alternative: Netlify can deploy the same Vite app with build command `npm run build` and publish directory `dist`.

## Project structure

```text
closer-app/
├── index.html
├── package.json
├── vite.config.js
├── .env.example
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── styles.css
    ├── data/
    │   └── cards.js
    └── lib/
        └── supabase.js
```

## Important current MVP limitations

- This is a scaffold/prototype, not a finished product.
- Content currently contains a small starter set rather than 50 complete cards per category.
- Cross-device synchronization requires valid Supabase settings and should be tested before relying on it.
- Broadcast sync is a lightweight prototype. It does not provide authentication, durable saved sessions, or robust reconnect recovery.
- The Random mode currently uses simple symbolic illustrations (emoji/symbols), not a curated image library.
- Do not deploy intimate content or private user information without reviewing privacy, consent, and security requirements.


Latest update: two optional decks were added: Strip Quiz (with pre-agreed clothing-layer choices and opt-outs) and Pose Cards (tasteful, camera-friendly prompts). These are text prompts; individual illustrative images are not included yet.


## Realtime room notes

- Both players must open the same room link and the project must have valid Supabase URL and anon key values in `.env`.
- On joining, a tab requests the current state from a partner already connected to that room; card actions are then broadcast to both tabs.
- Broadcast is ephemeral, not durable storage. If neither player is online, the previous game state is not saved. Room codes are not authentication, so do not share sensitive information.
- This starter does not yet include conflict resolution for both players changing cards at exactly the same time.


## V10 gameplay updates

- Choosing a deck opens its dedicated play screen with Level 1 selected.
- Only one card is shown at a time. Its prompt stays hidden until the card is flipped.
- Levels 1–5 load their own shuffled card deck; Next and Previous navigate within the selected level.
- Desktop uses side arrows; mobile uses Previous/Next controls below the card.
- Pose Cards alone display reference photos. The project includes 20 individual pose images in `public/pose-images/`, mapped one-to-one to the 20 Pose Cards. Other categories remain text-only.
