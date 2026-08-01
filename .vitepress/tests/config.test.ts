import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import config from "../config";

const PUBLIC_DIR = resolve(process.cwd(), "public");

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);
const IHDR_TYPE_OFFSET = 12;
const PNG_CHUNK_TYPE_LENGTH = 4;
const PNG_WIDTH_OFFSET = 16;
const PNG_HEIGHT_OFFSET = 20;
const PNG_HEADER_MIN_BYTES = 24;

// Base used only to resolve a root-relative og:image path; ignored for absolute URLs.
const URL_RESOLUTION_BASE = "https://example.test";

function readPngDimensions(filePath: string) {
  const buffer = readFileSync(filePath);
  if (buffer.length < PNG_HEADER_MIN_BYTES) {
    throw new Error(`${filePath} is truncated (${buffer.length} bytes)`);
  }
  const hasSignature = buffer
    .subarray(0, PNG_SIGNATURE.length)
    .equals(PNG_SIGNATURE);
  if (!hasSignature) {
    throw new Error(`${filePath} is not a PNG (bad signature)`);
  }
  const chunkType = buffer.toString(
    "ascii",
    IHDR_TYPE_OFFSET,
    IHDR_TYPE_OFFSET + PNG_CHUNK_TYPE_LENGTH,
  );
  if (chunkType !== "IHDR") {
    throw new Error(`${filePath} has no leading IHDR chunk`);
  }
  return {
    width: buffer.readUInt32BE(PNG_WIDTH_OFFSET),
    height: buffer.readUInt32BE(PNG_HEIGHT_OFFSET),
  };
}

function findMetaContent(identifier: string) {
  const head = config.head ?? [];
  const entry = head.find(
    ([tag, attributes]) =>
      tag === "meta" &&
      (attributes?.property ?? attributes?.name) === identifier,
  );
  if (!entry) {
    throw new Error(`Missing meta tag for "${identifier}"`);
  }
  const content = entry[1].content;
  if (content === undefined) {
    throw new Error(`Meta tag "${identifier}" has no content attribute`);
  }
  return content;
}

function resolveMetaImagePath(identifier: string) {
  const imageUrl = findMetaContent(identifier);
  const pathname = new URL(imageUrl, URL_RESOLUTION_BASE).pathname.replace(
    /^\//,
    "",
  );
  return resolve(PUBLIC_DIR, pathname);
}

describe("Open Graph image metadata", () => {
  it("declares dimensions that match the real og:image file", () => {
    const { width, height } = readPngDimensions(
      resolveMetaImagePath("og:image"),
    );
    expect(findMetaContent("og:image:width")).toBe(String(width));
    expect(findMetaContent("og:image:height")).toBe(String(height));
  });

  it("points twitter:image at the same asset as og:image", () => {
    expect(findMetaContent("twitter:image")).toBe(findMetaContent("og:image"));
  });
});
