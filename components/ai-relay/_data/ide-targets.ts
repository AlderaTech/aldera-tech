import type { IdeTarget } from "@/lib/ai-relay-utils";
export const IDE_TARGETS: {
  id: IdeTarget;
  name: string;
  fileHint: string;
  docsUrl: string;
}[] = [
  {
    id: "cursor",
    name: "Cursor IDE",
    fileHint: "Cursor Settings > Models > OpenAI API Key & Base URL",
    docsUrl: "https://cursor.com",
  },
  {
    id: "cline",
    name: "Cline (VS Code)",
    fileHint: "cline_mcp_settings.json / Cline Extension Settings",
    docsUrl: "https://github.com/cline/cline",
  },
  {
    id: "roo",
    name: "Roo Code",
    fileHint: "Roo Code Settings > Providers > OpenAI Compatible",
    docsUrl: "https://github.com/RooVetGit/Roo-Code",
  },
  {
    id: "continue",
    name: "Continue.dev",
    fileHint: "~/.continue/config.json",
    docsUrl: "https://continue.dev",
  },
  {
    id: "openwebui",
    name: "OpenWebUI",
    fileHint: "docker-compose.yml / Admin Panel > Settings > Connections",
    docsUrl: "https://openwebui.com",
  },
];
