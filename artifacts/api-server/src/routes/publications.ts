import { and, desc, eq, sql } from "drizzle-orm";
import {
  Router,
  type IRouter,
  type Request,
  type Response,
} from "express";

import {
  CreateAdminPublicationBody,
  DeleteAdminPublicationParams,
  GetAdminPublicationParams,
  GetAdminPublicationResponse,
  GetPublicationParams,
  GetPublicationResponse,
  ListAdminPublicationsResponse,
  ListPublicationsResponse,
  UpdateAdminPublicationBody,
  UpdateAdminPublicationParams,
  UpdateAdminPublicationResponse,
} from "@workspace/api-zod";
import { adminActivityTable, db, publicationsTable, type Publication } from "@workspace/db";
import {
  requireAdministrator,
  requireTrustedAdminOrigin,
  verifyAdminCsrfToken,
  authenticatedAdministratorId,
} from "../middlewares/adminSecurity";
import { isValidPublicationContent } from "../lib/publicationRichText";

const router: IRouter = Router();

const nullablePublicationFields = [
  "subtitle",
  "category",
  "publicationDate",
  "readingTime",
  "featuredImage",
  "pdfUrl",
  "externalUrl",
  "doi",
  "content",
  "seoTitle",
  "seoDescription",
] as const;

function normalizePublicationBody(body: unknown): unknown {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return body;
  }

  const normalized = { ...body } as Record<string, unknown>;
  for (const field of nullablePublicationFields) {
    if (normalized[field] === "") normalized[field] = null;
  }
  return normalized;
}

const CreatePublicationMutation = CreateAdminPublicationBody.strict();
const UpdatePublicationMutation = UpdateAdminPublicationBody.strict();

function toPublicPublication(publication: Publication) {
  return {
    id: publication.id,
    slug: publication.slug,
    title: publication.title,
    ...(publication.subtitle ? { subtitle: publication.subtitle } : {}),
    abstract: publication.abstract,
    publicationType: publication.publicationType,
    ...(publication.category ? { category: publication.category } : {}),
    themeId: publication.themeId,
    language: publication.language,
    authors: publication.authors,
    ...(publication.publicationDate
      ? { publicationDate: publication.publicationDate }
      : {}),
    ...(publication.readingTime
      ? { readingTime: publication.readingTime }
      : {}),
    featured: publication.featured,
    ...(publication.featuredImage
      ? { featuredImage: publication.featuredImage }
      : {}),
    featuredImageMediaId: publication.featuredImageMediaId,
    ...(publication.pdfUrl ? { pdfUrl: publication.pdfUrl } : {}),
    pdfMediaId: publication.pdfMediaId,
    ...(publication.externalUrl
      ? { externalUrl: publication.externalUrl }
      : {}),
    ...(publication.doi ? { doi: publication.doi } : {}),
    ...(publication.content ? { content: publication.content } : {}),
    ...(publication.seoTitle ? { seoTitle: publication.seoTitle } : {}),
    ...(publication.seoDescription
      ? { seoDescription: publication.seoDescription }
      : {}),
  };
}

function toAdminPublication(publication: Publication) {
  return {
    ...toPublicPublication(publication),
    status: publication.status,
    createdAt: publication.createdAt.toISOString(),
    updatedAt: publication.updatedAt.toISOString(),
    createdBy: publication.createdBy,
    updatedBy: publication.updatedBy,
    publishedBy: publication.publishedBy,
    publishedAt: publication.publishedAt?.toISOString() ?? null,
    archivedBy: publication.archivedBy,
    archivedAt: publication.archivedAt?.toISOString() ?? null,
  };
}

function isUniqueViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const candidate = error as { code?: unknown; cause?: unknown };
  return candidate.code === "23505" || isUniqueViolation(candidate.cause);
}

function currentPublicationDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function recordPublicationActivity(
  actorId: string,
  action: string,
  entityId: string,
): void {
  void db.insert(adminActivityTable).values({
    action,
    entity: "publication",
    entityId,
    administratorId: actorId,
  }).catch(() => undefined);
}

async function clearFeaturedPublications(
  transaction: Parameters<Parameters<typeof db.transaction>[0]>[0],
  updatedAt: Date,
): Promise<void> {
  await transaction.execute(
    sql`select pg_advisory_xact_lock(hashtext('publications-featured'))`,
  );
  await transaction
    .update(publicationsTable)
    .set({ featured: false, updatedAt })
    .where(eq(publicationsTable.featured, true))
    .returning({ id: publicationsTable.id });
}

router.get("/publications", async (_req, res): Promise<void> => {
  const publications = await db
    .select()
    .from(publicationsTable)
    .where(eq(publicationsTable.status, "published"))
    .orderBy(desc(publicationsTable.publicationDate));

  res.json(ListPublicationsResponse.parse(publications.map(toPublicPublication)));
});

router.get("/publications/:slug", async (req, res): Promise<void> => {
  const params = GetPublicationParams.safeParse(req.params);

  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [publication] = await db
    .select()
    .from(publicationsTable)
    .where(
      and(
        eq(publicationsTable.slug, params.data.slug),
        eq(publicationsTable.status, "published"),
      ),
    )
    .limit(1);

  if (!publication) {
    res.status(404).json({ error: "Publication not found" });
    return;
  }

  res.json(GetPublicationResponse.parse(toPublicPublication(publication)));
});

router.use(
  "/admin/publications",
  requireAdministrator,
  requireTrustedAdminOrigin,
);

router.get("/admin/publications", async (_req, res): Promise<void> => {
  const publications = await db
    .select()
    .from(publicationsTable)
    .orderBy(desc(publicationsTable.updatedAt));

  res.json(
    ListAdminPublicationsResponse.parse(
      publications.map(toAdminPublication),
    ),
  );
});

router.post("/admin/publications", verifyAdminCsrfToken, async (req, res): Promise<void> => {
  const body = CreatePublicationMutation.safeParse(
    normalizePublicationBody(req.body),
  );

  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  if (!isValidPublicationContent(body.data.content)) {
    res.status(400).json({ error: "Publication content has an invalid rich-text structure" });
    return;
  }

  try {
    const actorId = authenticatedAdministratorId(req);
    const publication = await db.transaction(async (transaction) => {
      const now = new Date();
      if (body.data.featured) {
        await clearFeaturedPublications(transaction, now);
      }

      const [created] = await transaction
        .insert(publicationsTable)
        .values({
          ...body.data,
          publicationDate:
            body.data.status === "published" && !body.data.publicationDate
              ? currentPublicationDate()
              : body.data.publicationDate,
          createdBy: actorId,
           updatedBy: actorId,
           ...(body.data.status === "published"
            ? { publishedBy: actorId, publishedAt: now }
            : {}),
        })
        .returning();
      return created;
    });

    res
      .status(201)
      .json(
        GetAdminPublicationResponse.parse(
          toAdminPublication(publication),
        ),
      );
    recordPublicationActivity(actorId, body.data.status === "published" ? "publication.published" : "publication.created", publication.id);
  } catch (error) {
    if (isUniqueViolation(error)) {
      res.status(409).json({ error: "Publication slug already exists" });
      return;
    }
    throw error;
  }
});

router.get("/admin/publications/:id", async (req, res): Promise<void> => {
  const params = GetAdminPublicationParams.safeParse(req.params);

  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [publication] = await db
    .select()
    .from(publicationsTable)
    .where(eq(publicationsTable.id, params.data.id))
    .limit(1);

  if (!publication) {
    res.status(404).json({ error: "Publication not found" });
    return;
  }

  res.json(
    GetAdminPublicationResponse.parse(toAdminPublication(publication)),
  );
});

router.patch("/admin/publications/:id", verifyAdminCsrfToken, async (req, res): Promise<void> => {
  const params = UpdateAdminPublicationParams.safeParse(req.params);
  const body = UpdatePublicationMutation.safeParse(
    normalizePublicationBody(req.body),
  );

  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  if (!isValidPublicationContent(body.data.content)) {
    res.status(400).json({ error: "Publication content has an invalid rich-text structure" });
    return;
  }

  if (Object.keys(body.data).length === 0) {
    res.status(400).json({ error: "At least one field must be updated" });
    return;
  }

  try {
    const actorId = authenticatedAdministratorId(req);
    const publication = await db.transaction(async (transaction) => {
      const [existing] = await transaction
        .select()
        .from(publicationsTable)
        .where(eq(publicationsTable.id, params.data.id))
        .limit(1);

      if (!existing) return null;

      const nextStatus = body.data.status ?? existing.status;
      let nextPublicationDate =
        body.data.publicationDate === undefined
          ? existing.publicationDate
          : body.data.publicationDate;

      if (nextStatus === "published" && !nextPublicationDate) {
        nextPublicationDate =
          existing.status === "published" && existing.publicationDate
            ? existing.publicationDate
            : currentPublicationDate();
      }

      const updatedAt = new Date();
      const auditFields =
        existing.status !== nextStatus && nextStatus === "published"
          ? { publishedBy: actorId, publishedAt: updatedAt }
          : existing.status !== nextStatus && nextStatus === "archived"
            ? { archivedBy: actorId, archivedAt: updatedAt }
            : {};
      if (body.data.featured) {
        await clearFeaturedPublications(transaction, updatedAt);
      }

      const [updated] = await transaction
        .update(publicationsTable)
        .set({
          ...body.data,
          publicationDate: nextPublicationDate,
          ...auditFields,
           updatedBy: actorId,
          updatedAt,
        })
        .where(eq(publicationsTable.id, params.data.id))
        .returning();
      return updated ?? null;
    });

    if (!publication) {
      res.status(404).json({ error: "Publication not found" });
      return;
    }

    res.json(
      UpdateAdminPublicationResponse.parse(
        toAdminPublication(publication),
      ),
    );
    recordPublicationActivity(
      actorId,
      existingStatusForActivity(publication.status, body.data.status),
      publication.id,
    );
  } catch (error) {
    if (isUniqueViolation(error)) {
      res.status(409).json({ error: "Publication slug already exists" });
      return;
    }
    throw error;
  }
});

function existingStatusForActivity(
  status: Publication["status"],
  requested: Publication["status"] | undefined,
): string {
  if (requested === "published" && status === "published") return "publication.published";
  if (requested === "archived" && status === "archived") return "publication.archived";
  return "publication.updated";
}

router.delete("/admin/publications/:id", verifyAdminCsrfToken, async (req, res): Promise<void> => {
  const params = DeleteAdminPublicationParams.safeParse(req.params);

  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [existing] = await db
    .select({ id: publicationsTable.id, status: publicationsTable.status })
    .from(publicationsTable)
    .where(eq(publicationsTable.id, params.data.id))
    .limit(1);

  if (!existing) {
    res.status(404).json({ error: "Publication not found" });
    return;
  }

  if (existing.status !== "archived") {
    res.status(409).json({
      error: "Only archived publications can be permanently deleted",
    });
    return;
  }

  const [publication] = await db
    .delete(publicationsTable)
    .where(
      and(
        eq(publicationsTable.id, params.data.id),
        eq(publicationsTable.status, "archived"),
      ),
    )
    .returning({ id: publicationsTable.id });

  if (!publication) {
    res.status(409).json({
      error: "Publication changed before it could be deleted",
    });
    return;
  }

  recordPublicationActivity(
    authenticatedAdministratorId(req),
    "publication.deleted",
    publication.id,
  );
  res.sendStatus(204);
});

export default router;