# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
RUN pnpm install --frozen-lockfile

# Stage "build": serve anche al job di migrazione (ha sorgenti e tutte le dipendenze).
# I valori sotto servono solo a far partire la build: a runtime li sostituisce il compose.
FROM base AS build
ENV NEXT_TELEMETRY_DISABLED=1 \
    PAYLOAD_SECRET=solo-per-la-build \
    DATABASE_URL=postgres://build:build@localhost:5432/build \
    FRONTEND_PUBLIC_URL=http://localhost:3000 \
    BACKEND_PUBLIC_URL=http://localhost:3001
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS run
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0 MEDIA_DIR=/data/media
RUN addgroup -S app && adduser -S app -G app \
 && mkdir -p /data/media && chown -R app:app /data
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
COPY --from=build --chown=app:app /app/public ./public
USER app
EXPOSE 3000
CMD ["node", "server.js"]
