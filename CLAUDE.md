@AGENTS.md

## AI & Engineering Guidelines
- Refer to `docs/ai-guidelines.md` for architectural, UI/UX, and language guidelines.
- **UI/UX Standards**: Ensure all interactive elements include `cursor-pointer`.
- **Modals**: Strictly prohibit `window.confirm()` and `window.alert()`. Use `<ConfirmDialog>` from `@/components/shared/confirm-dialog` and `toast` from `sonner`.
- **Skeleton Loading**: Provide `Skeleton` states for async operations and route transitions (`loading.tsx`).
- **Language**: Use consistent Indonesian with `"jam"` or `"j"` for duration units. Preserve standard technical terms (`API`, `Token`, `Database`).
