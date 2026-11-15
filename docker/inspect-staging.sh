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
    grep -Ei 'Entrypoint|Error:|P[0-9]{4}|Prisma|Cannot find|not found|data loss|non-interactive|constraint|column|index|unique|You are|ReferenceError|TypeError|schema push|Bun v|Next.js|Node.js' || true
}

show_staging_status
show_staging_startup
