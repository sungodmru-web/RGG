import { describe, expect, it } from "vitest";

import {
  HARDCOVER_EDITIONS,
  normalizeRotation,
  rotationFromHorizontalDrag,
  shouldAutoRotate,
} from "./bookTextureConfig";

describe("RGG book texture configuration", () => {
  it("provides front, spine, and back artwork for both hardcover editions", () => {
    expect(Object.keys(HARDCOVER_EDITIONS)).toEqual(["en", "fr"]);
    for (const edition of Object.values(HARDCOVER_EDITIONS)) {
      expect(edition.front).toMatch(/\.(webp)$/);
      expect(edition.spine).toMatch(/\.(webp)$/);
      expect(edition.back).toMatch(/\.(webp)$/);
    }
  });

  it("allows continuous full-turn rotation", () => {
    expect(normalizeRotation(Math.PI * 2)).toBeCloseTo(0);
    expect(normalizeRotation(Math.PI * 5)).toBeCloseTo(Math.PI);
    expect(normalizeRotation(-Math.PI / 2)).toBeCloseTo(Math.PI * 1.5);
  });

  it("converts unrestricted horizontal dragging into rotation", () => {
    expect(rotationFromHorizontalDrag(0, 600)).toBeGreaterThan(Math.PI * 2);
    expect(rotationFromHorizontalDrag(1, -100)).toBeCloseTo(-0.2);
  });

  it("starts idle rotation after three seconds unless motion is reduced", () => {
    expect(shouldAutoRotate(false, 3000)).toBe(false);
    expect(shouldAutoRotate(false, 3001)).toBe(true);
    expect(shouldAutoRotate(true, 10_000)).toBe(false);
  });
});