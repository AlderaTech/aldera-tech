#!/bin/sh
set -e

# ==============================================================================
# Aldera Tech Container Entrypoint
# ==============================================================================

PORT="${PORT:-3000}"
ENABLE_CRON="${ENABLE_CRON:-true}"

echo "[Entrypoint] Initializing Aldera Tech application..."

# 1. Run database migration if AUTO_MIGRATE=true
if [ "${AUTO_MIGRATE}" = "true" ]; then
  echo "[Entrypoint] AUTO_MIGRATE is enabled. Running prisma db push..."
  if bunx prisma db push; then
    echo "[Entrypoint] Database schema push succeeded."
  else
    echo "[Entrypoint] WARNING: Database push failed. Continuing with startup..."
  fi
fi

# 2. Setup and launch crond background worker
if [ "${ENABLE_CRON}" = "true" ] && [ -n "${CRON_SECRET}" ]; then
  echo "[Entrypoint] Setting up background cron jobs..."

  # Create wrapper script for cron execution with current environment variables
  cat <<EOF > /app/run-cron.sh
#!/bin/sh
ENDPOINT="\$1"
PORT="${PORT}"
CRON_SECRET="${CRON_SECRET}"

curl -s -f -H "Authorization: Bearer \${CRON_SECRET}" "http://127.0.0.1:\${PORT}/api/cron/\${ENDPOINT}" > /dev/null 2>&1
EOF
  chmod +x /app/run-cron.sh

  # Install crontab for nextjs user
  mkdir -p /etc/crontabs
  cat <<EOF > /etc/crontabs/nextjs
# Invoice Reminder (Daily 09:00 WIB / 02:00 UTC)
0 2 * * * /app/run-cron.sh invoice-reminder
# Issue Recurring Invoices (Daily 00:01 WIB / 17:01 UTC)
1 17 * * * /app/run-cron.sh issue-recurring
# Publish Scheduled Blog Posts (Every 15 minutes)
*/15 * * * * /app/run-cron.sh publish-scheduled
# AI Relay Low Balance Guard (Every 30 minutes)
*/30 * * * * /app/run-cron.sh balance-guard
EOF
  chmod 0600 /etc/crontabs/nextjs

  # Start BusyBox crond daemon in background
  crond -b -l 8 -c /etc/crontabs
  echo "[Entrypoint] Background cron daemon started successfully."
elif [ "${ENABLE_CRON}" = "true" ] && [ -z "${CRON_SECRET}" ]; then
  echo "[Entrypoint] INFO: CRON_SECRET is not set. Internal cron daemon skipped."
else
  echo "[Entrypoint] INFO: ENABLE_CRON is set to false. Internal cron daemon disabled."
fi

# 3. Ensure uploads folder exists
mkdir -p /app/public/uploads

echo "[Entrypoint] Starting application on port ${PORT}..."
if [ "$(id -u)" = "0" ]; then
  chown -R nextjs:nodejs /app/public/uploads
  exec su-exec nextjs "$@"
else
  exec "$@"
fi
