import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { mediaTable } from "./media";

export const endorsementStatusEnum = pgEnum("endorsement_status", [
  "draft",
  "approved",
  "archived",
]);
export const endorsementLanguageEnum = pgEnum("endorsement_language", [
  "english", "french", "bilingual",
]);

export const endorsementsTable = pgTable("endorsements", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  title: text("title"),
  organization: text("organization"),
  quote: text("quote").notNull(),
  photoUrl: text("photo_url"),
  sourceUrl: text("source_url"),
  status: endorsementStatusEnum("status").notNull().default("draft"),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  approvedBy: text("approved_by"),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  language: endorsementLanguageEnum("language").notNull().default("english"),
  verificationNote: text("verification_note"),
  verified: boolean("verified").notNull().default(false),
  photoMediaId: uuid("photo_media_id").references(() => mediaTable.id, {
    onDelete: "set null",
  }),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
});

export const insertEndorsementSchema = createInsertSchema(
  endorsementsTable,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertEndorsement = z.infer<typeof insertEndorsementSchema>;
export type Endorsement = typeof endorsementsTable.$inferSelect;