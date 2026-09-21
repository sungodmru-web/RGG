import app from "./app";
import { logger, sendConfiguredBetterStackTestAlert } from "./lib/logger";
import { pool } from "@workspace/db";

const rawPort =
  process.env["PORT"] ??
  (process.env["NODE_ENV"] === "development" ? "8080" : undefined);

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required outside development.",
  );
}

const port = Number(rawPort);

if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  throw new Error(`Invalid PORT value: "${rawPort}". Expected an integer from 1 to 65535.`);
}

const server = app.listen(port, "0.0.0.0", () => {
  logger.info({ host: "0.0.0.0", port }, "Server listening");
  void sendConfiguredBetterStackTestAlert().then((delivered) => {
    if (delivered) {
      logger.info(
        { securityAlertDelivery: "test_delivered", provider: "better_stack" },
        "Controlled Better Stack test alert delivered",
      );
    }
  });
});

server.on("error", (error) => {
  logger.error({ err: error }, "Error listening on port");
  process.exitCode = 1;
});

let shuttingDown = false;
async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, "Shutting down server");

  const forceExit = setTimeout(() => {
    logger.error("Graceful shutdown timed out");
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  try {
    server.closeIdleConnections?.();
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    await pool.end();
    clearTimeout(forceExit);
    logger.info("Server shutdown complete");
  } catch (error) {
    clearTimeout(forceExit);
    logger.error({ err: error }, "Server shutdown failed");
    process.exitCode = 1;
  }
}

process.once("SIGTERM", () => void shutdown("SIGTERM"));
process.once("SIGINT", () => void shutdown("SIGINT"));
