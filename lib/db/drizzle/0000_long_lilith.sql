DO $$ BEGIN
 CREATE TYPE "public"."publication_status" AS ENUM('draft', 'published', 'archived');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."publication_type" AS ENUM('research-paper', 'policy-brief', 'article', 'commentary', 'report', 'case-study');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "publications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"abstract" text NOT NULL,
	"publication_type" "publication_type" NOT NULL,
	"category" text,
	"authors" jsonb NOT NULL,
	"publication_date" date,
	"reading_time" integer,
	"featured" boolean DEFAULT false NOT NULL,
	"featured_image" text,
	"pdf_url" text,
	"external_url" text,
	"doi" text,
	"content" text,
	"seo_title" text,
	"seo_description" text,
	"status" "publication_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "publications_slug_unique" UNIQUE("slug"),
	CONSTRAINT "published_publication_date_required" CHECK ("publications"."status" <> 'published' OR "publications"."publication_date" IS NOT NULL)
);--> statement-breakpoint
ALTER TABLE "publications" ADD COLUMN IF NOT EXISTS "status" "publication_status";--> statement-breakpoint
DO $$ BEGIN
 IF EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'publications'
    AND column_name = 'is_published'
 ) THEN
  UPDATE "publications"
  SET "status" = CASE
   WHEN "is_published" THEN 'published'::"publication_status"
   ELSE 'draft'::"publication_status"
  END
  WHERE "status" IS NULL;
 END IF;
END $$;--> statement-breakpoint
UPDATE "publications"
SET "status" = 'draft'::"publication_status"
WHERE "status" IS NULL;--> statement-breakpoint
ALTER TABLE "publications" ALTER COLUMN "status" SET DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE "publications" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "publications" ALTER COLUMN "publication_date" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "publications" DROP COLUMN IF EXISTS "is_published";--> statement-breakpoint
DO $$ BEGIN
 IF NOT EXISTS (
  SELECT 1
  FROM pg_constraint
  WHERE conname = 'published_publication_date_required'
    AND conrelid = 'public.publications'::regclass
 ) THEN
  ALTER TABLE "publications"
   ADD CONSTRAINT "published_publication_date_required"
   CHECK ("status" <> 'published' OR "publication_date" IS NOT NULL);
 END IF;
END $$;--> statement-breakpoint
DO $$ DECLARE
 actual_columns text[];
 publication_status_values text[];
 publication_type_values text[];
BEGIN
 SELECT array_agg(column_name::text ORDER BY column_name)
 INTO actual_columns
 FROM information_schema.columns
 WHERE table_schema = 'public' AND table_name = 'publications';

 IF actual_columns IS DISTINCT FROM ARRAY[
  'abstract', 'authors', 'category', 'content', 'created_at', 'doi',
  'external_url', 'featured', 'featured_image', 'id', 'pdf_url',
  'publication_date', 'publication_type', 'reading_time', 'seo_description',
  'seo_title', 'slug', 'status', 'subtitle', 'title', 'updated_at'
 ]::text[] THEN
  RAISE EXCEPTION 'publications schema mismatch after baseline migration: %', actual_columns;
 END IF;

 SELECT array_agg(enumlabel::text ORDER BY enumsortorder)
 INTO publication_status_values
 FROM pg_enum
 JOIN pg_type ON pg_type.oid = pg_enum.enumtypid
 JOIN pg_namespace ON pg_namespace.oid = pg_type.typnamespace
 WHERE pg_namespace.nspname = 'public' AND pg_type.typname = 'publication_status';

 IF publication_status_values IS DISTINCT FROM ARRAY['draft', 'published', 'archived']::text[] THEN
  RAISE EXCEPTION 'publication_status enum mismatch after baseline migration: %', publication_status_values;
 END IF;

 SELECT array_agg(enumlabel::text ORDER BY enumsortorder)
 INTO publication_type_values
 FROM pg_enum
 JOIN pg_type ON pg_type.oid = pg_enum.enumtypid
 JOIN pg_namespace ON pg_namespace.oid = pg_type.typnamespace
 WHERE pg_namespace.nspname = 'public' AND pg_type.typname = 'publication_type';

 IF publication_type_values IS DISTINCT FROM ARRAY[
  'research-paper', 'policy-brief', 'article', 'commentary', 'report', 'case-study'
 ]::text[] THEN
  RAISE EXCEPTION 'publication_type enum mismatch after baseline migration: %', publication_type_values;
 END IF;

 IF NOT EXISTS (
  SELECT 1
  FROM pg_constraint
  WHERE conname = 'published_publication_date_required'
    AND conrelid = 'public.publications'::regclass
    AND contype = 'c'
 ) THEN
  RAISE EXCEPTION 'published publication date constraint missing after baseline migration';
 END IF;
END $$;
