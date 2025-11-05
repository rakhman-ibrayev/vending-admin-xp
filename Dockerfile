# syntax=docker.io/docker/dockerfile:1

FROM node:22-alpine AS base

# ---------- deps ----------
FROM base AS deps
# libc6-compat is recommended for some native deps on alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy lockfiles; prefer the one present
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./

# Install deps based on lockfile
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# ---------- builder ----------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ---- Build-time envs (needed by Next.js during build) ----
# These ARGs are populated via docker build --build-arg or docker-compose build args
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_PHARMEXPRESS_COMPANY_BIN
ARG NEXT_PUBLIC_VENDING_MACHINE_HEARTBEAT_INTERVAL_MINS

# Expose them to the build (Next will inline NEXT_PUBLIC_*; the non-public can be used if needed)
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_PHARMEXPRESS_COMPANY_BIN=$NEXT_PUBLIC_PHARMEXPRESS_COMPANY_BIN
ENV NEXT_PUBLIC_VENDING_MACHINE_HEARTBEAT_INTERVAL_MINS=$NEXT_PUBLIC_VENDING_MACHINE_HEARTBEAT_INTERVAL_MINS
ENV NEXT_TELEMETRY_DISABLED=1

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# ---------- runner (standalone) ----------
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Run as non-root
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Static assets
COPY --from=builder /app/public ./public

# Standalone output (tiny runtime image)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js is created by Next.js standalone build
CMD ["node", "server.js"]
