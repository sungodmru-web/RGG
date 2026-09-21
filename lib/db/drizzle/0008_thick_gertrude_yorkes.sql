CREATE TYPE "public"."enquiry_delivery_status" AS ENUM('pending', 'sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."enquiry_review_status" AS ENUM('new', 'in_progress', 'resolved');--> statement-breakpoint
CREATE TABLE "enquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"organization" text,
	"enquiry_type" text NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"language" text NOT NULL,
	"review_status" "enquiry_review_status" DEFAULT 'new' NOT NULL,
	"delivery_status" "enquiry_delivery_status" DEFAULT 'pending' NOT NULL,
	"provider_id" text,
	"provider_error" text,
	"delivery_attempted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
