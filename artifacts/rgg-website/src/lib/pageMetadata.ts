import type { ResearchPublication } from "@/types/research";

export type PageMetadata = {
  title: string;
  description: string;
  type?: "website" | "article";
};

export type JsonLd = Record<string, unknown>;

const JSON_LD_TYPES = [
  "Organization",
  "WebSite",
  "Book",
  "Article",
  "CreativeWork",
] as const;

type JsonLdType = (typeof JSON_LD_TYPES)[number];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireString(
  value: JsonLd,
  field: string,
  type: JsonLdType,
): string {
  const fieldValue = value[field];
  if (typeof fieldValue !== "string" || fieldValue.trim() === "") {
    throw new Error(`${type} JSON-LD requires a non-empty "${field}" string.`);
  }
  return fieldValue;
}

function requireUrl(value: JsonLd, field: string, type: JsonLdType): void {
  const fieldValue = requireString(value, field, type);
  let parsed: URL;
  try {
    parsed = new URL(fieldValue);
  } catch {
    throw new Error(`${type} JSON-LD has an invalid "${field}" URL.`);
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`${type} JSON-LD has an invalid "${field}" URL.`);
  }
}

function requireReference(
  value: JsonLd,
  field: string,
  type: JsonLdType,
): void {
  const reference = value[field];
  if (!isRecord(reference)) {
    throw new Error(`${type} JSON-LD requires a "${field}" reference object.`);
  }
  requireUrl(reference, "@id", type);
}

function requireAuthors(value: JsonLd, type: JsonLdType): void {
  const authors = value.author;
  if (!Array.isArray(authors) || authors.length === 0) {
    throw new Error(`${type} JSON-LD requires at least one author object.`);
  }
  for (const author of authors) {
    if (!isRecord(author) || author["@type"] !== "Person") {
      throw new Error(`${type} JSON-LD has an invalid author object.`);
    }
    requireString(author, "name", type);
  }
}

function requirePublicationDate(value: JsonLd, type: JsonLdType): void {
  const date = requireString(value, "datePublished", type);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) {
    throw new Error(`${type} JSON-LD has an invalid "datePublished" date.`);
  }
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (
    Number.isNaN(parsed.valueOf()) ||
    parsed.getUTCFullYear() !== Number(match[1]) ||
    parsed.getUTCMonth() + 1 !== Number(match[2]) ||
    parsed.getUTCDate() !== Number(match[3])
  ) {
    throw new Error(`${type} JSON-LD has an invalid "datePublished" date.`);
  }
}

export function validateJsonLd(value: JsonLd): void {
  if (value["@context"] !== "https://schema.org") {
    throw new Error('JSON-LD requires "@context" to be "https://schema.org".');
  }
  const type = value["@type"];
  if (
    typeof type !== "string" ||
    !JSON_LD_TYPES.includes(type as JsonLdType)
  ) {
    throw new Error(`JSON-LD has an unsupported "@type": ${String(type)}.`);
  }
  const schemaType = type as JsonLdType;
  requireUrl(value, "@id", schemaType);
  requireString(value, "name", schemaType);
  requireUrl(value, "url", schemaType);

  if (schemaType === "Organization") {
    requireString(value, "description", schemaType);
    requireUrl(value, "logo", schemaType);
    return;
  }
  if (schemaType === "WebSite") {
    const languages = value.inLanguage;
    if (
      !Array.isArray(languages) ||
      languages.length === 0 ||
      languages.some((language) => typeof language !== "string" || !language)
    ) {
      throw new Error("WebSite JSON-LD requires valid languages.");
    }
    requireReference(value, "publisher", schemaType);
    return;
  }
  if (schemaType === "Book") {
    requireString(value, "description", schemaType);
    requireUrl(value, "image", schemaType);
    requireAuthors(value, schemaType);
    if (value.creativeWorkStatus === "Forthcoming") {
      for (const unresolvedClaim of ["isbn", "publisher", "offers"]) {
        if (value[unresolvedClaim] !== undefined) {
          throw new Error(
            `Book JSON-LD must not publish unresolved "${unresolvedClaim}" claims while forthcoming.`,
          );
        }
      }
    }
    return;
  }

  requireString(value, "headline", schemaType);
  requireString(value, "description", schemaType);
  requirePublicationDate(value, schemaType);
  requireAuthors(value, schemaType);
  requireReference(value, "publisher", schemaType);
  requireReference(value, "isPartOf", schemaType);
  if (value.image !== undefined) requireUrl(value, "image", schemaType);
}

export const SITE_NAME = "Reclaiming the Green Gold";
export const BOOK_AUTHORS = [
  "Dr Soobaschand (Sunil) Sweenarain",
  "Sunny Sweenarain",
] as const;
export const PUBLIC_ROUTE_PATHS = [
  "/",
  "/book",
  "/publications",
  "/technical-assistance",
  "/authors",
  "/endorsements",
  "/disclaimer",
  "/cookies",
] as const;

export const ROUTE_METADATA: Record<string, PageMetadata> = {
  "/": {
    title: "Reclaiming the Green Gold | Cannabis Governance",
    description:
      "Explore a global framework for cannabis governance, sustainable development, public health, justice and inclusive economic transformation.",
  },
  "/book": {
    title: "The Book | Reclaiming the Green Gold",
    description:
      "Discover Reclaiming the Green Gold, a strategic guide to cannabis governance, public health, justice, sustainable development and economic transformation.",
  },
  "/publications": {
    title: "Articles & Publications | Reclaiming the Green Gold",
    description:
      "Read research and strategic insights on cannabis governance, public health, justice, sustainable development and inclusive economic transformation.",
  },
  "/technical-assistance": {
    title: "Technical Assistance | Reclaiming the Green Gold",
    description:
      "Explore strategic advisory support for governments, institutions and partners navigating cannabis governance, policy and sustainable development.",
  },
  "/authors": {
    title: "Meet the Authors | Reclaiming the Green Gold",
    description:
      "Meet the authors of Reclaiming the Green Gold and explore the research, experience and perspectives informing their work on cannabis governance.",
  },
  "/endorsements": {
    title: "Endorsements | Reclaiming the Green Gold",
    description:
      "Read independent commentary and institutional reviews for Reclaiming the Green Gold.",
  },
  "/disclaimer": {
    title: "Disclaimer | Reclaiming the Green Gold",
    description:
      "Legal disclaimer for the Reclaiming the Green Gold publication and knowledge platform.",
  },
  "/cookies": {
    title: "Cookie Policy | Reclaiming the Green Gold",
    description:
      "Cookie policy and privacy practices for the Reclaiming the Green Gold platform.",
  },
};

export function metadataForPath(location: string): PageMetadata {
  const pathname = location.split(/[?#]/, 1)[0].replace(/\/+$/, "") || "/";
  if (ROUTE_METADATA[pathname]) return ROUTE_METADATA[pathname];
  if (pathname.startsWith("/publications/")) {
    return {
      title: `Research Publication | ${SITE_NAME}`,
      description:
        "Read a verified research publication from Reclaiming the Green Gold on cannabis governance, policy and sustainable development.",
      type: "article",
    };
  }
  return {
    title: `Page Not Found | ${SITE_NAME}`,
    description:
      "The requested page could not be found. Explore Reclaiming the Green Gold for research and strategic thinking on cannabis governance.",
  };
}

export function metadataForPublication(
  publication: ResearchPublication,
): PageMetadata {
  return {
    title: publication.seoTitle || `${publication.title} | ${SITE_NAME}`,
    description:
      publication.seoDescription ||
      publication.abstract.replace(/\s+/g, " ").trim().slice(0, 160),
    type: "article",
  };
}

export function globalJsonLd(siteOrigin: string): JsonLd[] {
  const homeUrl = new URL("/", siteOrigin).href;
  const organizationId = new URL("/#organization", siteOrigin).href;

  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": organizationId,
      name: SITE_NAME,
      url: homeUrl,
      description:
        "An independent knowledge platform exploring cannabis governance, public health, justice, sustainable development and inclusive economic transformation.",
      logo: new URL("/rgg-favicon.png", siteOrigin).href,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": new URL("/#website", siteOrigin).href,
      name: SITE_NAME,
      url: homeUrl,
      inLanguage: ["en", "fr"],
      publisher: { "@id": organizationId },
    },
  ];
}

export function bookJsonLd(siteOrigin: string): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    "@id": new URL("/book/#book", siteOrigin).href,
    name: "Reclaiming the Green Gold",
    alternateName:
      "Reclaiming the Green Gold: Cannabis at the Crossroads of Health, Justice and Sustainable Development",
    description: ROUTE_METADATA["/book"].description,
    url: new URL("/book/", siteOrigin).href,
    image: new URL("/images/cover-front.png", siteOrigin).href,
    author: BOOK_AUTHORS.map((name) => ({
      "@type": "Person",
      name,
    })),
    inLanguage: "en",
    genre: [
      "Cannabis governance",
      "Public health",
      "Justice",
      "Sustainable development",
    ],
    creativeWorkStatus: "Forthcoming",
    copyrightYear: 2026,
  };
}

export function publicationJsonLd(
  publication: ResearchPublication,
  siteOrigin: string,
): JsonLd {
  const url = new URL(`/publications/${publication.slug}/`, siteOrigin).href;
  const isArticle = publication.publicationType === "article";

  return {
    "@context": "https://schema.org",
    "@type": isArticle ? "Article" : "CreativeWork",
    "@id": `${url}#publication`,
    headline: publication.title,
    name: publication.title,
    description: publication.abstract,
    url,
    datePublished: publication.publicationDate,
    author: publication.authors.map((author) => ({
      "@type": "Person",
      name: author.name,
    })),
    inLanguage: "en",
    ...(publication.category ? { about: publication.category } : {}),
    ...(publication.doi
      ? { identifier: { "@type": "PropertyValue", propertyID: "DOI", value: publication.doi } }
      : {}),
    ...(publication.featuredImage
      ? { image: new URL(publication.featuredImage, siteOrigin).href }
      : {}),
    publisher: { "@id": new URL("/#organization", siteOrigin).href },
    isPartOf: { "@id": new URL("/#website", siteOrigin).href },
  };
}

export function applyPageMetadata(
  metadata: PageMetadata,
  pathname: string,
): void {
  const pageUrl = new URL(pathname, window.location.origin);
  pageUrl.search = "";
  pageUrl.hash = "";
  if (pageUrl.pathname !== "/" && !pageUrl.pathname.endsWith("/")) {
    pageUrl.pathname += "/";
  }
  document.title = metadata.title;
  const values: Array<[string, string]> = [
    ['meta[name="description"]', metadata.description],
    ['meta[property="og:title"]', metadata.title],
    ['meta[property="og:description"]', metadata.description],
    ['meta[property="og:type"]', metadata.type ?? "website"],
    ['meta[property="og:url"]', pageUrl.href],
    ['meta[name="twitter:title"]', metadata.title],
    ['meta[name="twitter:description"]', metadata.description],
  ];
  values.forEach(([selector, content]) =>
    document.querySelector(selector)?.setAttribute("content", content),
  );
  let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.append(canonical);
  }
  canonical.href = pageUrl.href;
}