# Project Memory

## Core
Self-host runs the project as a Cloudflare Worker bundle (dist/server/) inside Docker via `wrangler dev --local`. Do NOT try to use `node .output/server/index.mjs` — this project does not produce a Node bundle. `vite build` outputs `dist/server/index.js` + `dist/server/wrangler.json` + `dist/client/`.
Lovable Cloud (Supabase project vuecrydmovopxobamyoz) stays as the database — only the frontend/SSR runs on the VPS.
Self-host repo: https://github.com/lmodirv-ship-it/future-hub-nexus
