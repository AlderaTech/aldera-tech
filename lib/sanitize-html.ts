import sanitize from "sanitize-html";

/** Parse HTML and allow only inert rich-text markup, including TipTap tables. */
export function sanitizeHtml(dirty: unknown): string {
  if (typeof dirty !== "string" || !dirty) return "";
  return sanitize(dirty, {
    allowedTags: [
      ...sanitize.defaults.allowedTags,
      "img",
      "u",
      "s",
      "del",
      "mark",
      "details",
      "summary",
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      blockquote: ["data-expandable"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan"],
      ol: ["start"],
      code: ["class"],
      pre: ["class"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowProtocolRelative: false,
    nonTextTags: [
      "script",
      "style",
      "textarea",
      "option",
      "svg",
      "math",
      "iframe",
      "object",
      "embed",
      "form",
    ],
    transformTags: {
      a: sanitize.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
  });
}
