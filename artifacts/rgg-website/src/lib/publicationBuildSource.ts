import pg from "pg";
import { z } from "zod";

import type { ResearchPublication } from "../types/research";

const { Pool } = pg;

const publicationFields = {
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  abstract: z.string(),
  publicationType: z.enum([
    "research-paper",
    "policy-brief",
    "article",
    "commentary",
    "report",
    "case-study",
  ]),
  category: z.string().optional(),
  themeId: z.string().uuid().nullish(),
  language: z.enum(["english", "french", "bilingual"]).optional(),
  authors: z.array(
    z.object({
      name: z.string().min(1),
      role: z.string().optional(),
    }),
  ),
  publicationDate: z.string().date(),
  readingTime: z.number().int().min(1).optional(),
  featured: z.boolean(),
  featuredImage: z.string().optional(),
  featuredImageMediaId: z.string().uuid().nullish(),
  pdfUrl: z.string().optional(),
  pdfMediaId: z.string().uuid().nullish(),
  externalUrl: z.string().optional(),
  doi: z.string().optional(),
  content: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
};

export const publicPublicationSchema = z.object(publicationFields).strict();
export const publicPublicationListSchema = z.array(publicPublicationSchema);

const databasePublicationRowSchema = z
  .object({
    status: z.enum(["draft", "published", "archived"]),
    id: z.string().uuid(),
    slug: z.string(),
    title: z.string(),
    subtitle: z.string().nullish(),
    abstract: z.string(),
    publicationType: publicationFields.publicationType,
    category: z.string().nullish(),
    themeId: z.string().uuid().nullish(),
    language: publicationFields.language,
    authors: publicationFields.authors,
    publicationDate: z.string().date().nullish(),
    readingTime: z.number().int().min(1).nullish(),
    featured: z.boolean(),
    featuredImage: z.string().nullish(),
    featuredImageMediaId: z.string().uuid().nullish(),
    pdfUrl: z.string().nullish(),
    pdfMediaId: z.string().uuid().nullish(),
    externalUrl: z.string().nullish(),
    doi: z.string().nullish(),
    content: z.string().nullish(),
    seoTitle: z.string().nullish(),
    seoDescription: z.string().nullish(),
  })
  .strict();

export const PUBLISHED_PUBLICATIONS_QUERY = `
  SELECT
    status,
    id::text AS id,
    slug,
    title,
    subtitle,
    abstract,
    publication_type AS "publicationType",
    category,
    theme_id::text AS "themeId",
    language,
    authors,
    publication_date::text AS "publicationDate",
    reading_time AS "readingTime",
    featured,
    featured_image AS "featuredImage",
    featured_image_media_id::text AS "featuredImageMediaId",
    pdf_url AS "pdfUrl",
    pdf_media_id::text AS "pdfMediaId",
    external_url AS "externalUrl",
    doi,
    content,
    seo_title AS "seoTitle",
    seo_description AS "seoDescription"
  FROM publications
  WHERE status = 'published'
  ORDER BY publication_date DESC
`;

export class PublicationMetadataValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PublicationMetadataValidationError";
  }
}

type DatabasePool = {
  query(config: {
    text: string;
    query_timeout: number;
  }): Promise<{ rows: unknown[] }>;
  end(): Promise<void>;
};

export type DatabasePoolFactory = (
  environment: NodeJS.ProcessEnv,
) => DatabasePool;

function databaseSslOptions(environment: NodeJS.ProcessEnv) {
  const enabled =
    environment.DATABASE_SSL?.toLowerCase() === "true" ||
    ["require", "verify-ca", "verify-full"].includes(
      environment.PGSSLMODE?.toLowerCase() ?? "",
    );
  if (!enabled) return undefined;
  return {
    rejectUnauthorized: true,
    ...(environment.DATABASE_SSL_CA
      ? { ca: environment.DATABASE_SSL_CA.replaceAll("\\n", "\n") }
      : {}),
  };
}

function databaseConnectionString(environment: NodeJS.ProcessEnv): string {
  const connectionString = environment.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is required for direct publication metadata builds.",
    );
  }
  if (!databaseSslOptions(environment)) return connectionString;

  const parsed = new URL(connectionString);
  for (const name of [
    "sslmode",
    "sslrootcert",
    "sslcert",
    "sslkey",
    "uselibpqcompat",
  ]) {
    parsed.searchParams.delete(name);
  }
  return parsed.toString();
}

export const createDatabasePool: DatabasePoolFactory = (environment) =>
  new Pool({
    connectionString: databaseConnectionString(environment),
    connectionTimeoutMillis: 5_000,
    max: 1,
    ssl: databaseSslOptions(environment),
  });

function invalidDatabaseRecord(message: string): PublicationMetadataValidationError {
  return new PublicationMetadataValidationError(
    `Published publication metadata contained an invalid database record: ${message}`,
  );
}

export function mapDatabasePublicationRow(
  row: unknown,
): ResearchPublication | undefined {
  const status = z
    .object({ status: z.enum(["draft", "published", "archived"]) })
    .safeParse(row);
  if (!status.success) {
    throw invalidDatabaseRecord(status.error.message);
  }
  if (status.data.status !== "published") return undefined;

  const parsed = databasePublicationRowSchema.safeParse(row);
  if (!parsed.success) {
    throw invalidDatabaseRecord(parsed.error.message);
  }

  const publication = parsed.data;
  const publicPublication = {
    id: publication.id,
    slug: publication.slug,
    title: publication.title,
    ...(publication.subtitle == null
      ? {}
      : { subtitle: publication.subtitle }),
    abstract: publication.abstract,
    publicationType: publication.publicationType,
    ...(publication.category == null ? {} : { category: publication.category }),
    themeId: publication.themeId,
    language: publication.language,
    authors: publication.authors,
    publicationDate: publication.publicationDate,
    ...(publication.readingTime == null
      ? {}
      : { readingTime: publication.readingTime }),
    featured: publication.featured,
    ...(publication.featuredImage == null
      ? {}
      : { featuredImage: publication.featuredImage }),
    featuredImageMediaId: publication.featuredImageMediaId,
    ...(publication.pdfUrl == null ? {} : { pdfUrl: publication.pdfUrl }),
    pdfMediaId: publication.pdfMediaId,
    ...(publication.externalUrl == null
      ? {}
      : { externalUrl: publication.externalUrl }),
    ...(publication.doi == null ? {} : { doi: publication.doi }),
    ...(publication.content == null ? {} : { content: publication.content }),
    ...(publication.seoTitle == null
      ? {}
      : { seoTitle: publication.seoTitle }),
    ...(publication.seoDescription == null
      ? {}
      : { seoDescription: publication.seoDescription }),
  };
  const validated = publicPublicationSchema.safeParse(publicPublication);
  if (!validated.success) {
    throw invalidDatabaseRecord(validated.error.message);
  }
  return validated.data as ResearchPublication;
}

export async function loadPublishedPublicationsFromDatabase(
  environment: NodeJS.ProcessEnv = process.env,
  poolFactory: DatabasePoolFactory = createDatabasePool,
): Promise<ResearchPublication[]> {
  const pool = poolFactory(environment);
  try {
    const result = await pool.query({
      text: PUBLISHED_PUBLICATIONS_QUERY,
      query_timeout: 5_000,
    });
    return result.rows.flatMap((row) => {
      const publication = mapDatabasePublicationRow(row);
      return publication ? [publication] : [];
    });
  } catch (error) {
    if (error instanceof PublicationMetadataValidationError) throw error;
    throw new Error(
      "Could not load published publication metadata from PostgreSQL.",
      { cause: error },
    );
  } finally {
    await pool.end();
  }
}