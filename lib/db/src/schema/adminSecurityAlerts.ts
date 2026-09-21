import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const adminSecurityAlertsTable = pgTable(
  "admin_security_alerts",
  {
    eventType: text("event_type").primaryKey(),
    eventTimestamps: timestamp("event_timestamps", {
      withTimezone: true,
      mode: "date",
    })
      .array()
      .notNull(),
    lastAlertAt: timestamp("last_alert_at", {
      withTimezone: true,
      mode: "date",
    }),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
  },
  (table) => [index("admin_security_alerts_updated_at_idx").on(table.updatedAt)],
);