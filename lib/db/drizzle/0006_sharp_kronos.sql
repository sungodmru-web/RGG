CREATE TYPE "public"."publication_language" AS ENUM('english', 'french', 'bilingual');--> statement-breakpoint
CREATE TYPE "public"."endorsement_language" AS ENUM('english', 'french', 'bilingual');--> statement-breakpoint
CREATE TYPE "public"."media_purpose" AS ENUM('publication-pdf', 'publication-image', 'endorsement-portrait', 'general');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('pdf', 'image');--> statement-breakpoint
CREATE TABLE "themes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"english_label" text NOT NULL,
	"french_label" text NOT NULL,
	"description" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "themes_name_unique" UNIQUE("name"),
	CONSTRAINT "themes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"storage_key" text NOT NULL,
	"original_filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"media_type" "media_type" NOT NULL,
	"purpose" "media_purpose" DEFAULT 'general' NOT NULL,
	"uploaded_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_storage_key_unique" UNIQUE("storage_key")
);
--> statement-breakpoint
CREATE TABLE "admin_activity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" text,
	"administrator_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "publications" ADD COLUMN "theme_id" uuid;--> statement-breakpoint
ALTER TABLE "publications" ADD COLUMN "language" "publication_language" DEFAULT 'english' NOT NULL;--> statement-breakpoint
ALTER TABLE "publications" ADD COLUMN "featured_image_media_id" uuid;--> statement-breakpoint
ALTER TABLE "publications" ADD COLUMN "pdf_media_id" uuid;--> statement-breakpoint
ALTER TABLE "publications" ADD COLUMN "updated_by" text;--> statement-breakpoint
ALTER TABLE "endorsements" ADD COLUMN "language" "endorsement_language" DEFAULT 'english' NOT NULL;--> statement-breakpoint
ALTER TABLE "endorsements" ADD COLUMN "verification_note" text;--> statement-breakpoint
ALTER TABLE "endorsements" ADD COLUMN "verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "endorsements" ADD COLUMN "photo_media_id" uuid;--> statement-breakpoint
ALTER TABLE "endorsements" ADD COLUMN "created_by" text;--> statement-breakpoint
ALTER TABLE "endorsements" ADD COLUMN "updated_by" text;