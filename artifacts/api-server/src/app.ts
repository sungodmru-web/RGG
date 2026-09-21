import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "node:path";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import router from "./routes";
import { logger } from "./lib/logger";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";
import {
  limitAdministratorRequests,
  securityLog,
  trustedOrigins,
} from "./middlewares/adminSecurity";

const app: Express = express();

function configuredTrustProxyHops(): number {
  const raw = process.env.TRUST_PROXY_HOPS;
  if (raw === undefined || raw === "") {
    return 1;
  }

  if (!/^\d+$/.test(raw)) {
    throw new Error("TRUST_PROXY_HOPS must be an integer between 0 and 5.");
  }

  const hops = Number(raw);
  if (!Number.isSafeInteger(hops) || hops < 0 || hops > 5) {
    throw new Error("TRUST_PROXY_HOPS must be an integer between 0 and 5.");
  }
  return hops;
}

app.set("trust proxy", configuredTrustProxyHops());

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});
app.use(
  cors((req, callback) => {
    const origin = req.get("origin");
    const trusted = Boolean(origin && trustedOrigins().includes(origin));
    callback(null, {
      origin: trusted ? origin : false,
      credentials: trusted,
    });
  }),
);
app.use("/api/admin", limitAdministratorRequests);
app.use(express.json({ limit: "256kb" }));
app.use(express.urlencoded({ extended: true, limit: "256kb" }));

app.use(
  clerkMiddleware((req) => ({
    publishableKey: publishableKeyFromHost(
      getClerkProxyHost(req) ?? "",
      process.env.CLERK_PUBLISHABLE_KEY,
    ),
  })),
);

app.use("/api", router);

const staticDirectory = process.env.STATIC_DIR
  ? path.resolve(process.env.STATIC_DIR)
  : undefined;

if (staticDirectory) {
  app.use(express.static(staticDirectory, { index: "index.html" }));
}

app.use((req, res) => {
  if (req.path === "/api" || req.path.startsWith("/api/")) {
    res.status(404).json({ error: "Not found" });
  } else if (staticDirectory && (req.method === "GET" || req.method === "HEAD")) {
    res.sendFile(path.join(staticDirectory, "index.html"), (error) => {
      if (error && !res.headersSent) {
        const statusCode =
          "statusCode" in error && error.statusCode === 404 ? 404 : 500;
        res.status(statusCode).json({
          error: statusCode === 404 ? "Not found" : "Internal server error",
        });
      }
    });
  } else res.status(404).json({ error: "Not found" });
});

app.use((error: unknown, req: Request, res: Response, _next: NextFunction) => {
  const status =
    typeof error === "object" && error !== null && "type" in error && error.type === "entity.too.large"
      ? 413
      : typeof error === "object" && error !== null && "type" in error && error.type === "entity.parse.failed"
        ? 400
        : 500;
  if (status === 413) {
    res.status(413).json({ error: "Request body too large" });
    return;
  }
  if (status === 400) {
    if (req.path.startsWith("/api/admin")) {
      securityLog(req, "admin_malformed_request");
    }
    res.status(400).json({ error: "Malformed JSON body" });
    return;
  }
  logger.error({ err: error }, "Unhandled request error");
  res.status(500).json({ error: "Internal server error" });
});

export default app;
