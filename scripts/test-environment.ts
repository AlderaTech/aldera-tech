import { existsSync } from "node:fs";
import { dirname, join, delimiter } from "node:path";
import { spawnSync } from "node:child_process";

export function testEnvironment(
  databaseUrl: string,
  routerUrl: string
): Record<string, string> {
  const environment: Record<string, string> = {};
  for (const key of [
    "PATH",
    "Path",
    "SystemRoot",
    "WINDIR",
    "COMSPEC",
    "TEMP",
    "TMP",
    "USERPROFILE",
    "LOCALAPPDATA",
    "APPDATA",
    "HOME",
    "CI",
  ])
    if (process.env[key]) environment[key] = process.env[key]!;
  if (process.platform === "win32") {
    const git = spawnSync("git", ["--exec-path"], {
      encoding: "utf8",
      windowsHide: true,
    });
    if (git.status === 0) {
      const tools = join(
        dirname(dirname(dirname(git.stdout.trim()))),
        "usr",
        "bin"
      );
      if (existsSync(join(tools, "sh.exe")))
        environment.PATH = `${tools}${delimiter}${environment.PATH ?? environment.Path ?? ""}`;
    }
  }
  if (environment.PATH) delete environment.Path;
  return {
    ...environment,
    NODE_ENV: "test",
    DATABASE_URL: databaseUrl,
    ROUTER_DATABASE_URL: routerUrl,
    AUTH_SECRET: "isolated-test-secret-not-a-live-credential-123456",
    NEXTAUTH_URL: "http://localhost:3000",
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    CRON_SECRET: "isolated-test-cron-secret",
    WHATSAPP_API_URL: "http://127.0.0.1:1",
    WHATSAPP_API_KEY: "test-only",
    NINE_ROUTER_BASE_URL: "http://127.0.0.1:1",
    NINE_ROUTER_API_KEY: "",
    TELEGRAM_BOT_TOKEN: "",
    BOT_TOKEN: "",
    TELEGRAM_API_BASE_URL: "http://127.0.0.1:1",
    MIDTRANS_SERVER_KEY: "dummy_midtrans_server_key",
    MIDTRANS_CLIENT_KEY: "",
    MIDTRANS_IS_PRODUCTION: "false",
    TURNSTILE_SECRET_KEY: "",
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: "",
    SMTP_HOST: "127.0.0.1",
    SMTP_PORT: "1",
    SMTP_PASSWORD: "",
    SHARP_IGNORE_GLOBAL_LIBVIPS: "1",
  };
}
