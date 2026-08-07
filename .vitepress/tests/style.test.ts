import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const STYLE_CSS_PATH = resolve(process.cwd(), ".vitepress/theme/style.css");

const BRAND_BG = "#0a0a0b";

function readStyleCss() {
  return readFileSync(STYLE_CSS_PATH, "utf8");
}

describe("brand background token", () => {
  const css = readStyleCss();

  it("defines --color-bg as the brand background literal", () => {
    expect(css).toMatch(new RegExp(`--color-bg:\\s*${BRAND_BG}\\s*;`, "i"));
  });

  it("keeps the brand background literal in exactly one place", () => {
    const occurrences = css.match(new RegExp(BRAND_BG, "gi")) ?? [];
    expect(occurrences).toHaveLength(1);
  });

  it("sets the html/body background from the token, not a second literal", () => {
    const htmlBodyBlock = css.match(/(?:^|\})\s*html\s*,[^{]*\{([^}]*)\}/m);
    expect(htmlBodyBlock, "html/body rule not found").not.toBeNull();
    const block = htmlBodyBlock![1];
    expect(block).toMatch(/background:\s*var\(--color-bg\)\s*;/);
    expect(block).not.toMatch(new RegExp(BRAND_BG, "i"));
  });
});
