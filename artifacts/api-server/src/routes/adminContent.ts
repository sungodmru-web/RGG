import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { Readable } from "node:stream";
import { z } from "zod";
import {
  adminActivityTable, db, endorsementsTable, mediaTable, publicationsTable,
  themesTable,
} from "@workspace/db";
import {
  authenticatedAdministratorId, requireAdministrator, requireTrustedAdminOrigin,
  verifyAdminCsrfToken,
} from "../middlewares/adminSecurity";
import { ObjectNotFoundError, ObjectStorageService } from "../lib/objectStorage";

const router: IRouter = Router();
const storage = new ObjectStorageService();
function parameter(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}
const language = z.enum(["english", "french", "bilingual"]);
const themeBody = z.object({
  name: z.string().trim().min(1).max(120), slug: z.string().regex(/^[a-z0-9-]+$/),
  englishLabel: z.string().trim().min(1).max(160), frenchLabel: z.string().trim().min(1).max(160),
  description: z.string().max(2000).nullable().optional(), displayOrder: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
}).strict();
const mediaRequest = z.object({
  name: z.string().trim().min(1).max(255), size: z.number().int().positive(),
  contentType: z.string().min(1), purpose: z.enum(["publication-pdf", "publication-image", "endorsement-portrait", "general"]),
}).strict();
const objectPath = z.string()
  .max(2048)
  .regex(/^\/objects\/[A-Za-z0-9._~/-]+$/)
  .refine((path) => {
    const segments = path.slice("/objects/".length).split("/");
    return segments.every((segment) => segment.length > 0 && segment !== "." && segment !== "..");
  });
const registerMedia = mediaRequest.extend({ objectPath }).strict();

function event(req: Parameters<typeof authenticatedAdministratorId>[0], action: string, entity: string, entityId?: string) {
  void db.insert(adminActivityTable).values({ action, entity, entityId, administratorId: authenticatedAdministratorId(req) }).catch(() => undefined);
}
function safeName(name: string) {
  return name.normalize("NFKC").replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 180);
}
function extension(name: string) { return name.toLowerCase().split(".").pop() ?? ""; }
function isImageMagic(bytes: Buffer, mime: string) {
  if (mime === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mime === "image/png") return bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  if (mime === "image/webp") return bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP";
  if (mime === "image/avif") {
    if (bytes.subarray(4, 8).toString() !== "ftyp") return false;
    for (let offset = 8; offset + 4 <= bytes.length; offset += 4) {
      const brand = bytes.subarray(offset, offset + 4).toString();
      if (brand === "avif" || brand === "avis") return true;
    }
    return false;
  }
  return false;
}
function uploadLimit(name: "MAX_PDF_UPLOAD_MB" | "MAX_IMAGE_UPLOAD_MB", fallback: number) {
  const value = Number(process.env[name] ?? fallback);
  return (Number.isFinite(value) && value > 0 ? value : fallback) * 1024 * 1024;
}

router.use("/admin/themes", requireAdministrator, requireTrustedAdminOrigin);
router.get("/admin/themes", async (_req, res) => {
  res.json(await db.select().from(themesTable).orderBy(asc(themesTable.displayOrder), asc(themesTable.name)));
});
router.post("/admin/themes", verifyAdminCsrfToken, async (req, res) => {
  const parsed = themeBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid theme" }); return; }
  try {
    const [theme] = await db.insert(themesTable).values(parsed.data).returning();
    event(req, "theme.created", "theme", theme.id); res.status(201).json(theme);
  } catch { res.status(409).json({ error: "Theme name or slug already exists" }); }
});
router.patch("/admin/themes/:id", verifyAdminCsrfToken, async (req, res) => {
  const parsed = themeBody.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid theme" }); return; }
  const [theme] = await db.update(themesTable).set({ ...parsed.data, updatedAt: new Date() }).where(eq(themesTable.id, parameter(req.params.id))).returning();
  if (!theme) { res.status(404).json({ error: "Theme not found" }); return; }
  event(req, "theme.updated", "theme", theme.id); res.json(theme);
});
router.delete("/admin/themes/:id", verifyAdminCsrfToken, async (req, res) => {
  const [theme] = await db.update(themesTable).set({ active: false, updatedAt: new Date() }).where(eq(themesTable.id, parameter(req.params.id))).returning({ id: themesTable.id });
  if (!theme) { res.status(404).json({ error: "Theme not found" }); return; }
  event(req, "theme.archived", "theme", theme.id); res.sendStatus(204);
});

router.use("/admin/media", requireAdministrator, requireTrustedAdminOrigin);
router.get("/admin/media", async (req, res) => {
  const query = typeof req.query.search === "string" ? req.query.search : undefined;
  const type = req.query.type === "pdf" || req.query.type === "image" ? req.query.type : undefined;
  const where = and(query ? ilike(mediaTable.originalFilename, `%${query}%`) : undefined, type ? eq(mediaTable.mediaType, type) : undefined);
  res.json(await db.select().from(mediaTable).where(where).orderBy(desc(mediaTable.createdAt)));
});
router.post("/admin/media/request-url", verifyAdminCsrfToken, async (req, res) => {
  const parsed = mediaRequest.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid upload metadata" }); return; }
  const maxPdf = uploadLimit("MAX_PDF_UPLOAD_MB", 25);
  const maxImage = uploadLimit("MAX_IMAGE_UPLOAD_MB", 15);
  const ext = extension(parsed.data.name);
  const pdf = parsed.data.purpose === "publication-pdf";
  const image = parsed.data.purpose !== "publication-pdf";
  const validImage = ["jpg", "jpeg", "png", "webp", "avif"].includes(ext) && ["image/jpeg", "image/png", "image/webp", "image/avif"].includes(parsed.data.contentType);
  if ((pdf && (ext !== "pdf" || parsed.data.contentType !== "application/pdf" || parsed.data.size > maxPdf)) ||
      (image && (!validImage || parsed.data.size > maxImage))) {
    res.status(400).json({ error: "Unsupported or oversized media file" }); return;
  }
  try {
    const upload = await storage.createUpload();
    res.json({ ...upload, originalFilename: safeName(parsed.data.name), maxBytes: pdf ? maxPdf : undefined });
  } catch { res.status(503).json({ error: "Upload service unavailable" }); }
});
router.post("/admin/media/register", verifyAdminCsrfToken, async (req, res) => {
  const parsed = registerMedia.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid upload registration" }); return; }
  const input = parsed.data;
  const maxPdf = uploadLimit("MAX_PDF_UPLOAD_MB", 25);
  const maxImage = uploadLimit("MAX_IMAGE_UPLOAD_MB", 15);
  const pdf = input.purpose === "publication-pdf";
  const ext = extension(input.name);
  const allowedMime = pdf ? input.contentType === "application/pdf" && ext === "pdf" : ["image/jpeg", "image/png", "image/webp", "image/avif"].includes(input.contentType) && ["jpg", "jpeg", "png", "webp", "avif"].includes(ext);
  try {
    const metadata = await storage.metadata(input.objectPath);
    const bytes = await storage.firstBytes(input.objectPath, 32);
    const size = Number(metadata.size ?? input.size);
    const mime = String(metadata.contentType ?? "");
    const magic = pdf ? bytes.subarray(0, 5).toString() === "%PDF-" : isImageMagic(bytes, mime);
    const sizeLimit = pdf ? maxPdf : maxImage;
    const metadataMatchesRequest = mime === input.contentType;
    if (!allowedMime || !metadataMatchesRequest || !magic || !Number.isFinite(size) || size > sizeLimit || size <= 0) {
      res.status(400).json({ error: "Media validation failed" }); return;
    }
    const [media] = await db.insert(mediaTable).values({
      storageKey: input.objectPath, originalFilename: safeName(input.name), mimeType: mime,
      fileSize: size, mediaType: pdf ? "pdf" : "image", purpose: input.purpose,
      uploadedBy: authenticatedAdministratorId(req),
    }).returning();
    event(req, "media.uploaded", "media", media.id); res.status(201).json(media);
  } catch (error) {
    if (error instanceof ObjectNotFoundError) { res.status(404).json({ error: "Uploaded object not found" }); return; }
    res.status(400).json({ error: "Media validation failed" });
  }
});
router.delete("/admin/media/:id", verifyAdminCsrfToken, async (req, res) => {
  const [media] = await db.select().from(mediaTable).where(eq(mediaTable.id, parameter(req.params.id))).limit(1);
  if (!media) { res.status(404).json({ error: "Media not found" }); return; }
  const [used] = await db.select({ id: publicationsTable.id }).from(publicationsTable).where(or(eq(publicationsTable.pdfMediaId, media.id), eq(publicationsTable.featuredImageMediaId, media.id))).limit(1);
  const [usedEndorsement] = await db.select({ id: endorsementsTable.id }).from(endorsementsTable).where(eq(endorsementsTable.photoMediaId, media.id)).limit(1);
  if (used || usedEndorsement) { res.status(409).json({ error: "Media is still attached to content" }); return; }
  try {
    await storage.delete(media.storageKey);
  } catch (error) {
    if (!(error instanceof ObjectNotFoundError)) {
      res.status(503).json({ error: "Media storage deletion failed" });
      return;
    }
  }
  await db.delete(mediaTable).where(eq(mediaTable.id, media.id)); event(req, "media.deleted", "media", media.id); res.sendStatus(204);
});

router.get("/admin/activity", requireAdministrator, async (_req, res) => {
  res.json(await db.select().from(adminActivityTable).orderBy(desc(adminActivityTable.createdAt)).limit(100));
});
router.get("/admin/publications/:id/preview", requireAdministrator, async (req, res) => {
  const [publication] = await db.select().from(publicationsTable).where(eq(publicationsTable.id, parameter(req.params.id))).limit(1);
  if (!publication) { res.status(404).json({ error: "Publication not found" }); return; }
  res.json({ ...publication, preview: true });
});

router.get("/media/:id", async (req, res) => {
  const [media] = await db.select().from(mediaTable).where(eq(mediaTable.id, parameter(req.params.id))).limit(1);
  if (!media) { res.status(404).json({ error: "Media not found" }); return; }
  const [published] = await db.select({ id: publicationsTable.id }).from(publicationsTable).where(and(eq(publicationsTable.status, "published"), or(eq(publicationsTable.pdfMediaId, media.id), eq(publicationsTable.featuredImageMediaId, media.id)))).limit(1);
  const [approved] = await db.select({ id: endorsementsTable.id }).from(endorsementsTable).where(and(eq(endorsementsTable.status, "approved"), eq(endorsementsTable.photoMediaId, media.id))).limit(1);
  if (!published && !approved) { const access = await import("../middlewares/adminSecurity").then(({ getAdministratorAccess }) => getAdministratorAccess(req)); if (access !== "admin") { res.status(access === "unauthenticated" ? 401 : 403).json({ error: "Administrator access required" }); return; } }
  try {
    const response = await storage.response(await storage.file(media.storageKey));
    response.headers.forEach((value, key) => res.setHeader(key, value));
    if (response.body) Readable.fromWeb(response.body as ReadableStream<Uint8Array>).pipe(res); else res.end();
  } catch { res.status(404).json({ error: "Media not found" }); }
});

export default router;