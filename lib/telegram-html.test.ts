import { describe, it, expect } from "bun:test";
import {
  convertTipTapToTelegramHtml,
  tiptapToTelegramHtml,
  validateTelegramHtmlLength,
  TELEGRAM_MAX_MESSAGE_LENGTH,
  TELEGRAM_WARNING_MESSAGE_LENGTH,
} from "./telegram-html";

describe("lib/telegram-html.ts unit test suite", () => {
  describe("1. Block Elements and Whitespace Preservation", () => {
    it("converts heading followed by paragraph with double newline", () => {
      const input = "<h1>Header Title</h1><p>Body text here.</p>";
      const output = convertTipTapToTelegramHtml(input);
      expect(output).toBe("Header Title\n\nBody text here.");
    });

    it("converts consecutive headings with double newline separation", () => {
      const input = "<h1>Main Title</h1><h2>Subtitle</h2><h3>Section</h3>";
      const output = convertTipTapToTelegramHtml(input);
      expect(output).toBe("Main Title\n\nSubtitle\n\nSection");
    });

    it("converts all heading levels h1-h6 correctly", () => {
      const input =
        "<h1>H1</h1><h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6>";
      const output = convertTipTapToTelegramHtml(input);
      expect(output).toBe("H1\n\nH2\n\nH3\n\nH4\n\nH5\n\nH6");
    });

    it("converts div containers with single newline separation", () => {
      const input = "<div>Line 1</div><div>Line 2</div><div>Line 3</div>";
      const output = convertTipTapToTelegramHtml(input);
      expect(output).toBe("Line 1\nLine 2\nLine 3");
    });

    it("converts mixed paragraphs and divs preserving block spacing", () => {
      const input = "<p>Paragraph 1</p><div>Div 1</div><p>Paragraph 2</p>";
      const output = convertTipTapToTelegramHtml(input);
      expect(output).toBe("Paragraph 1\n\nDiv 1\nParagraph 2");
    });

    it("preserves blockquote tags and appends newline after closing blockquote", () => {
      const input =
        "<blockquote>Important note</blockquote><p>Following paragraph</p>";
      const output = convertTipTapToTelegramHtml(input);
      expect(output).toBe(
        "<blockquote>Important note</blockquote>\nFollowing paragraph"
      );
    });

    it("preserves expandable attribute on blockquotes", () => {
      const input =
        "<blockquote expandable>Collapsible text inside</blockquote><p>Next text</p>";
      const output = convertTipTapToTelegramHtml(input);
      expect(output).toBe(
        "<blockquote expandable>Collapsible text inside</blockquote>\nNext text"
      );
    });

    it("removes trailing paragraph break before closing blockquote", () => {
      const input =
        "<blockquote><p>Quote text line</p></blockquote><p>After quote</p>";
      const output = convertTipTapToTelegramHtml(input);
      expect(output).toBe(
        "<blockquote>Quote text line</blockquote>\nAfter quote"
      );
    });

    it("converts horizontal rule <hr> to double newline", () => {
      const input = "<p>Section Above</p><hr><p>Section Below</p>";
      const output = convertTipTapToTelegramHtml(input);
      expect(output).toBe("Section Above\n\nSection Below");
    });

    it("converts <br> and <br/> tags to single newline", () => {
      const input = "Line 1<br>Line 2<br/>Line 3";
      const output = convertTipTapToTelegramHtml(input);
      expect(output).toBe("Line 1\nLine 2\nLine 3");
    });

    it("converts unordered lists into bullet points with newlines", () => {
      const input = "<ul><li>Point A</li><li>Point B</li><li>Point C</li></ul>";
      const output = convertTipTapToTelegramHtml(input);
      expect(output).toBe("• Point A\n• Point B\n• Point C");
    });

    it("converts ordered lists into bullet points with newlines", () => {
      const input = "<ol><li>First item</li><li>Second item</li></ol>";
      const output = convertTipTapToTelegramHtml(input);
      expect(output).toBe("• First item\n• Second item");
    });

    it("handles multiline text inside list items cleanly", () => {
      const input = "<ul><li>Item line 1<br>Item line 2</li></ul>";
      const output = convertTipTapToTelegramHtml(input);
      expect(output).toBe("• Item line 1\nItem line 2");
    });

    it("converts table rows and cells into line-separated tabular text", () => {
      const input =
        "<table><tr><td>Col 1</td><td>Col 2</td></tr><tr><td>Col 3</td><td>Col 4</td></tr></table>";
      const output = convertTipTapToTelegramHtml(input);
      expect(output).toBe("Col 1 Col 2\nCol 3 Col 4");
    });

    it("collapses excessive newlines (3+) down to maximum of 2 newlines", () => {
      const input = "<p>Para 1</p>\n\n\n\n\n<p>Para 2</p>";
      const output = convertTipTapToTelegramHtml(input);
      expect(output).toBe("Para 1\n\nPara 2");
    });

    it("removes trailing spaces before newlines and trims edges", () => {
      const input = "   <p>Text with trailing spaces   </p>   ";
      const output = convertTipTapToTelegramHtml(input);
      expect(output).toBe("Text with trailing spaces");
    });
  });

  describe("2. Formatting Tag Normalization", () => {
    it("converts <strong> and <b> tags to Telegram <b>", () => {
      const input = "<strong>Bold 1</strong> and <b>Bold 2</b>";
      const output = convertTipTapToTelegramHtml(input);
      expect(output).toBe("<b>Bold 1</b> and <b>Bold 2</b>");
    });

    it("converts <em> and <i> tags to Telegram <i>", () => {
      const input = "<em>Italic 1</em> and <i>Italic 2</i>";
      const output = convertTipTapToTelegramHtml(input);
      expect(output).toBe("<i>Italic 1</i> and <i>Italic 2</i>");
    });

    it("converts <strike>, <del>, and <s> tags to Telegram <s>", () => {
      const input =
        "<strike>Strikethrough 1</strike>, <del>Del 2</del>, <s>S 3</s>";
      const output = convertTipTapToTelegramHtml(input);
      expect(output).toBe("<s>Strikethrough 1</s>, <s>Del 2</s>, <s>S 3</s>");
    });

    it("converts <ins> and <u> tags to Telegram <u>", () => {
      const input = "<ins>Underline 1</ins> and <u>Underline 2</u>";
      const output = convertTipTapToTelegramHtml(input);
      expect(output).toBe("<u>Underline 1</u> and <u>Underline 2</u>");
    });

    it("preserves inline <code> tags", () => {
      const input = "Run <code>bun test</code> now";
      const output = convertTipTapToTelegramHtml(input);
      expect(output).toBe("Run <code>bun test</code> now");
    });

    it("preserves multi-line <pre> code blocks", () => {
      const input = "<pre>const x = 1;\nconsole.log(x);</pre>";
      const output = convertTipTapToTelegramHtml(input);
      expect(output).toBe("<pre>const x = 1;\nconsole.log(x);</pre>");
    });

    it("converts <span class='tg-spoiler'> into <tg-spoiler>", () => {
      const input = '<p>The secret is <span class="tg-spoiler">42</span></p>';
      const output = convertTipTapToTelegramHtml(input);
      expect(output).toBe("The secret is <tg-spoiler>42</tg-spoiler>");
    });

    it("handles nested formatting tags properly", () => {
      const input = "<p><strong><em><u>Nested style</u></em></strong></p>";
      const output = convertTipTapToTelegramHtml(input);
      expect(output).toBe("<b><i><u>Nested style</u></i></b>");
    });
  });

  describe("3. Dangerous Tag Stripping & Protocol Whitelisting", () => {
    it("completely removes <script> tags and contents", () => {
      const input = "<p>Hello <script>alert('xss')</script>World</p>";
      const output = convertTipTapToTelegramHtml(input);
      expect(output).toBe("Hello World");
      expect(output).not.toContain("alert");
    });

    it("completely removes <style> tags and contents", () => {
      const input = "<p>Hello <style>body { color: red; }</style>World</p>";
      const output = convertTipTapToTelegramHtml(input);
      expect(output).toBe("Hello World");
      expect(output).not.toContain("color: red");
    });

    it("completely removes <iframe>, <object>, <embed>, <noscript>", () => {
      const input =
        "<iframe src='evil.com'></iframe><object data='x'></object><embed src='y'></embed><noscript>Z</noscript><p>Safe</p>";
      const output = convertTipTapToTelegramHtml(input);
      expect(output).toBe("Safe");
    });

    it("allows valid https://, http://, and tg:// link protocols", () => {
      const input =
        '<p><a href="https://example.com">HTTPS</a>, <a href="http://example.com">HTTP</a>, <a href="tg://resolve?domain=aldera">TG</a></p>';
      const output = convertTipTapToTelegramHtml(input);
      expect(output).toBe(
        '<a href="https://example.com">HTTPS</a>, <a href="http://example.com">HTTP</a>, <a href="tg://resolve?domain=aldera">TG</a>'
      );
    });

    it("strips dangerous javascript: and data: URI links while preserving text", () => {
      const input =
        '<p><a href="javascript:alert(1)">Click me</a> and <a href="data:text/html,...">Data URI</a></p>';
      const output = convertTipTapToTelegramHtml(input);
      expect(output).toBe("Click me and Data URI");
      expect(output).not.toContain("javascript:");
      expect(output).not.toContain("href=");
    });

    it("strips relative and ftp: links while preserving inner text", () => {
      const input =
        '<p><a href="/admin/config">Relative Link</a> and <a href="ftp://files.com">FTP</a></p>';
      const output = convertTipTapToTelegramHtml(input);
      expect(output).toBe("Relative Link and FTP");
      expect(output).not.toContain("href=");
    });
  });

  describe("4. Edge Cases and Aliases", () => {
    it("returns empty string for null, undefined, and non-string inputs", () => {
      expect(convertTipTapToTelegramHtml(null)).toBe("");
      expect(convertTipTapToTelegramHtml(undefined)).toBe("");
      expect(convertTipTapToTelegramHtml("")).toBe("");
      expect(convertTipTapToTelegramHtml(12345 as unknown as string)).toBe("");
    });

    it("returns empty string for whitespace-only inputs", () => {
      expect(convertTipTapToTelegramHtml("   ")).toBe("");
      expect(convertTipTapToTelegramHtml("\n\n\t  \n")).toBe("");
    });

    it("tiptapToTelegramHtml alias functions identically to convertTipTapToTelegramHtml", () => {
      const input = "<h1>Title</h1><p>Content</p>";
      expect(tiptapToTelegramHtml(input)).toBe(
        convertTipTapToTelegramHtml(input)
      );
    });
  });

  describe("5. Length Validation Helper & Constants", () => {
    it("exports standard Telegram message length constants", () => {
      expect(TELEGRAM_MAX_MESSAGE_LENGTH).toBe(4096);
      expect(TELEGRAM_WARNING_MESSAGE_LENGTH).toBe(3800);
    });

    it("validates normal length string", () => {
      const text = "Halo dunia!";
      const res = validateTelegramHtmlLength(text);
      expect(res.length).toBe(11);
      expect(res.isWarning).toBe(false);
      expect(res.isOverLimit).toBe(false);
      expect(res.remaining).toBe(4096 - 11);
    });

    it("triggers warning flag when exceeding 3800 characters", () => {
      const text = "A".repeat(3801);
      const res = validateTelegramHtmlLength(text);
      expect(res.length).toBe(3801);
      expect(res.isWarning).toBe(true);
      expect(res.isOverLimit).toBe(false);
      expect(res.remaining).toBe(4096 - 3801);
    });

    it("does not trigger warning at exactly 3800 characters", () => {
      const text = "A".repeat(3800);
      const res = validateTelegramHtmlLength(text);
      expect(res.length).toBe(3800);
      expect(res.isWarning).toBe(false);
      expect(res.isOverLimit).toBe(false);
    });

    it("does not trigger overLimit at exactly 4096 characters", () => {
      const text = "A".repeat(4096);
      const res = validateTelegramHtmlLength(text);
      expect(res.length).toBe(4096);
      expect(res.isWarning).toBe(true);
      expect(res.isOverLimit).toBe(false);
      expect(res.remaining).toBe(0);
    });

    it("triggers overLimit flag when exceeding 4096 characters", () => {
      const text = "A".repeat(4097);
      const res = validateTelegramHtmlLength(text);
      expect(res.length).toBe(4097);
      expect(res.isWarning).toBe(true);
      expect(res.isOverLimit).toBe(true);
      expect(res.remaining).toBe(-1);
    });

    it("handles null and undefined safely in validateTelegramHtmlLength", () => {
      expect(validateTelegramHtmlLength(null).length).toBe(0);
      expect(validateTelegramHtmlLength(null).isWarning).toBe(false);
      expect(validateTelegramHtmlLength(null).isOverLimit).toBe(false);
      expect(validateTelegramHtmlLength(null).remaining).toBe(4096);

      expect(validateTelegramHtmlLength(undefined).length).toBe(0);
      expect(validateTelegramHtmlLength("").length).toBe(0);
    });
  });
});
