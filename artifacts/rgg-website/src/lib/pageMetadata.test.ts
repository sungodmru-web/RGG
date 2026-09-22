import { describe, expect, it } from "vitest";

import {
  applyPageMetadata,
  metadataForPath,
  metadataForPublication,
  ROUTE_METADATA,
} from "@/lib/pageMetadata";

describe("public page metadata", () => {
  it("defines unique metadata for every fixed public route", () => {
    const metadata = Object.values(ROUTE_METADATA);
    expect(new Set(metadata.map((entry) => entry.title)).size).toBe(metadata.length);
    metadata.forEach((entry) => {
      expect(entry.title).toBeTruthy();
      expect(entry.description).toBeTruthy();
    });
  });

  it("uses the approved homepage sharing metadata", () => {
    expect(ROUTE_METADATA["/"]).toEqual({
      title: "Reclaiming the Green Gold",
      description:
        "Cannabis at the Crossroads of Health, Justice and Sustainable Development.",
    });
  });

  it("uses publication SEO fields rather than deriving article facts from its slug", () => {
    const metadata = metadataForPublication({
      id: "publication-1",
      slug: "opaque-slug",
      title: "Verified publication title",
      abstract: "Verified abstract",
      publicationType: "article",
      authors: [{ name: "Author" }],
      publicationDate: "2026-09-12",
      seoTitle: "Approved SEO title",
      seoDescription: "Approved SEO description",
    });
    expect(metadata).toEqual({
      title: "Approved SEO title",
      description: "Approved SEO description",
      type: "article",
    });
    expect(metadataForPath("/publications/opaque-slug").title).not.toContain("Opaque");
  });

  it("updates canonical and social metadata without retaining query parameters", () => {
    document.head.innerHTML = `
      <title>Old</title>
      <meta name="description" content="">
      <meta property="og:title" content="">
      <meta property="og:description" content="">
      <meta property="og:type" content="">
      <meta property="og:url" content="">
      <meta name="twitter:title" content="">
      <meta name="twitter:description" content="">
      <link rel="canonical" href="">
    `;
    applyPageMetadata(ROUTE_METADATA["/publications"], "/base/publications?q=policy");
    expect(document.title).toBe(ROUTE_METADATA["/publications"].title);
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "http://localhost:3000/base/publications/",
    );
  });
});