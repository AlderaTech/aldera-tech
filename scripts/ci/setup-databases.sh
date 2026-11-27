#!/bin/sh
set -eu

# Fixed, ephemeral GitHub Actions service only. Never target VPS/application data.
test "${CI:-}" = "true" || { echo "CI test service required" >&2; exit 1; }
bun --no-env-file -e 'import {assertTestDatabaseUrl} from "./lib/test-database-url.ts"; assertTestDatabaseUrl(process.env.DATABASE_URL); assertTestDatabaseUrl(process.env.ROUTER_DATABASE_URL);'
export PGPASSWORD=postgres
psql -h localhost -U postgres -v ON_ERROR_STOP=1 -c "CREATE DATABASE aldera_router_test;"
bunx prisma db push

router_dir=.server-infra/roles/applications/aldera-router-setup/files
test -f "$router_dir/init.sql" || { echo "Pinned router schema is missing" >&2; exit 1; }
psql -h localhost -U postgres -v ON_ERROR_STOP=1 -d aldera_router_test -f "$router_dir/init.sql"
for file in "$router_dir"/migrations/*.sql "$router_dir"/seeds/*.sql; do
  if [ -f "$file" ]; then
    psql -h localhost -U postgres -v ON_ERROR_STOP=1 -d aldera_router_test -f "$file"
  fi
done
psql -h localhost -U postgres -v ON_ERROR_STOP=1 -d aldera_router_test -c '
  CREATE TABLE IF NOT EXISTS user_alert_cooldowns (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    last_low_balance_alert_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    alert_count INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );'
