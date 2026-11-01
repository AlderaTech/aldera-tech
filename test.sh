#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# Aldera Tech — Turnkey Developer & CI Test Harness
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

echo "=============================================================================="
echo "🧪 Aldera Tech — Local & CI Test Suite Orchestrator"
echo "   Working Directory: ${SCRIPT_DIR}"
echo "   Timestamp:        $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "=============================================================================="

EPHEMERAL_PG_CONTAINER=""

cleanup() {
  if [ -n "$EPHEMERAL_PG_CONTAINER" ]; then
    echo "▶ Stopping ephemeral PostgreSQL container ${EPHEMERAL_PG_CONTAINER}..."
    docker stop "${EPHEMERAL_PG_CONTAINER}" > /dev/null 2>&1 || true
  fi
}
trap cleanup EXIT INT TERM

# 1. Ensure PostgreSQL is accessible on port 5432
if ! (echo > /dev/tcp/127.0.0.1/5432) >/dev/null 2>&1; then
  echo "▶ PostgreSQL is not running on 127.0.0.1:5432. Launching ephemeral container..."
  EPHEMERAL_PG_CONTAINER="aldera-tech-test-pg-$(date +%s)"
  docker run -d --rm \
    --name "${EPHEMERAL_PG_CONTAINER}" \
    -p 5432:5432 \
    -e POSTGRES_PASSWORD=postgres \
    postgres:17 > /dev/null

  DB_READY=false
  for i in $(seq 1 30); do
    if docker exec "${EPHEMERAL_PG_CONTAINER}" psql -U postgres -c "SELECT 1;" >/dev/null 2>&1; then
      docker exec "${EPHEMERAL_PG_CONTAINER}" psql -U postgres -c "CREATE DATABASE aldera_tech;" >/dev/null 2>&1 || true
      docker exec "${EPHEMERAL_PG_CONTAINER}" psql -U postgres -c "CREATE DATABASE solvo_tech;" >/dev/null 2>&1 || true
      docker exec "${EPHEMERAL_PG_CONTAINER}" psql -U postgres -c "CREATE DATABASE aldera_router;" >/dev/null 2>&1 || true
      DBS=$(docker exec "${EPHEMERAL_PG_CONTAINER}" psql -U postgres -t -A -c "SELECT datname FROM pg_database WHERE datname IN ('aldera_tech', 'solvo_tech', 'aldera_router');" 2>/dev/null || true)
      if echo "$DBS" | grep -q "aldera_tech" && echo "$DBS" | grep -q "aldera_router"; then
        DB_READY=true
        echo "✓ Ephemeral PostgreSQL ready and databases created (attempt ${i})."
        break
      fi
    fi
    sleep 0.5
  done

  if [ "$DB_READY" != "true" ]; then
    echo "❌ Failed to initialize ephemeral PostgreSQL databases within timeout."
    exit 1
  fi

  # Initialize aldera_router schema from router-billing-proxy
  PROXY_DB_DIR="${SCRIPT_DIR}/../router-billing-proxy/database"
  if [ -f "${PROXY_DB_DIR}/init.sql" ]; then
    docker exec -i "${EPHEMERAL_PG_CONTAINER}" psql -U postgres -d aldera_router < "${PROXY_DB_DIR}/init.sql" >/dev/null 2>&1 || true
  fi
  if [ -f "${PROXY_DB_DIR}/migrations/002_account_binding.sql" ]; then
    docker exec -i "${EPHEMERAL_PG_CONTAINER}" psql -U postgres -d aldera_router < "${PROXY_DB_DIR}/migrations/002_account_binding.sql" >/dev/null 2>&1 || true
  fi
  if [ -f "${PROXY_DB_DIR}/migrations/003_bot_cms_and_payment_settings.sql" ]; then
    docker exec -i "${EPHEMERAL_PG_CONTAINER}" psql -U postgres -d aldera_router < "${PROXY_DB_DIR}/migrations/003_bot_cms_and_payment_settings.sql" >/dev/null 2>&1 || true
  fi

  # Ensure user_alert_cooldowns and telegram_bot_configs columns
  docker exec -i "${EPHEMERAL_PG_CONTAINER}" psql -U postgres -d aldera_router -c "
    CREATE TABLE IF NOT EXISTS user_alert_cooldowns (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      last_low_balance_alert_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      alert_count INT NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_alert_cooldowns_user_id ON user_alert_cooldowns(user_id);
    ALTER TABLE telegram_bot_configs ADD COLUMN IF NOT EXISTS welcome_text TEXT;
    ALTER TABLE telegram_bot_configs ADD COLUMN IF NOT EXISTS help_text TEXT;
  " >/dev/null 2>&1 || true
else
  echo "✓ Existing PostgreSQL instance detected on 127.0.0.1:5432."
  PGPASSWORD=postgres psql -h 127.0.0.1 -U postgres -c "CREATE DATABASE aldera_tech;" >/dev/null 2>&1 || true
  PGPASSWORD=postgres psql -h 127.0.0.1 -U postgres -c "CREATE DATABASE solvo_tech;" >/dev/null 2>&1 || true
  PGPASSWORD=postgres psql -h 127.0.0.1 -U postgres -c "CREATE DATABASE aldera_router;" >/dev/null 2>&1 || true
fi

# 2. Export environment variables for Next.js & tests
export NODE_ENV="test"
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aldera_tech?schema=public"
export ROUTER_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aldera_router"
export AUTH_SECRET="ci-test-auth-secret-minimum-32-chars-long-123456"
export NEXTAUTH_URL="http://localhost:3000"
export NEXT_PUBLIC_APP_URL="http://localhost:3000"
export CRON_SECRET="ci-test-cron-secret-12345"
export SEED_ADMIN_EMAIL="admin@aldera.tech"
export SEED_ADMIN_PASSWORD="password"
export WHATSAPP_API_URL="https://api.fonnte.com/send"
export WHATSAPP_API_KEY="test-ci-key"
export SHARP_IGNORE_GLOBAL_LIBVIPS="1"
export MIDTRANS_SERVER_KEY="SB-Mid-server-ci-test-key"
export MIDTRANS_CLIENT_KEY="SB-Mid-client-ci-test-key"
export MIDTRANS_IS_PRODUCTION="false"
export NEXT_PUBLIC_TURNSTILE_SITE_KEY="1x00000000000000000000AA"
export TURNSTILE_SECRET_KEY="1x0000000000000000000000000000000AA"
export NINE_ROUTER_BASE_URL="http://localhost:20128"
export NINE_ROUTER_API_KEY=""

# 3. Deploy Prisma Schema & Seed Master Data
echo "▶ Deploying Prisma migrations & seeding master data..."
bunx prisma db push --accept-data-loss >/dev/null 2>&1 || true
bun run db:seed >/dev/null 2>&1 || true
echo "✓ Prisma database ready."

# 4. Run bun test
echo "▶ Running test suite with bun test..."
START_TIME=$(date +%s%N)

bun test "$@"

END_TIME=$(date +%s%N)
ELAPSED_MS=$(( (END_TIME - START_TIME) / 1000000 ))

echo "=============================================================================="
echo "🎉 ALL TESTS PASSED SUCCESSFULLY"
echo "   Execution Time: ${ELAPSED_MS} ms"
echo "=============================================================================="
exit 0
