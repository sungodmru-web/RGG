const EDITION_ASSET_ROOT = `${import.meta.env.BASE_URL}images/book-editions`;

export const HARDCOVER_EDITIONS = {
  en: {
    label: "ENGLISH",
    front: `${EDITION_ASSET_ROOT}/english-front.webp`,
    spine: `${EDITION_ASSET_ROOT}/english-spine.webp`,
    back: `${EDITION_ASSET_ROOT}/english-back.webp`,
  },
  fr: {
    label: "FRANÇAIS",
    front: `${EDITION_ASSET_ROOT}/french-front.webp`,
    spine: `${EDITION_ASSET_ROOT}/french-spine.webp`,
    back: `${EDITION_ASSET_ROOT}/french-back.webp`,
  },
} as const;

export type HardcoverEdition = keyof typeof HARDCOVER_EDITIONS;

export const BOOK_GEOMETRY = {
  height: 1,
  width: 0.69,
  pageDepth: 0.064,
  boardThickness: 0.012,
  boardOverhang: 0.014,
} as const;

export function normalizeRotation(radians: number) {
  const fullTurn = Math.PI * 2;
  return ((radians % fullTurn) + fullTurn) % fullTurn;
}

export function rotationFromHorizontalDrag(
  startingRotation: number,
  horizontalPixels: number,
) {
  return startingRotation + horizontalPixels * 0.012;
}

export function shouldAutoRotate(
  reducedMotion: boolean,
  millisecondsSinceInteraction: number,
) {
  return !reducedMotion && millisecondsSinceInteraction > 3000;
}