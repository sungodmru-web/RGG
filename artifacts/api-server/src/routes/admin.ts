import { Router } from "express";
import { clerkClient } from "@clerk/express";
import { db, administratorsTable } from "@workspace/db";
import { ListAdministratorsResponse } from "@workspace/api-zod";
import {
  createCsrfToken,
  getAdministratorAccess,
  requireAdministrator,
  requireClerkSession,
  requireTrustedAdminOrigin,
  revokeCurrentClerkSession,
  verifyAdminCsrfToken,
} from "../middlewares/adminSecurity";

const router = Router();

router.get("/admin/session", async (req, res, next) => {
  try {
    res.setHeader("Cache-Control", "no-store");
    const access = await getAdministratorAccess(req);
    if (access !== "admin") {
      res.json({ authenticated: false });
      return;
    }
    res.json({ authenticated: true, user: { role: "admin" } });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/administrators", requireAdministrator, async (_req, res, next) => {
  try {
    const rows = await db.select().from(administratorsTable).orderBy(administratorsTable.name);
    const result = await Promise.all(rows.map(async (row) => {
      if (!row.clerkUserId) {
        return {
          id: row.id,
          name: row.name,
          clerkUserId: null,
          email: null,
          accountStatus: "not_configured",
          role: "unassigned",
          lastSignInAt: null,
          accessStatus: row.active ? "pending_identity" : "inactive",
        };
      }
      try {
        const user = await clerkClient.users.getUser(row.clerkUserId);
        const metadata = user.publicMetadata as { role?: unknown };
        return {
          id: row.id,
          name: row.name,
          clerkUserId: row.clerkUserId,
          email: user.emailAddresses?.find((entry) => entry.id === user.primaryEmailAddressId)?.emailAddress ?? null,
          accountStatus: user.banned ? "banned" : "active",
          role: metadata.role === "admin" ? "admin" : "unassigned",
          lastSignInAt: user.lastSignInAt ? new Date(user.lastSignInAt).toISOString() : null,
          accessStatus: row.active && metadata.role === "admin" ? "authorized" : "not_authorized",
        };
      } catch {
        return {
          id: row.id,
          name: row.name,
          clerkUserId: row.clerkUserId,
          accountStatus: "unavailable",
          role: "unknown",
          lastSignInAt: null,
          accessStatus: "verification_unavailable",
        };
      }
    }));
    res.json(ListAdministratorsResponse.parse(result));
  } catch (error) {
    next(error);
  }
});

router.get("/admin/csrf", requireAdministrator, requireClerkSession, (req, res) => {
  res.json({ csrfToken: createCsrfToken(req) });
});

router.post(
  "/admin/logout",
  requireAdministrator,
  requireTrustedAdminOrigin,
  requireClerkSession,
  verifyAdminCsrfToken,
  async (req, res, next) => {
    try {
      await revokeCurrentClerkSession(req);
      res.clearCookie("__session", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  },
);

export default router;