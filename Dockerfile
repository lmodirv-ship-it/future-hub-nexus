# ============================================================
# Stage 1: Build the TanStack Start app with Bun
# Produces a Cloudflare Worker bundle in dist/ (server + client)
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

COPY package.json bun.lock* bunfig.toml* ./
RUN bun install --frozen-lockfile || bun install

COPY . .
RUN bun run build

# ============================================================
# Stage 2: Run the worker bundle locally with Wrangler (workerd)
# This works on any VPS — no Cloudflare account needed at runtime.
# ============================================================
FROM oven/bun:1 AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Bring in the built worker bundle (server + client assets) and
# enough package metadata so wrangler can resolve its config.
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/wrangler.jsonc ./wrangler.jsonc

# Install wrangler only (small) so we can serve the worker locally.
RUN bun add -g wrangler@^4

EXPOSE 3000

# Serve the production worker bundle via wrangler dev in --local mode.
# --ip 0.0.0.0 makes it reachable from outside the container,
# --port 3000 matches what nginx proxies to,
# --no-show-interactive-dev-session keeps logs clean for `docker logs`.
CMD ["wrangler", "dev", "--local", "--ip", "0.0.0.0", "--port", "3000", "--no-show-interactive-dev-session", "--config", "dist/server/wrangler.json"]
