/**
 * TipTap to Telegram Bot API HTML Converter.
 *
 * Converts TipTap rich text HTML into valid, sanitized Telegram-compatible HTML.
 * Supported Telegram tags: <b>, <i>, <u>, <s>, <code>, <pre>, <blockquote>, <a href="...">, <tg-spoiler>.
 *
 * Strips dangerous tags (scripts, styles, iframes, objects) along with their inner contents.
 * Preserves structural spacing for headings, paragraphs, divs, blockquotes, lists, and tables.
 * Strips unsupported layout tags while preserving inner text content.
 * Normalizes paragraphs and line breaks into Telegram-safe newlines.
 */

export const TELEGRAM_MAX_MESSAGE_LENGTH = 4096;
export const TELEGRAM_WARNING_MESSAGE_LENGTH = 3800;

export interface TelegramLengthValidation {
  length: number;
  isWarning: boolean;
  isOverLimit: boolean;
  remaining: number;
}

export function validateTelegramHtmlLength(html: string | null | undefined): TelegramLengthValidation {
  const length = html && typeof html === "string" ? html.length : 0;
  return {
    length,
    isWarning: length > TELEGRAM_WARNING_MESSAGE_LENGTH,
    isOverLimit: length > TELEGRAM_MAX_MESSAGE_LENGTH,
    remaining: TELEGRAM_MAX_MESSAGE_LENGTH - length,
  };
}

export function convertTipTapToTelegramHtml(htmlContent: string | null | undefined): string {
  if (!htmlContent || typeof htmlContent !== "string") {
    return "";
  }

  const trimmed = htmlContent.trim();
  if (!trimmed) {
    return "";
  }

  let clean = htmlContent;

  // 1. Completely strip dangerous tags and their contents
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
  clean = clean.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");
  clean = clean.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "");
  clean = clean.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "");
  clean = clean.replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, "");

  // 2. Normalize semantic formatting tags to Telegram-supported tags
  clean = clean.replace(/<\/?strong\b[^>]*>/gi, (match) => (match.startsWith("</") ? "</b>" : "<b>"));
  clean = clean.replace(/<\/?b\b[^>]*>/gi, (match) => (match.startsWith("</") ? "</b>" : "<b>"));
  clean = clean.replace(/<\/?em\b[^>]*>/gi, (match) => (match.startsWith("</") ? "</i>" : "<i>"));
  clean = clean.replace(/<\/?i\b[^>]*>/gi, (match) => (match.startsWith("</") ? "</i>" : "<i>"));
  clean = clean.replace(/<\/?(?:strike|del|s)\b[^>]*>/gi, (match) => (match.startsWith("</") ? "</s>" : "<s>"));
  clean = clean.replace(/<\/?(?:ins|u)\b[^>]*>/gi, (match) => (match.startsWith("</") ? "</u>" : "<u>"));
  clean = clean.replace(/<span\s+class=["']tg-spoiler["']>([\s\S]*?)<\/span>/gi, "<tg-spoiler>$1</tg-spoiler>");

  // 3. Handle paragraph and block break conversions
  clean = clean.replace(/<br\s*\/?>/gi, "\n");
  clean = clean.replace(/<hr\s*\/?>/gi, "\n\n");
  clean = clean.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "• $1\n");
  clean = clean.replace(/<\/(?:ul|ol)>\s*/gi, "\n");
  clean = clean.replace(/<\/h[1-6]>\s*/gi, "\n\n");
  clean = clean.replace(/<\/div>\s*/gi, "\n");
  clean = clean.replace(/<table[^>]*>/gi, "\n");
  clean = clean.replace(/<\/table>\s*/gi, "\n");
  clean = clean.replace(/<\/td>\s*/gi, " ");
  clean = clean.replace(/<\/tr>\s*/gi, "\n");
  clean = clean.replace(/<\/p>\s*(?=<\/blockquote>)/gi, "");
  clean = clean.replace(/<\/p>\s*/gi, "\n\n");
  clean = clean.replace(/<\/blockquote>\s*/gi, "</blockquote>\n");

  // 4. Sanitize <a> links with protocol validation (http, https, tg)
  clean = clean.replace(/<a\s+[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => {
    const cleanHref = href ? href.trim() : "";
    if (/^(https?:\/\/|tg:\/\/)/i.test(cleanHref)) {
      return `<a href="${cleanHref}">${text}</a>`;
    }
    return text;
  });

  // 5. Whitelist allowed Telegram tags; strip all other tags while preserving inner text
  // Allowed: <b>, <i>, <u>, <s>, <code>, <pre>, <blockquote>, <tg-spoiler>, and sanitized <a href="...">
  clean = clean.replace(/<\/?[a-z0-9_-]+(?:\s+[^>]*?)?>/gi, (tag) => {
    if (/^<\/?(b|i|u|s|code|pre|tg-spoiler)\b/i.test(tag)) {
      return tag.toLowerCase();
    }
    if (/^<blockquote\b/i.test(tag)) {
      return /expandable/i.test(tag) ? "<blockquote expandable>" : "<blockquote>";
    }
    if (/^<\/blockquote>$/i.test(tag)) {
      return "</blockquote>";
    }
    if (/^<a\s+href=["'](?:https?:\/\/|tg:\/\/)[^"']*["']>$/i.test(tag)) {
      return tag;
    }
    if (/^<\/a>$/i.test(tag)) {
      return "</a>";
    }
    return "";
  });

  // 6. Normalize whitespace: remove trailing spaces before newline, collapse 3+ newlines down to 2, trim
  clean = clean.replace(/[ \t]+\n/g, "\n");
  clean = clean.replace(/\n{3,}/g, "\n\n").trim();

  return clean;
}

// Alias for convertTipTapToTelegramHtml
export const tiptapToTelegramHtml = convertTipTapToTelegramHtml;
export default convertTipTapToTelegramHtml;
