# syntax=docker/dockerfile:1
#
# Three stages: install once, build once, then ship a runtime image that
# still has `prisma` and `tsx` available — Coolify's post-deployment command
# (or a one-off exec into the running container) needs them to run
# `npm run db:deploy` / `db:seed-admin` / `db:import-content` against the
# database, which only resolves from inside this same network, never from
# outside it.

FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
# The base image's bundled npm is older than the npm that wrote
# package-lock.json; `npm ci` is strict about matching that exact format.
RUN npm install -g npm@11
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* values are inlined into the client bundle at build time, and
# the project/post detail pages are statically generated from the database
# (generateStaticParams), so both must be reachable during the build itself —
# mark them "Available at Buildtime" for this app in Coolify.
# NEXT_SERVER_ACTIONS_ENCRYPTION_KEY must be identical at build time and at
# runtime (and across every rebuild/replica) — otherwise a page built with one
# key can't call actions verified against another, which is where "Server
# Reference ID did not match the expected format" comes from.
ARG DATABASE_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_SERVER_ACTIONS_ENCRYPTION_KEY
ENV DATABASE_URL=$DATABASE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=$NEXT_SERVER_ACTIONS_ENCRYPTION_KEY

RUN npm run build

# Drop devDependencies (TypeScript, ESLint, Tailwind's build tooling, …) now
# that the build output exists; prisma/tsx/dotenv stay, since they're
# regular dependencies.
RUN npm prune --omit=dev

FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/src/generated ./src/generated

# Uploaded images/CVs. Mount a persistent volume at /app/storage in Coolify —
# without one, anything uploaded from the dashboard is lost on redeploy.
RUN mkdir -p storage/uploads && chown -R nextjs:nodejs storage

USER nextjs
EXPOSE 3000

CMD ["npm", "run", "start"]
