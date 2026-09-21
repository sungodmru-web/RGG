import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const adminRateLimitsTable = pgTable(
  "admin_rate_limits",
  {
    key: text("key").primaryKey(),
    count: integer("count").notNull(),
    resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
  },
  (table) => [index("admin_rate_limits_reset_at_idx").on(table.resetAt)],
);