#!/usr/bin/env bun
/**
 * Aldera Tech - Automated Secret Leak & Pre-Flight Config Drift Scanner
 *
 * Verifies synchronization between local environment contracts (.env.example)
 * and production deployment templates (aldera.env.j2), and ensures that no
 * unparameterized plaintext secrets or live credentials are leaked.
 *
 * Usage:
 *   bun run scripts/scan-config-drift.ts [options]
 *
 * Options:
 *   --example <path>      Path to .env.example (default: auto-detected)
 *   --template <path>     Path to aldera.env.j2 (default: auto-detected)
 *   --allowlist <keys>    Comma-separated list of additional allowlisted container variables
 */

import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

// ANSI styling helpers for clear CI reporting
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const CYAN = "\x1b[36m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

const DEFAULT_ALLOWLIST = new Set([
  "NODE_ENV",
  "PORT",
  "HOSTNAME",
  "AUTO_MIGRATE",
]);

// Sensitive keys that must be securely parameterized in Ansible templates
const SENSITIVE_KEYS = new Set([
  "AUTH_SECRET",
  "CRON_SECRET",
  "DATABASE_URL",
  "ROUTER_DATABASE_URL",
  "WHATSAPP_API_KEY",
  "MIDTRANS_SERVER_KEY",
  "MIDTRANS_CLIENT_KEY",
  "TURNSTILE_SECRET_KEY",
  "SEED_ADMIN_PASSWORD",
  "NINE_ROUTER_API_KEY",
]);

interface ParsedEnv {
  keys: Map<string, string>;
  rawLines: string[];
}

function parseEnvFile(filePath: string): ParsedEnv {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const keys = new Map<string, string>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith("#")) continue;

    const eqIdx = line.indexOf("=");
    if (eqIdx <= 0) continue;

    const key = line.slice(0, eqIdx).trim();
    let val = line.slice(eqIdx + 1).trim();

    // Strip surrounding quotes if present
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }

    keys.set(key, val);
  }

  return { keys, rawLines: lines };
}

function parseArgs(): {
  examplePath: string;
  templatePath: string;
  allowlist: Set<string>;
} {
  const args = process.argv.slice(2);
  let exampleArg: string | undefined;
  let templateArg: string | undefined;
  const allowlist = new Set(DEFAULT_ALLOWLIST);

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--example" && args[i + 1]) {
      exampleArg = args[++i];
    } else if (args[i] === "--template" && args[i + 1]) {
      templateArg = args[++i];
    } else if (args[i] === "--allowlist" && args[i + 1]) {
      args[++i].split(",").forEach((k) => allowlist.add(k.trim()));
    }
  }

  // Resolve .env.example
  const exampleCandidates = [
    exampleArg,
    resolve(process.cwd(), ".env.example"),
    resolve(process.cwd(), "aldera-tech/.env.example"),
    resolve(__dirname, "../.env.example"),
  ].filter(Boolean) as string[];

  let resolvedExample = "";
  for (const c of exampleCandidates) {
    if (existsSync(c)) {
      resolvedExample = resolve(c);
      break;
    }
  }

  // Resolve aldera.env.j2
  const templateCandidates = [
    templateArg,
    resolve(process.cwd(), "../server-infra-with-ansible/roles/applications/portfolio-apps/templates/aldera.env.j2"),
    resolve(process.cwd(), ".server-infra/roles/applications/portfolio-apps/templates/aldera.env.j2"),
    resolve(process.cwd(), "server-infra-with-ansible/roles/applications/portfolio-apps/templates/aldera.env.j2"),
    resolve(process.cwd(), "aldera.env.j2"),
    resolve(__dirname, "../../server-infra-with-ansible/roles/applications/portfolio-apps/templates/aldera.env.j2"),
  ].filter(Boolean) as string[];

  let resolvedTemplate = "";
  for (const c of templateCandidates) {
    if (existsSync(c)) {
      resolvedTemplate = resolve(c);
      break;
    }
  }

  if (!resolvedExample) {
    console.error(`${RED}[ERROR] Could not locate .env.example. Checked paths:${RESET}`);
    exampleCandidates.forEach((c) => console.error(`  - ${c}`));
    process.exit(1);
  }

  if (!resolvedTemplate) {
    console.error(`${RED}[ERROR] Could not locate aldera.env.j2. Checked paths:${RESET}`);
    templateCandidates.forEach((c) => console.error(`  - ${c}`));
    process.exit(1);
  }

  return {
    examplePath: resolvedExample,
    templatePath: resolvedTemplate,
    allowlist,
  };
}

export function runConfigDriftScan(options?: {
  examplePath?: string;
  templatePath?: string;
  allowlist?: Set<string>;
}): { success: boolean; errors: string[] } {
  const { examplePath, templatePath, allowlist } =
    options?.examplePath && options?.templatePath
      ? {
          examplePath: options.examplePath,
          templatePath: options.templatePath,
          allowlist: options.allowlist ?? DEFAULT_ALLOWLIST,
        }
      : parseArgs();

  console.log(`${BOLD}${CYAN}================================================================${RESET}`);
  console.log(`${BOLD}${CYAN}      Aldera Tech — Pre-Flight Config Drift & Secret Scan      ${RESET}`);
  console.log(`${BOLD}${CYAN}================================================================${RESET}`);
  console.log(`📁 Contract (.env.example): ${examplePath}`);
  console.log(`📁 Template (aldera.env.j2): ${templatePath}`);
  console.log(`🛡️  Allowlist: ${Array.from(allowlist).join(", ")}\n`);

  const example = parseEnvFile(examplePath);
  const template = parseEnvFile(templatePath);

  const errors: string[] = [];

  // 1. DRIFT DETECTION: .env.example vs aldera.env.j2
  console.log(`${BOLD}1. Configuration Drift Check:${RESET}`);
  const exampleKeySet = new Set(example.keys.keys());
  const templateKeySet = new Set(template.keys.keys());

  // Check for keys in .env.example missing from aldera.env.j2
  const missingInTemplate: string[] = [];
  for (const key of exampleKeySet) {
    if (!templateKeySet.has(key) && !allowlist.has(key)) {
      missingInTemplate.push(key);
    }
  }

  // Check for undeclared keys in aldera.env.j2 not in .env.example
  const undeclaredInTemplate: string[] = [];
  for (const key of templateKeySet) {
    if (!exampleKeySet.has(key) && !allowlist.has(key)) {
      undeclaredInTemplate.push(key);
    }
  }

  if (missingInTemplate.length > 0) {
    const msg = `Keys declared in .env.example but MISSING from aldera.env.j2: ${missingInTemplate.join(", ")}`;
    errors.push(msg);
    console.log(`  ${RED}✗ FAIL${RESET}: ${msg}`);
  } else {
    console.log(`  ${GREEN}✓ PASS${RESET}: All keys in .env.example are present in aldera.env.j2.`);
  }

  if (undeclaredInTemplate.length > 0) {
    const msg = `Undeclared deployment keys in aldera.env.j2 missing from .env.example: ${undeclaredInTemplate.join(", ")}`;
    errors.push(msg);
    console.log(`  ${RED}✗ FAIL${RESET}: ${msg}`);
  } else {
    console.log(`  ${GREEN}✓ PASS${RESET}: No undeclared keys found in aldera.env.j2.`);
  }

  // 2. SECRET LEAK & PARAMETERIZATION CHECK in aldera.env.j2
  console.log(`\n${BOLD}2. Template Secret Parameterization Check (aldera.env.j2):${RESET}`);
  let templateLeakDetected = false;

  for (const [key, value] of template.keys.entries()) {
    // If it's a known sensitive key or looks like a secret/password/token
    const isSensitive =
      SENSITIVE_KEYS.has(key) ||
      key.includes("SECRET") ||
      key.includes("PASSWORD") ||
      key.includes("TOKEN") ||
      key.includes("PRIVATE_KEY");

    if (isSensitive) {
      // Must be empty or parameterized with Jinja2 expressions (e.g. {{ vault_... }})
      const isParameterized =
        value === "" ||
        /\{\{\s*vault_.*\}\}/.test(value) ||
        /\{\{.*\}\}/.test(value);

      if (!isParameterized) {
        templateLeakDetected = true;
        const msg = `Unparameterized plaintext secret in aldera.env.j2 for key '${key}'! Found literal value instead of Jinja2 vault template.`;
        errors.push(msg);
        console.log(`  ${RED}✗ LEAK DETECTED${RESET}: ${key} = ${value.slice(0, 4)}***`);
      }
    }
  }

  if (!templateLeakDetected) {
    console.log(`  ${GREEN}✓ PASS${RESET}: All sensitive keys in aldera.env.j2 are safely parameterized via Jinja2/vault.`);
  }

  // 3. SECRET LEAK CHECK in .env.example (repository commitment safety)
  console.log(`\n${BOLD}3. Repository Credential Safety Check (.env.example):${RESET}`);
  let exampleLeakDetected = false;

  for (const [key, value] of example.keys.entries()) {
    // Check for live Midtrans production keys (Mid-server-...)
    if (key.includes("MIDTRANS") && /Mid-server-[a-zA-Z0-9_-]{20,}/.test(value)) {
      exampleLeakDetected = true;
      const msg = `Live production Midtrans server key detected in .env.example under '${key}'!`;
      errors.push(msg);
      console.log(`  ${RED}✗ LEAK DETECTED${RESET}: ${msg}`);
    }

    // Check for actual live JWTs or private keys
    if (/eyJ[a-zA-Z0-9_-]{20,}\.eyJ[a-zA-Z0-9_-]{20,}/.test(value)) {
      exampleLeakDetected = true;
      const msg = `Live JWT bearer token detected in .env.example under '${key}'!`;
      errors.push(msg);
      console.log(`  ${RED}✗ LEAK DETECTED${RESET}: ${msg}`);
    }

    if (value.includes("BEGIN PRIVATE KEY") || value.includes("BEGIN RSA PRIVATE KEY")) {
      exampleLeakDetected = true;
      const msg = `Private cryptographic key detected in .env.example under '${key}'!`;
      errors.push(msg);
      console.log(`  ${RED}✗ LEAK DETECTED${RESET}: ${msg}`);
    }
  }

  if (!exampleLeakDetected) {
    console.log(`  ${GREEN}✓ PASS${RESET}: No live credentials or private keys detected in .env.example.`);
  }

  // Summary
  console.log(`\n${BOLD}${CYAN}================================================================${RESET}`);
  if (errors.length === 0) {
    console.log(`${BOLD}${GREEN}  ✓ SCAN PASSED: 0 configuration drifts, 0 secret leaks detected.${RESET}`);
    console.log(`${BOLD}${CYAN}================================================================${RESET}\n`);
    return { success: true, errors: [] };
  } else {
    console.log(`${BOLD}${RED}  ✗ SCAN FAILED: ${errors.length} violation(s) detected.${RESET}`);
    errors.forEach((err, idx) => console.log(`    ${idx + 1}. ${err}`));
    console.log(`${BOLD}${CYAN}================================================================${RESET}\n`);
    return { success: false, errors };
  }
}

if (import.meta.main) {
  const result = runConfigDriftScan();
  if (!result.success) {
    process.exit(1);
  }
}
