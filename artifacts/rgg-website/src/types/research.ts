export const PUBLICATION_TYPES = [
  "research-paper",
  "policy-brief",
  "article",
  "commentary",
  "report",
  "case-study",
] as const;

export type PublicationType = (typeof PUBLICATION_TYPES)[number];

export interface ResearchAuthor {
  name: string;
  role?: string;
}

export interface ResearchPublication {
  id: string;
  slug: string;

  title: string;
  subtitle?: string;
  abstract: string;

  publicationType: PublicationType;
  category?: string;

  authors: ResearchAuthor[];

  publicationDate: string;
  readingTime?: number;

  featured?: boolean;

  featuredImage?: string;

  pdfUrl?: string;
  externalUrl?: string;
  doi?: string;

  content?: string;

  seoTitle?: string;
  seoDescription?: string;
}

export interface PublicationTypeOption {
  value: "all" | PublicationType;
  label: string;
}