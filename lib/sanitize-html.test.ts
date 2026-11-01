import { describe, it, expect } from "bun:test";
import { sanitizeHtml } from "./sanitize-html";

describe("lib/sanitize-html.ts XSS defense unit test suite", () => {
  it("returns empty string on null, undefined, or empty string input", () => {
    // @ts-expect-error test undefined
    expect(sanitizeHtml(undefined)).toBe("");
    // @ts-expect-error test null
    expect(sanitizeHtml(null)).toBe("");
    expect(sanitizeHtml("")).toBe("");
  });

  it("preserves pure text without modification", () => {
    const text = "Hello, Aldera Tech! This is clean text.";
    expect(sanitizeHtml(text)).toBe(text);
  });

  it("strips <script> tags and inner code completely", () => {
    const dirty = "<p>Text</p><script>alert('XSS vulnerability')</script>";
    expect(sanitizeHtml(dirty)).toBe("<p>Text</p>");
  });

  it("strips dangerous tags: style, iframe, object, embed, meta, link, form", () => {
    const dirty = `
      <style>body { display: none; }</style>
      <iframe src="https://malicious.example.com"></iframe>
      <object data="malicious.swf"></object>
      <embed src="malicious.swf">
      <meta http-equiv="refresh" content="0;url=http://evil.com">
      <link rel="stylesheet" href="http://evil.com/evil.css">
      <form action="http://evil.com/steal"><input type="text"/></form>
      <p>Safe content</p>
    `;
    const cleaned = sanitizeHtml(dirty);
    expect(cleaned).not.toContain("<style>");
    expect(cleaned).not.toContain("<iframe>");
    expect(cleaned).not.toContain("<object>");
    expect(cleaned).not.toContain("<embed>");
    expect(cleaned).not.toContain("<meta>");
    expect(cleaned).not.toContain("<link>");
    expect(cleaned).not.toContain("<form>");
    expect(cleaned).toContain("<p>Safe content</p>");
  });

  it("neutralizes nested script evasion tags (recursive stripping)", () => {
    const dirty = "<scr<script>ipt>alert(1)</scr</script>ipt>";
    const cleaned = sanitizeHtml(dirty);
    expect(cleaned).not.toContain("<script>");
    expect(cleaned).not.toContain("alert(1)");
  });

  it("strips all on* event handler attributes", () => {
    const dirty = `
      <img src="https://example.com/pic.jpg" onerror="alert(1)" onload="alert(2)" />
      <div onmouseover="stealCookies()" onfocus="attack()">Hover me</div>
      <a href="https://example.com" onclick="return false;">Link</a>
    `;
    const cleaned = sanitizeHtml(dirty);
    expect(cleaned).not.toContain("onerror");
    expect(cleaned).not.toContain("onload");
    expect(cleaned).not.toContain("onmouseover");
    expect(cleaned).not.toContain("onfocus");
    expect(cleaned).not.toContain("onclick");
    expect(cleaned).toContain('src="https://example.com/pic.jpg"');
    expect(cleaned).toContain('href="https://example.com"');
  });

  it("neutralizes javascript:, vbscript:, and data:text/html URL schemes in href and src", () => {
    const dirty = `
      <a href="javascript:alert('XSS')">Click me</a>
      <a href="JAVASCRIPT:alert('XSS')">Click uppercase</a>
      <a href="javascript : alert(1)">Click spaced</a>
      <a href="vbscript:msgbox('XSS')">VBScript</a>
      <a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">Data HTML</a>
      <img src="javascript:alert('img')" />
    `;
    const cleaned = sanitizeHtml(dirty);
    expect(cleaned).not.toContain("javascript:");
    expect(cleaned).not.toContain("JAVASCRIPT:");
    expect(cleaned).not.toContain("vbscript:");
    expect(cleaned).not.toContain("data:text/html");
  });

  it("neutralizes entity-encoded dangerous URL schemes", () => {
    // &#x6a; is 'j' in hex -> javascript:
    const dirty = '<a href="&#x6a;avascript:alert(1)">Entity link</a>';
    const cleaned = sanitizeHtml(dirty);
    expect(cleaned).not.toContain("javascript:alert(1)");
    expect(cleaned).not.toContain("&#x6a;avascript:alert(1)");
  });

  it("removes HTML comments containing payloads", () => {
    const dirty = "<p>Before <!-- <script>alert(1)</script> --> After</p>";
    expect(sanitizeHtml(dirty)).toBe("<p>Before  After</p>");
  });

  it("preserves safe rich text markup and formatting tags", () => {
    const richText = `
      <h1>Article Title</h1>
      <p>This is <strong>bold</strong> and <em>italic</em> and <u>underline</u> text.</p>
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
      </ul>
      <pre><code>const a = 1;</code></pre>
      <blockquote data-expandable="true"><p>Quote</p></blockquote>
      <a href="https://aldera.tech" target="_blank" rel="noopener">Official Website</a>
    `;
    const cleaned = sanitizeHtml(richText);
    expect(cleaned).toContain("<h1>Article Title</h1>");
    expect(cleaned).toContain("<strong>bold</strong>");
    expect(cleaned).toContain("<em>italic</em>");
    expect(cleaned).toContain("<u>underline</u>");
    expect(cleaned).toContain("<li>Item 1</li>");
    expect(cleaned).toContain("<pre><code>const a = 1;</code></pre>");
    expect(cleaned).toContain('href="https://aldera.tech"');
  });
});
