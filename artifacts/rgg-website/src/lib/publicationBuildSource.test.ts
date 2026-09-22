import { describe, expect, it } from "vitest";

import {
  loadPublishedPublicationsFromDatabase,
  PUBLISHED_PUBLICATIONS_QUERY,
  type DatabasePoolFactory,
} from "./publicationBuildSource";

const publishedRow = {
  status: "published",
  id: "00000000-0000-4000-8000-000000000001",
  slug: "published-policy",
  title: "Published Policy",
  subtitle: null,
  abstract: "A published policy abstract.",
  publicationType: "policy-brief",
  category: null,
  themeId: null,
  language: "english",
  authors: [{ name: "Research Author" }],
  publicationDate: "2026-09-22",
  readingTime: null,
  featured: false,
  featuredImage: null,
  featuredImageMediaId: null,
  pdfUrl: null,
  pdfMediaId: null,
  externalUrl: null,
  doi: null,
  content: null,
  seoTitle: null,
  seoDescription: null,
};

function poolFor(rows: unknown[]): DatabasePoolFactory {
  return () => ({
    query: async () => ({ rows }),
    end: async () => undefined,
  });
}

describe("build-time publication database source", () => {
  it("returns an empty list when there are no published records", async () => {
    await expect(
      loadPublishedPublicationsFromDatabase(
        { DATABASE_URL: "postgres://build-test" },
        poolFor([]),
      ),
    ).resolves.toEqual([]);
  });

  it("maps published records into validated public metadata", async () => {
    await expect(
      loadPublishedPublicationsFromDatabase(
        { DATABASE_URL: "postgres://build-test" },
        poolFor([publishedRow]),
      ),
    ).resolves.toEqual([
      expect.objectContaining({
        id: publishedRow.id,
        slug: publishedRow.slug,
        title: publishedRow.title,
        publicationDate: publishedRow.publicationDate,
        authors: publishedRow.authors,
      }),
    ]);
  });

  it("filters draft and archived records even if a query result contains them", async () => {
    await expect(
      loadPublishedPublicationsFromDatabase(
        { DATABASE_URL: "postgres://build-test" },
        poolFor([
          { ...publishedRow, status: "draft" },
          { ...publishedRow, status: "archived" },
        ]),
      ),
    ).resolves.toEqual([]);
  });

  it("keeps only published records in a mixed result", async () => {
    await expect(
      loadPublishedPublicationsFromDatabase(
        { DATABASE_URL: "postgres://build-test" },
        poolFor([
          { ...publishedRow, status: "draft" },
          publishedRow,
          { ...publishedRow, status: "archived" },
        ]),
      ),
    ).resolves.toHaveLength(1);
  });

  it("fails safely for malformed published database records", async () => {
    await expect(
      loadPublishedPublicationsFromDatabase(
        { DATABASE_URL: "postgres://build-test" },
        poolFor([{ ...publishedRow, authors: [{ name: "" }] }]),
      ),
    ).rejects.toThrow(/invalid database record/);
  });

  it("reports database query failures instead of fabricating metadata", async () => {
    const unavailablePool: DatabasePoolFactory = () => ({
      query: async () => {
        throw new Error("database unavailable");
      },
      end: async () => undefined,
    });

    await expect(
      loadPublishedPublicationsFromDatabase(
        { DATABASE_URL: "postgres://build-test" },
        unavailablePool,
      ),
    ).rejects.toThrow(
      "Could not load published publication metadata from PostgreSQL.",
    );
  });

  it("uses a direct published-status database query without a site URL", () => {
    expect(PUBLISHED_PUBLICATIONS_QUERY).toContain("WHERE status = 'published'");
    expect(PUBLISHED_PUBLICATIONS_QUERY).not.toMatch(
      /reclaimingthegreengold|PUBLICATIONS_API_URL|https?:\/\//,
    );
  });
});