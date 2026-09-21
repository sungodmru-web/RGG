CREATE TABLE "admin_security_alerts" (
	"event_type" text PRIMARY KEY NOT NULL,
	"event_timestamps" timestamp with time zone[] NOT NULL,
	"last_alert_at" timestamp with time zone,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX "admin_security_alerts_updated_at_idx" ON "admin_security_alerts" USING btree ("updated_at");