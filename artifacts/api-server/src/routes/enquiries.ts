import { createHash } from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { z } from "zod";
import { CreateEnquiryBody } from "@workspace/api-zod";
import { db, enquiriesTable, adminActivityTable } from "@workspace/db";
import { requireAdministrator, requireTrustedAdminOrigin, verifyAdminCsrfToken, authenticatedAdministratorId } from "../middlewares/adminSecurity";
import { sendEnquiryEmail } from "../lib/enquiries";

const router: IRouter = Router();
const limits = new Map<string, { count: number; reset: number }>();
const status = z.enum(["new", "in_progress", "resolved"]);
function id(req: { params: { id?: string | string[] } }) { return Array.isArray(req.params.id) ? req.params.id[0] ?? "" : req.params.id ?? ""; }

router.post("/enquiries", async (req, res): Promise<void> => {
  const parsed = CreateEnquiryBody.safeParse(req.body);
  if (!parsed.success || parsed.data.honeypot !== "") { res.status(400).json({ error: "Invalid enquiry" }); return; }
  const key = createHash("sha256").update(req.ip || "unknown").digest("hex");
  const now = Date.now(); const current = limits.get(key);
  if (current && current.reset > now && current.count >= 5) { res.setHeader("Retry-After", "3600"); res.status(429).json({ error: "Too many requests" }); return; }
  limits.set(key, current && current.reset > now ? { count: current.count + 1, reset: current.reset } : { count: 1, reset: now + 3600000 });
  const [enquiry] = await db.insert(enquiriesTable).values({ ...parsed.data, organization: parsed.data.organization || null }).returning();
  try {
    const delivery = await sendEnquiryEmail(parsed.data);
    await db.update(enquiriesTable).set({ deliveryStatus: delivery.id ? "sent" : "failed", providerId: delivery.id ?? null, providerError: delivery.error ?? null, deliveryAttemptedAt: new Date() }).where(eq(enquiriesTable.id, enquiry.id));
  } catch {
    await db.update(enquiriesTable).set({ deliveryStatus: "failed", providerError: "provider_request_failed", deliveryAttemptedAt: new Date() }).where(eq(enquiriesTable.id, enquiry.id));
  }
  res.json({ accepted: true });
});

router.use("/admin/enquiries", requireAdministrator, requireTrustedAdminOrigin);
router.get("/admin/enquiries", async (_req, res): Promise<void> => {
  const items = await db.select().from(enquiriesTable).orderBy(desc(enquiriesTable.createdAt));
  const counts = { total: items.length, new: 0, inProgress: 0, resolved: 0, deliveryFailed: 0 };
  for (const item of items) {
    if (item.reviewStatus === "in_progress") counts.inProgress += 1;
    else counts[item.reviewStatus] += 1;
    if (item.deliveryStatus === "failed") counts.deliveryFailed += 1;
  }
  res.json({ items, counts });
});
router.get("/admin/enquiries/:id", async (req, res): Promise<void> => {
  const [item] = await db.select().from(enquiriesTable).where(eq(enquiriesTable.id, id(req))).limit(1);
  if (!item) { res.status(404).json({ error: "Enquiry not found" }); return; }
  res.json(item);
});
router.patch("/admin/enquiries/:id", verifyAdminCsrfToken, async (req, res): Promise<void> => {
  const parsed = z.object({ reviewStatus: status }).strict().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid enquiry update" }); return; }
  const [item] = await db.update(enquiriesTable).set({ reviewStatus: parsed.data.reviewStatus, updatedAt: new Date() }).where(eq(enquiriesTable.id, id(req))).returning();
  if (!item) { res.status(404).json({ error: "Enquiry not found" }); return; }
  void db.insert(adminActivityTable).values({ action: "enquiry.reviewed", entity: "enquiry", entityId: item.id, administratorId: authenticatedAdministratorId(req) }).catch(() => undefined);
  res.json(item);
});
export default router;