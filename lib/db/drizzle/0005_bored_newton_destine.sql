CREATE TABLE "administrators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"clerk_user_id" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "administrators_name_unique" UNIQUE("name"),
	CONSTRAINT "administrators_clerk_user_id_unique" UNIQUE("clerk_user_id")
);
--> statement-breakpoint
ALTER TABLE "publications" ADD COLUMN "created_by" text;--> statement-breakpoint
ALTER TABLE "publications" ADD COLUMN "published_by" text;--> statement-breakpoint
ALTER TABLE "publications" ADD COLUMN "published_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "publications" ADD COLUMN "archived_by" text;--> statement-breakpoint
ALTER TABLE "publications" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "endorsements" ADD COLUMN "approved_by" text;--> statement-breakpoint
ALTER TABLE "endorsements" ADD COLUMN "approved_at" timestamp with time zone;--> statement-breakpoint
INSERT INTO "administrators" ("name") VALUES
	('Soobaschand Sweenarain'),
	('Shiva Sweenarain'),
	('Gavishta Harkoo'),
	('Neha Sweenarain')
ON CONFLICT ("name") DO NOTHING;