<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Aldera Tech Agent Instructions

## Documentation policy

- Start with [the AI docs index](ai-agent-docs/README.md) and read only the canonical documents relevant to the task.
- Update the existing source of truth when behavior or policy changes. Do not create per-task audit reports, file manifests, duplicated feature lists, or repeated test-result summaries in evergreen docs. Put run-specific evidence in the PR or CI.
- If a new documentation file seems useful but the user did not request one, explain the repo preference for updating canonical docs, give the proposed path and reason, offer the closest existing document as an alternative, and ask which option they want before creating it. Do not ask again when the user explicitly requested the new file.
- Keep a single dated release-readiness record only when it has an owner and a planned review. Label observations with the date they were verified; do not present old checks as current.
- Before removing or moving documentation, update its incoming links and index entries, and move any still-active rule to its canonical document.

## Workflow

- Work from a feature branch created from `origin/staging`; do not commit directly to `main` or `staging`.
- Target regular PRs at `staging` and use Squash and Merge. Promote to `main` only through a verified release PR.
- Follow [agent-workflow.md](ai-agent-docs/agent-workflow.md) for task completion, cleanup, documentation, and Git details.

## Code, tests, and verification

- For code changes, find and update relevant tests. Use `bun run test` (or a focused path); the repository runner prepares isolated databases. Run raw `bun test` only in a prepared test environment. Follow [testing-infrastructure.md](ai-agent-docs/testing-infrastructure.md).
- Add or update co-located UI tests for changed user-facing behavior. Cover only states and interactions that apply to the component. See [ui-testing.md](ai-agent-docs/ui-testing.md).
- Follow [code-quality.md](ai-agent-docs/code-quality.md), [ai-guidelines.md](ai-agent-docs/ai-guidelines.md), [roles-and-features.md](ai-agent-docs/roles-and-features.md), and [routes-and-navigation.md](ai-agent-docs/routes-and-navigation.md) when relevant.
- Run formatting, lint, Next type generation, and TypeScript checks for code changes. Read the matching Next.js guide before changing Next.js code.

## Environment, deployment, and portability

- Document new environment variables in `.env.example`; never overwrite or expose secrets in `.env`.
- For runtime, Docker, cron, port, volume, or stack changes, update [deployment.md](ai-agent-docs/deployment.md).
- Use relative repository links/imports or the `@/` alias. Do not write machine-local absolute paths into repository files.

## Completion report

Summarize the branch and Git status, changed files, relevant tests and their results, documentation updates, and verification results. Do not repeat a full change manifest inside project documentation.
