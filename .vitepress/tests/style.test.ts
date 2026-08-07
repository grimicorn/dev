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
    expect(css).toMatch(/--color-bg:\s*#0a0a0b\s*;/);
  });

  it("sets the html/body background from the token, not a second literal", () => {
    const htmlBodyBlock = css.match(/html,\s*body\s*\{[^}]*\}/);
    expect(htmlBodyBlock, "html/body rule not found").not.toBeNull();
    const block = htmlBodyBlock![0];
    expect(block).toMatch(/background:\s*var\(--color-bg\)\s*;/);
    expect(block).not.toContain(BRAND_BG);
  });
});
