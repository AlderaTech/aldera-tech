/**
 * HTML Sanitizer Helper
 *
 * Strips dangerous HTML tags (<script>, <object>, <embed>, <iframe>),
 * inline event handlers (on* attributes), and malicious URL schemes (javascript:, vbscript:)
 * while preserving safe rich-text TipTap markup and formatting tags.
 */

const FORBIDDEN_TAGS = [
  "script",
  "object",
  "embed",
  "iframe",
  "applet",
  "meta",
  "link",
  "style",
  "base",
  "form",
];

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#x([0-9a-f]+);?/gi, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    )
    .replace(/&#([0-9]+);?/g, (_, dec) =>
      String.fromCharCode(parseInt(dec, 10))
    );
}

function isDangerousUrl(val: string): boolean {
  const normalized = decodeHtmlEntities(val)
    .replace(/[\s\x00-\x1f]/g, "")
    .toLowerCase();
  return (
    normalized.startsWith("javascript:") ||
    normalized.startsWith("vbscript:") ||
    normalized.startsWith("data:text/html")
  );
}

function sanitizeTagAttributes(tag: string, tagAttributes: string): string {
  // 1. Remove all on* event handler attributes: onclick, onerror, onload, etc.
  let cleaned = tagAttributes.replace(
    /\s+on[a-zA-Z0-9_-]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,
    ""
  );

  // 2. Neutralize javascript:, vbscript:, data:text/html in href and src attributes
  cleaned = cleaned.replace(
    /(\s+(?:href|src)\s*=\s*)(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi,
    (match, prefix, doubleQuoted, singleQuoted, unquoted) => {
      const urlValue = doubleQuoted ?? singleQuoted ?? unquoted ?? "";
      if (isDangerousUrl(urlValue)) {
        return "";
      }
      return match;
    }
  );

  return cleaned;
}

function cleanHtmlPass(html: string): string {
  let result = html;

  // 1. Strip block and single forbidden tags completely
  for (const tag of FORBIDDEN_TAGS) {
    const pairedRegex = new RegExp(
      `<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}\\b[^>]*>`,
      "gi"
    );
    result = result.replace(pairedRegex, "");

    const selfClosingOrOpenRegex = new RegExp(`<${tag}\\b[^>]*\\/?>`, "gi");
    result = result.replace(selfClosingOrOpenRegex, "");

    const closeRegex = new RegExp(`<\\/${tag}\\b[^>]*>`, "gi");
    result = result.replace(closeRegex, "");
  }

  // 2. Remove HTML comments
  result = result.replace(/<!--[\s\S]*?-->/g, "");

  // 3. Clean remaining tags (remove on* handlers and dangerous href/src)
  result = result.replace(
    /<([a-zA-Z0-9]+)(\s[^>]*?)?(\/?)>/g,
    (_, tagName, attributes, closingSlash) => {
      if (FORBIDDEN_TAGS.includes(tagName.toLowerCase())) {
        return "";
      }
      const safeAttributes = attributes
        ? sanitizeTagAttributes(tagName, attributes)
        : "";
      return `<${tagName}${safeAttributes}${closingSlash ? " /" : ""}>`;
    }
  );

  return result;
}

/**
 * Sanitizes dirty HTML strings to protect against Stored and Reflected XSS.
 * Re-runs passes until input stabilizes against nested tag evasions.
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty || typeof dirty !== "string") {
    return "";
  }

  let current = dirty;
  let previous = "";
  let iterations = 0;

  while (current !== previous && iterations < 5) {
    previous = current;
    iterations++;
    current = cleanHtmlPass(current);
  }

  return current;
}
