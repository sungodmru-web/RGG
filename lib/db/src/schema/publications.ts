import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const publicationTypeEnum = pgEnum("publication_type", [
  "research-paper",
  "policy-brief",
  "article",
  "commentary",
  "report",
  "case-study",
]);

export const publicationStatusEnum = pgEnum("publication_status", [
  "draft",
  "published",
  "archived",
]);
export const publicationLanguageEnum = pgEnum("publication_language", [
  "english", "french", "bilingual",
]);

export type PublicationAuthor = {
  name: string;
  role?: string;
};

export const publicationsTable = pgTable(
  "publications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    abstract: text("abstract").notNull(),
    publicationType: publicationTypeEnum("publication_type").notNull(),
    category: text("category"),
    authors: jsonb("authors").$type<PublicationAuthor[]>().notNull(),
    publicationDate: date("publication_date", { mode: "string" }),
    readingTime: integer("reading_time"),
    featured: boolean("featured").notNull().default(false),
    featuredImage: text("featured_image"),
    pdfUrl: text("pdf_url"),
    externalUrl: text("external_url"),
    doi: text("doi"),
    content: text("content"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    status: publicationStatusEnum("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    createdBy: text("created_by"),
    publishedBy: text("published_by"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    archivedBy: text("archived_by"),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    themeId: uuid("theme_id"),
    language: publicationLanguageEnum("language").notNull().default("english"),
    featuredImageMediaId: uuid("featured_image_media_id"),
    pdfMediaId: uuid("pdf_media_id"),
    updatedBy: text("updated_by"),
  },
  (table) => [
    check(
      "published_publication_date_required",
      sql`${table.status} <> 'published' OR ${table.publicationDate} IS NOT NULL`,
    ),
  ],
);

export const insertPublicationSchema = createInsertSchema(
  publicationsTable,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPublication = z.infer<typeof insertPublicationSchema>;
export type Publication = typeof publicationsTable.$inferSelect;