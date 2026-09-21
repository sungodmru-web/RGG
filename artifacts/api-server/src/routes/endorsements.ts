import { asc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";

import {
  CreateAdminEndorsementBody,
  DeleteAdminEndorsementParams,
  GetAdminEndorsementParams,
  GetAdminEndorsementResponse,
  ListAdminEndorsementsResponse,
  ListEndorsementsResponse,
  ReorderAdminEndorsementsBody,
  ReorderAdminEndorsementsResponse,
  UpdateAdminEndorsementBody,
  UpdateAdminEndorsementParams,
  UpdateAdminEndorsementResponse,
} from "@workspace/api-zod";
import {
  db,
  adminActivityTable,
  endorsementsTable,
  type Endorsement,
} from "@workspace/db";
import {
  requireAdministrator,
  requireTrustedAdminOrigin,
  verifyAdminCsrfToken,
  authenticatedAdministratorId,
} from "../middlewares/adminSecurity";

const router: IRouter = Router();

const nullableEndorsementFields = [
  "title",
  "organization",
  "photoUrl",
  "sourceUrl",
] as const;

function normalizeEndorsementBody(body: unknown): unknown {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return body;
  }

  const normalized = { ...body } as Record<string, unknown>;
  for (const field of nullableEndorsementFields) {
    if (normalized[field] === "") normalized[field] = null;
  }
  return normalized;
}

const CreateEndorsementMutation = CreateAdminEndorsementBody.strict();
const UpdateEndorsementMutation = UpdateAdminEndorsementBody.strict();
const ReorderEndorsementsMutation = ReorderAdminEndorsementsBody.strict();

class EndorsementNotFoundError extends Error {}

function toPublicEndorsement(endorsement: Endorsement) {
  return {
    id: endorsement.id,
    name: endorsement.name,
    title: endorsement.title,
    organization: endorsement.organization,
    quote: endorsement.quote,
    photoUrl: endorsement.photoUrl,
    sourceUrl: endorsement.sourceUrl,
    language: endorsement.language,
    photoMediaId: endorsement.photoMediaId,
    displayOrder: endorsement.displayOrder,
  };
}

function toAdminEndorsement(endorsement: Endorsement) {
  return {
    ...toPublicEndorsement(endorsement),
    status: endorsement.status,
    createdAt: endorsement.createdAt.toISOString(),
    updatedAt: endorsement.updatedAt.toISOString(),
    approvedBy: endorsement.approvedBy,
    approvedAt: endorsement.approvedAt?.toISOString() ?? null,
    verificationNote: endorsement.verificationNote,
    verified: endorsement.verified,
    createdBy: endorsement.createdBy,
    updatedBy: endorsement.updatedBy,
  };
}

router.get("/endorsements", async (_req, res): Promise<void> => {
  const endorsements = await db
    .select()
    .from(endorsementsTable)
    .where(eq(endorsementsTable.status, "approved"))
    .orderBy(asc(endorsementsTable.displayOrder), asc(endorsementsTable.createdAt));

  res.json(ListEndorsementsResponse.parse(endorsements.map(toPublicEndorsement)));
});

router.use(
  "/admin/endorsements",
  requireAdministrator,
  requireTrustedAdminOrigin,
);

router.get("/admin/endorsements", async (_req, res): Promise<void> => {
  const endorsements = await db
    .select()
    .from(endorsementsTable)
    .orderBy(asc(endorsementsTable.displayOrder), asc(endorsementsTable.updatedAt));

  res.json(
    ListAdminEndorsementsResponse.parse(endorsements.map(toAdminEndorsement)),
  );
});

router.post(
  "/admin/endorsements",
  verifyAdminCsrfToken,
  async (req, res): Promise<void> => {
    const body = CreateEndorsementMutation.safeParse(
      normalizeEndorsementBody(req.body),
    );

    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }
    if (body.data.status === "approved") {
      res.status(400).json({ error: "Endorsements must be explicitly approved from their review page." });
      return;
    }

    const [created] = await db
      .insert(endorsementsTable)
     .values({ ...body.data, createdBy: authenticatedAdministratorId(req), updatedBy: authenticatedAdministratorId(req) })
      .returning();

    res
      .status(201)
      .json(GetAdminEndorsementResponse.parse(toAdminEndorsement(created)));
    void db.insert(adminActivityTable).values({
      action: "endorsement.created", entity: "endorsement", entityId: created.id,
      administratorId: authenticatedAdministratorId(req),
    }).catch(() => undefined);
  },
);

router.patch(
  "/admin/endorsements/order",
  verifyAdminCsrfToken,
  async (req, res): Promise<void> => {
    const body = ReorderEndorsementsMutation.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }

    const ids = body.data.items.map((item) => item.id);
    if (new Set(ids).size !== ids.length) {
      res.status(400).json({ error: "Each endorsement may appear only once" });
      return;
    }

    let updated: Endorsement[];
    try {
      updated = await db.transaction(async (transaction) => {
        for (const item of body.data.items) {
          const rows = await transaction
            .update(endorsementsTable)
            .set({
              displayOrder: item.displayOrder,
              updatedAt: new Date(),
            })
            .where(eq(endorsementsTable.id, item.id))
            .returning({ id: endorsementsTable.id });
          if (rows.length === 0) throw new EndorsementNotFoundError();
        }

        return transaction
          .select()
          .from(endorsementsTable)
          .orderBy(
            asc(endorsementsTable.displayOrder),
            asc(endorsementsTable.updatedAt),
          );
      });
    } catch (error) {
      if (error instanceof EndorsementNotFoundError) {
        res.status(404).json({ error: "Endorsement not found" });
        return;
      }
      throw error;
    }

    res.json(
      ReorderAdminEndorsementsResponse.parse(updated.map(toAdminEndorsement)),
    );
  },
);

router.get("/admin/endorsements/:id", async (req, res): Promise<void> => {
  const params = GetAdminEndorsementParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [endorsement] = await db
    .select()
    .from(endorsementsTable)
    .where(eq(endorsementsTable.id, params.data.id))
    .limit(1);

  if (!endorsement) {
    res.status(404).json({ error: "Endorsement not found" });
    return;
  }

  res.json(
    GetAdminEndorsementResponse.parse(toAdminEndorsement(endorsement)),
  );
});

router.patch(
  "/admin/endorsements/:id",
  verifyAdminCsrfToken,
  async (req, res): Promise<void> => {
    const params = UpdateAdminEndorsementParams.safeParse(req.params);
    const body = UpdateEndorsementMutation.safeParse(
      normalizeEndorsementBody(req.body),
    );

    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }
    if (Object.keys(body.data).length === 0) {
      res.status(400).json({ error: "At least one field must be updated" });
      return;
    }

    const actorId = authenticatedAdministratorId(req);
    const { approvalConfirmation, ...fields } = body.data;
    const [existing] = await db
      .select()
      .from(endorsementsTable)
      .where(eq(endorsementsTable.id, params.data.id))
      .limit(1);
    if (!existing) {
      res.status(404).json({ error: "Endorsement not found" });
      return;
    }
    if (fields.status === "approved" && existing.status !== "approved" &&
      approvalConfirmation !== "I confirm that this endorsement is authentic and authorized for publication.") {
      res.status(400).json({ error: "Approval confirmation is required." });
      return;
    }
    const [endorsement] = await db
      .update(endorsementsTable)
       .set({
        ...fields,
        ...(fields.status === "approved" && existing.status !== "approved"
          ? { approvedBy: actorId, approvedAt: new Date() }
          : {}),
        updatedAt: new Date(),
         updatedBy: actorId,
      })
      .where(eq(endorsementsTable.id, params.data.id))
      .returning();

    if (!endorsement) {
      res.status(404).json({ error: "Endorsement not found" });
      return;
    }

    res.json(
      UpdateAdminEndorsementResponse.parse(toAdminEndorsement(endorsement)),
    );
    void db.insert(adminActivityTable).values({
      action: fields.status === "approved" ? "endorsement.approved" : fields.status === "archived" ? "endorsement.archived" : "endorsement.updated",
      entity: "endorsement", entityId: endorsement.id, administratorId: actorId,
    }).catch(() => undefined);
  },
);

router.delete(
  "/admin/endorsements/:id",
  verifyAdminCsrfToken,
  async (req, res): Promise<void> => {
    const params = DeleteAdminEndorsementParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const [endorsement] = await db
      .delete(endorsementsTable)
      .where(eq(endorsementsTable.id, params.data.id))
      .returning({ id: endorsementsTable.id });

    if (!endorsement) {
      res.status(404).json({ error: "Endorsement not found" });
      return;
    }

    res.sendStatus(204);
  },
);

export default router;