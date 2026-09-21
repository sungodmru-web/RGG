import { createInsertSchema } from "drizzle-zod";
import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const enquiryReviewStatus = pgEnum("enquiry_review_status", ["new", "in_progress", "resolved"]);
export const enquiryDeliveryStatus = pgEnum("enquiry_delivery_status", ["pending", "sent", "failed"]);

export const enquiriesTable = pgTable("enquiries", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  organization: text("organization"),
  enquiryType: text("enquiry_type").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  language: text("language").notNull(),
  reviewStatus: enquiryReviewStatus("review_status").notNull().default("new"),
  deliveryStatus: enquiryDeliveryStatus("delivery_status").notNull().default("pending"),
  providerId: text("provider_id"),
  providerError: text("provider_error"),
  deliveryAttemptedAt: timestamp("delivery_attempted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertEnquirySchema = createInsertSchema(enquiriesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertEnquiry = z.infer<typeof insertEnquirySchema>;
export type Enquiry = typeof enquiriesTable.$inferSelect;