import type { IdeTarget, ModelCategory } from "@/lib/ai-relay-utils";

// The existing public configuration endpoint, shared by the preview and presets.
export const RELAY_BASE_URL = "https://aldera.tech/api/relay";

export const CATEGORY_TABS: { label: string; value: ModelCategory }[] = [
  { label: "Semua", value: "All" },
  { label: "Coding", value: "Coding" },
  { label: "Reasoning", value: "Reasoning" },
  { label: "Vision", value: "Vision" },
  { label: "Fast", value: "Fast" },
  { label: "Budget", value: "Budget" },
];

export const IDE_TARGETS: { id: IdeTarget; name: string }[] = [
  { id: "cursor", name: "Cursor IDE" },
  { id: "cline", name: "Cline (VS Code)" },
  { id: "roo", name: "Roo Code" },
  { id: "continue", name: "Continue.dev" },
  { id: "openwebui", name: "OpenWebUI" },
];
