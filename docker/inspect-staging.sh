#!/bin/sh
set -eu

# Read-only diagnostics; never print container environment or business payloads.
staging_container=aldera-tech-staging

show_staging_status() {
  docker inspect --format 'state={{.State.Status}} health={{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}} restarts={{.RestartCount}} exit={{.State.ExitCode}}' "$staging_container"
}

show_staging_startup() {
  docker logs --tail 100 "$staging_container" 2>&1 |
    sed -E \
      -e 's#(postgres(ql)?|https?)://[^[:space:]"<>]+#[REDACTED_URL]#g' \
      -e 's/([A-Za-z_]*(SECRET|TOKEN|PASSWORD|KEY)[A-Za-z_]*[=:])[[:space:]]*[^[:space:]]+/\1[REDACTED]/g' |
    grep -Ei 'Entrypoint|Error:|P[0-9]{4}|Prisma|Cannot find|not found|data loss|non-interactive|constraint|column|index|unique|enum|removed|drop|cast|changed|You are|ReferenceError|TypeError|schema push|Bun v|Next.js|Node.js' || true
}

show_staging_status
show_staging_startup

if [ "${VERIFY_STAGING_READY:-false}" = "true" ]; then
  attempt=0
  successes=0
  while [ "$attempt" -lt 20 ]; do
    attempt=$((attempt + 1))
    state=$(docker inspect --format '{{.State.Status}}' "$staging_container")
    code=000
    if [ "$state" = "running" ]; then
      code=$(docker exec "$staging_container" bun --eval 'import { AUTH_ROUTES } from "./lib/routes"; const response = await fetch(`http://127.0.0.1:3000${AUTH_ROUTES.login}`, { signal: AbortSignal.timeout(4000), redirect: "manual" }); process.stdout.write(String(response.status));' 2>/dev/null) || code=000
    fi
    if [ "$code" = "200" ]; then
      successes=$((successes + 1))
      if [ "$successes" -ge 3 ]; then
        echo '[Staging] Login is serving HTTP 200; application startup verified.'
        if ! docker exec "$staging_container" bun --eval 'import { API_ROUTES } from "./lib/routes"; const response = await fetch(`http://127.0.0.1:3000${API_ROUTES.health}`, { signal: AbortSignal.timeout(4000) }); if (response.status !== 200) process.exit(1);' 2>/dev/null; then
          echo '[Staging] ERROR: Critical dependencies failed full health verification.'
          exit 1
        fi
        echo '[Staging] Full dependency health is HTTP 200.'
        show_staging_status
        exit 0
      fi
    else
      successes=0
    fi
    sleep 2
  done
  echo '[Staging] ERROR: Application did not remain running with a reachable login page.'
  show_staging_status
  show_staging_startup
  exit 1
fi
