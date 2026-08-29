# syntax=docker/dockerfile:1
#
# Node 22 — the previous base was Node 18, which reached end of life in April
# 2025 and stopped receiving security patches.
FROM node:22-alpine AS base

# ---------------------------------------------------------------------------
# Dependencies
# ---------------------------------------------------------------------------
FROM base AS deps
# libc6-compat and openssl are both for Prisma: its query engine is a native
# binary that links against them.
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json ./
# The schema has to be here before `npm ci`, not after: package.json declares a
# `postinstall` of `prisma generate`, which reads prisma/schema.prisma and fails
# the install without it. It costs a little cache — a schema edit now
# invalidates this layer — but the alternative, `--ignore-scripts`, would also
# skip the Prisma engine download and leave the client unusable.
COPY prisma ./prisma

# Cache mount so a rebuild that only changed source does not re-download the
# whole dependency tree.
RUN --mount=type=cache,target=/root/.npm npm ci

# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------
FROM base AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# `npm run build` is `prisma generate && next build`. No database is contacted:
# `prisma generate` only reads the schema, and every route handler that touches
# the database is marked `force-dynamic`, so nothing is prerendered against a
# database that does not exist at build time.
RUN npm run build

# ---------------------------------------------------------------------------
# Runtime
# ---------------------------------------------------------------------------
FROM base AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# No `COPY /app/public` here: this project has no public/ directory — the app
# router keeps its icons in app/ and nothing references a static asset. Add the
# copy back if a public/ folder is ever introduced, otherwise the build fails on
# a missing path.

# `output: 'standalone'` in next.config.js produces this: a minimal server with
# only the traced dependencies. Without that option the directory is never
# created — which is why this image had never built before.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma's generated client and its native query engine. Next's output tracing
# does not reliably pick up the engine binary, and without it every query fails
# at runtime with a missing-engine error.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# The schema is NOT applied here. This container only serves; `prisma db push`
# and seeding are run deliberately (see deploy/DEPLOY.md), so a container
# restart can never migrate the database on its own.
CMD ["node", "server.js"]
