# syntax=docker/dockerfile:1

# ==============================================================================
# Stage 1: Dependencies
# ==============================================================================
FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# ==============================================================================
# Stage 2: Builder
# ==============================================================================
FROM node:22-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_APP_URL=https://aldera.tech
ARG NEXTAUTH_URL=https://aldera.tech

ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate --no-hints
RUN npm run build

# ==============================================================================
# Stage 3: Runner
# ==============================================================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Install runtime utilities: curl (healthcheck/cron) and su-exec (privilege dropping)
RUN apk add --no-cache curl su-exec busybox

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/package.json /app/package-lock.json* ./
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

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://127.0.0.1:3000/ || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]

CMD ["node", "server.js"]
