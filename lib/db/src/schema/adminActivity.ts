import { text, timestamp, uuid } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";

export const adminActivityTable = pgTable("admin_activity", {
  id: uuid("id").primaryKey().defaultRandom(),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: text("entity_id"),
  administratorId: text("administrator_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AdminActivity = typeof adminActivityTable.$inferSelect;