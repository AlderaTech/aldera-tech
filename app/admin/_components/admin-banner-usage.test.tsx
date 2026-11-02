import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";
import { ADMIN_EMPTY_CONTEXTS } from "../_data/admin-empty-contexts";

const root = resolve(import.meta.dir, "..");
const files = [...new Bun.Glob("**/*.tsx").scanSync({ cwd: root })]
  .map((path) => path.replaceAll("\\", "/"))
  .filter((path) => !path.includes(".test.") && !path.includes("_test-utils"));

function categoryFor(path: string) {
  if (path.includes("overview/")) return "overview";
  if (/^(projects|proposals|files|timesheet)\//.test(path)) return "projects";
  if (/^(orders|calculator)\//.test(path)) return "estimates";
  if (path.startsWith("invoices/")) return "billing";
  if (/^(ai-relay|telegram-bot)\//.test(path)) return "ai";
  if (path.startsWith("analytics/")) return "analytics";
  if (/^(blog|portfolio|testimonials)\//.test(path)) return "content";
  return path.split("/")[0];
}

describe("Kontrak header dan daftar kosong seluruh Admin", () => {
  it("memetakan kategori setiap header dan menghindari subjudul campuran bahasa", () => {
    let count = 0;
    for (const path of files) {
      if (
        [
          "_components/admin-banner.tsx",
          "_components/admin-page-header.tsx",
        ].includes(path)
      )
        continue;
      const source = readFileSync(resolve(root, path), "utf8");
      expect(source).not.toContain('eyebrow="Admin Console"');
      expect(source).not.toContain("<WorkspaceBanner");
      const file = ts.createSourceFile(
        path,
        source,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX
      );
      function visit(node: ts.Node) {
        if (
          (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
          ["AdminBanner", "AdminPageHeader"].includes(
            node.tagName.getText(file)
          )
        ) {
          const category = node.attributes.properties.find(
            (attr) =>
              ts.isJsxAttribute(attr) && attr.name.getText(file) === "category"
          );
          expect(category?.getText(file)).toBe(
            'category="' + categoryFor(path) + '"'
          );
          count++;
        }
        if (
          ts.isJsxElement(node) &&
          node.openingElement.tagName.getText(file) === "AdminBanner"
        ) {
          function checkDescription(child: ts.Node) {
            if (
              ts.isJsxElement(child) &&
              child.openingElement.tagName.getText(file) === "p"
            ) {
              const text = child.children
                .filter(ts.isJsxText)
                .map((item) => item.text)
                .join(" ");
              expect(text).not.toMatch(
                /\b(?:Manage|assign|publish|auto-generate|monitoring|client|website)\b|dynamic pricing|e-signature|line item/i
              );
            }
            ts.forEachChild(child, checkDescription);
          }
          checkDescription(node);
        }
        ts.forEachChild(node, visit);
      }
      visit(file);
    }
    expect(count).toBeGreaterThanOrEqual(29);
  });
  it("memberi konteks pada setiap daftar kosong dan tidak memakai pose maskot", () => {
    let count = 0;
    for (const path of files) {
      if (path === "error.tsx") continue;
      const source = readFileSync(resolve(root, path), "utf8");
      const file = ts.createSourceFile(
        path,
        source,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX
      );
      function visit(node: ts.Node) {
        if (
          ts.isJsxSelfClosingElement(node) &&
          node.tagName.getText(file) === "AdminEmptyState"
        ) {
          const attributes = node.attributes.properties.filter(
            ts.isJsxAttribute
          );
          const context = attributes.find(
            (attr) => attr.name.getText(file) === "context"
          )?.initializer;
          expect(
            context &&
              ts.isStringLiteral(context) &&
              context.text in ADMIN_EMPTY_CONTEXTS
          ).toBe(true);
          expect(
            attributes.some((attr) =>
              ["mascot", "pose"].includes(attr.name.getText(file))
            )
          ).toBe(false);
          count++;
        }
        ts.forEachChild(node, visit);
      }
      visit(file);
    }
    expect(count).toBeGreaterThanOrEqual(33);
  });
});
