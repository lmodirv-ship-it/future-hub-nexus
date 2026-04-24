# ============================================================
# Stage 1: Build the TanStack Start app with Bun
# ============================================================
FROM oven/bun:1 AS builder

WORKDIR /app

# Build-time public env vars (baked into the client bundle by Vite)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_PROJECT_ID
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID

# Force the Node preset so the app runs on a regular Node server
# (instead of Cloudflare Workers, which needs wrangler at runtime)
ENV NITRO_PRESET=node-server

COPY package.json bun.lock* bunfig.toml* ./
RUN bun install --frozen-lockfile || bun install

COPY . .
RUN bun run build

# ============================================================
# Stage 2: Tiny Node runtime that serves the built app
# ============================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Copy only what the server needs
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
