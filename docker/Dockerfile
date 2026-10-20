# syntax=docker/dockerfile:1

# ==============================================================================
# Stage 1: Dependencies
# ==============================================================================
FROM oven/bun:1-alpine AS deps

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ==============================================================================
# Stage 2: Builder
# ==============================================================================
FROM oven/bun:1-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_APP_URL=https://aldera.tech
ARG NEXTAUTH_URL=https://aldera.tech

ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN bunx prisma generate --no-hints
RUN bun run build

# ==============================================================================
# Stage 3: Runner
# ==============================================================================
FROM oven/bun:1-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Install runtime utilities: curl (healthcheck/cron) and su-exec (privilege dropping)
RUN apk add --no-cache curl su-exec busybox nodejs

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/package.json /app/bun.lock ./
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json ./tsconfig.json
COPY --from=builder --chown=nextjs:nodejs /app/lib ./lib
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Copy container entrypoint & crontab
COPY docker/entrypoint.sh /app/docker-entrypoint.sh
COPY docker/crontab /app/crontab
RUN chmod +x /app/docker-entrypoint.sh

# Setup uploads volume directory
RUN mkdir -p /app/public/uploads \
  && chown -R nextjs:nodejs /app/public/uploads

VOLUME ["/app/public/uploads"]

EXPOSE 3000

HEALTHCHECK --interval=20s --timeout=4s --start-period=15s --retries=3 \
  CMD curl -f http://127.0.0.1:3000/api/health || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]

CMD ["bun", "server.js"]
