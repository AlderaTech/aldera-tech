import type { ReactNode } from "react";
import { Check, Copy, Code2, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./relay-code-window.module.css";

interface RelayCodeWindowProps {
  code: string;
  ideName: string;
  ideId: string;
  copied: boolean;
  onCopy: () => void;
}

function renderJsonValue(raw: string): ReactNode {
  const hasComma = raw.endsWith(",");
  const val = hasComma ? raw.slice(0, -1).trim() : raw.trim();
  const comma = hasComma ? "," : "";

  if (val.includes("sk-toko-") || val.includes("YOUR_API_KEY")) {
    return (
      <>
        <span className={styles.tokenApiKey}>{val}</span>
        {comma && <span className={styles.tokenPunctuation}>{comma}</span>}
      </>
    );
  }

  if (val.startsWith('"http://') || val.startsWith('"https://')) {
    return (
      <>
        <span className={styles.tokenUrl}>{val}</span>
        {comma && <span className={styles.tokenPunctuation}>{comma}</span>}
      </>
    );
  }

  if (val.startsWith('"') && val.endsWith('"')) {
    return (
      <>
        <span className={styles.tokenString}>{val}</span>
        {comma && <span className={styles.tokenPunctuation}>{comma}</span>}
      </>
    );
  }

  if (val === "{}" || val === "[]" || val === "{" || val === "[") {
    return (
      <>
        <span className={styles.tokenPunctuation}>{val}</span>
        {comma && <span className={styles.tokenPunctuation}>{comma}</span>}
      </>
    );
  }

  if (val === "true" || val === "false" || val === "null") {
    return (
      <>
        <span className={styles.tokenBoolean}>{val}</span>
        {comma && <span className={styles.tokenPunctuation}>{comma}</span>}
      </>
    );
  }

  if (!isNaN(Number(val)) && val.length > 0) {
    return (
      <>
        <span className={styles.tokenNumber}>{val}</span>
        {comma && <span className={styles.tokenPunctuation}>{comma}</span>}
      </>
    );
  }

  return (
    <>
      <span className={styles.tokenPlain}>{val}</span>
      {comma && <span className={styles.tokenPunctuation}>{comma}</span>}
    </>
  );
}

function renderJsonLine(line: string, index: number): ReactNode {
  const kvMatch = line.match(/^(\s*)("(?:[^"\\]|\\.)*")(\s*:\s*)(.*)$/);
  if (kvMatch) {
    const [, indent, key, colon, valueRaw] = kvMatch;
    return (
      <div key={index} className={styles.codeLine}>
        <span className={styles.tokenIndent}>{indent}</span>
        <span className={styles.tokenKey}>{key}</span>
        <span className={styles.tokenColon}>{colon}</span>
        {renderJsonValue(valueRaw)}
      </div>
    );
  }

  const strMatch = line.match(/^(\s*)("(?:[^"\\]|\\.)*")(,?)$/);
  if (strMatch) {
    const [, indent, str, comma] = strMatch;
    return (
      <div key={index} className={styles.codeLine}>
        <span className={styles.tokenIndent}>{indent}</span>
        {renderJsonValue(str)}
        {comma && <span className={styles.tokenPunctuation}>{comma}</span>}
      </div>
    );
  }

  const punctMatch = line.match(/^(\s*)([{\}[\]],?)(.*)$/);
  if (punctMatch) {
    const [, indent, punct, rest] = punctMatch;
    return (
      <div key={index} className={styles.codeLine}>
        <span className={styles.tokenIndent}>{indent}</span>
        <span className={styles.tokenPunctuation}>{punct}</span>
        {rest && <span className={styles.tokenPlain}>{rest}</span>}
      </div>
    );
  }

  return (
    <div key={index} className={styles.codeLine}>
      <span className={styles.tokenPlain}>{line}</span>
    </div>
  );
}

export function RelayCodeWindow({
  code,
  ideName,
  ideId,
  copied,
  onCopy,
}: RelayCodeWindowProps) {
  const lines = code.split("\n");
  const filename = `${ideId.toLowerCase()}.json`;

  return (
    <div className={styles.window}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.windowDots} aria-hidden="true">
            <i className={styles.dotClose} />
            <i className={styles.dotMin} />
            <i className={styles.dotMax} />
          </div>
          <div className={styles.tabPill}>
            <span className={styles.tabDot} aria-hidden="true" />
            <Code2 className="size-3.5 text-cyan-400" aria-hidden="true" />
            <span>{filename}</span>
          </div>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.formatTag}>
            <Terminal className="size-3" aria-hidden="true" />
            {ideName} · JSON
          </span>
          <button
            type="button"
            className={cn(styles.copyBtn, copied && styles.copyBtnCopied)}
            onClick={onCopy}
            aria-label={
              copied ? "Tersalin ke clipboard" : `Salin konfigurasi ${ideName}`
            }
          >
            {copied ? (
              <Check className="size-3.5" aria-hidden="true" />
            ) : (
              <Copy className="size-3.5" aria-hidden="true" />
            )}
            <span>{copied ? "Tersalin!" : "Salin Snippet"}</span>
          </button>
        </div>
      </div>
      <div
        className={styles.canvas}
        tabIndex={0}
        role="region"
        aria-label={`Konfigurasi JSON ${ideName}`}
      >
        <svg
          className={styles.watermark}
          width="160"
          height="160"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          aria-hidden="true"
        >
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
        <pre className={styles.codeBlock}>
          <div className={styles.gutter} aria-hidden="true">
            {lines.map((_, i) => (
              <span key={i} className={styles.lineNumber}>
                {i + 1}
              </span>
            ))}
          </div>
          <code className={styles.codeContent}>
            {lines.map((line, i) => renderJsonLine(line, i))}
          </code>
        </pre>
      </div>
      <div className={styles.statusBar} aria-hidden="true">
        <div className={styles.statusLeft}>
          <span className={styles.statusIndicator}>
            <span className={styles.statusDot} />
            OpenAI-Compatible
          </span>
          <span>UTF-8</span>
          <span>Ln {lines.length}, Col 1</span>
        </div>
        <div className={styles.statusRight}>
          <span>Aldera AI Relay</span>
        </div>
      </div>
    </div>
  );
}
