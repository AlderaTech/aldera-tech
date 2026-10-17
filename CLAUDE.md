@AGENTS.md

## AI & Engineering Guidelines

- Refer to `ai-agent-docs/ai-guidelines.md` for architectural, UI/UX, and language guidelines.
- **Git Branching & PR Rule**: Direct commit to `main` is **STRICTLY PROHIBITED**. Always create a dedicated branch (`feat/...`, `fix/...`), commit on that branch, create a Pull Request to `main`, and use **Squash and Merge**.
- **Test Maintenance Protocol**: For every code change, search for related tests (`find . -name "*.test.*"` or grep), execute them (`bun test <file.test.ts>`), and update/add test cases to maintain 100% test pass rate (`bun test`).
- **Mandatory UI Testing**: Every UI component, route page (`page.tsx`), interactive form, and modal **MUST** have a dedicated UI test (`*.test.tsx` or `*.test.ts`) co-located next to it, executed via `bun test`. Tests must verify JSX rendering, SEO metadata, zero hardcoded routes (`lib/routes.ts`), 4 UI states, and form input hygiene (refer to `ai-agent-docs/ui-testing.md`).
- **UI/UX Standards**: Ensure all interactive elements include `cursor-pointer`.
- **Modals**: Strictly prohibit `window.confirm()` and `window.alert()`. Use `<ConfirmDialog>` from `@/components/shared/confirm-dialog` and `toast` from `sonner`.
- **Skeleton Loading**: Provide `Skeleton` states for async operations and route transitions (`loading.tsx`).
- **Language**: Use consistent Indonesian with `"jam"` or `"j"` for duration units. Preserve standard technical terms (`API`, `Token`, `Database`).
