# syntax=docker/dockerfile:1
#
# deps -> build -> runner   (the production app image)
#     \-> tools             (one-shot jobs: drizzle migrate; seed / admin:create arrive in later phases)
#
# Build:  docker build --build-arg SITE_URL=https://vietdragon.vn --target runner .
# The build stage needs NO secrets (`.env*` is in .dockerignore). SITE_URL is the exception only
# because it is public and baked into the prerendered pages (canonical URLs); it has no default
# on purpose — an empty value fails the build with a clear message.
# Note: `next/font/google` downloads the fonts during `next build`, so the build needs internet.

ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app
# pnpm comes from the `packageManager` field — one pin, no version repeated here.
COPY package.json ./
RUN corepack enable && corepack install

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
# pnpm exits 0 even when an OPTIONAL dependency's download keeps failing (it just skips it), and Docker would
# then cache that half-installed layer. Prove the native modules load here so a bad install fails — and is
# never cached. Transitive ones are resolved from the package that loads them: @swc/core by next-intl's plugin
# (while reading next.config.ts), sharp by Next's image optimizer.
RUN node -e "const r = require; const from = (name, parent) => r(r.resolve(name, { paths: [r.resolve(parent)] })); r('@node-rs/argon2'); from('@swc/core', 'next-intl/plugin'); from('sharp', 'next'); console.log('native modules load')"

FROM base AS build
ARG SITE_URL
ENV SITE_URL=${SITE_URL} \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000
# `output: "standalone"` emits server.js + traced node_modules only; public/ and the static
# assets are copied explicitly. .next/cache is the one writable path (a volume in compose.yaml).
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
RUN mkdir -p .next/cache && chown node:node .next/cache
# Fail the BUILD, not the first sign-in, if standalone tracing left a native module out of the image.
# `sharp` is Next's own copy (the image optimizer), resolved from inside `next`, not our top-level dependency.
RUN node -e "const r = require; r('@node-rs/argon2'); r(r.resolve('sharp', { paths: [r.resolve('next')] })); console.log('native modules load')"
USER node
EXPOSE 3000
# /api/health answers 200 while the process serves requests (db state is in the body).
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -q -T 4 -O /dev/null http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "server.js"]

FROM node:${NODE_VERSION}-alpine AS tools
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY package.json tsconfig.json drizzle.config.ts ./
# drizzle.config.ts imports lib/env.ts, which imports lib/contact.ts.
COPY lib/env.ts lib/contact.ts ./lib/
COPY drizzle ./drizzle
USER node
# Invoked by path: corepack/pnpm would try to download pnpm again at run time as a non-root user.
CMD ["node_modules/.bin/drizzle-kit", "migrate"]
