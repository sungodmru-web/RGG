import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const administratorsTable = pgTable("administrators", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  clerkUserId: text("clerk_user_id").unique(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertAdministratorSchema = createInsertSchema(administratorsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertAdministrator = z.infer<typeof insertAdministratorSchema>;
export type Administrator = typeof administratorsTable.$inferSelect;