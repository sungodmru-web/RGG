import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import http from "node:http";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const commandTimeoutMs = 180_000;
const requestTimeoutMs = 10_000;
const publicationSlug = "route-smoke-publication";

const publication = {
  id: "00000000-0000-4000-8000-000000000001",
  slug: publicationSlug,
  title: "Route Smoke Publication",
  abstract: "A local publication fixture used to verify the production route.",
  publicationType: "policy-brief",
  authors: [{ name: "Route Smoke Author" }],
  publicationDate: "2026-09-21",
  featured: false,
};

function commandEnvironment(overrides = {}) {
  return {
    ...process.env,
    // The production server imports the database pool, but these checks must
    // never connect to a developer or production database. Port 1 is
    // intentionally unreachable; the checked routes do not query the pool.
    DATABASE_URL: "postgresql://route-smoke:route-smoke@127.0.0.1:1/route-smoke",
    DATABASE_SSL: "",
    PGSSLMODE: "",
    BETTER_STACK_TEST_ALERT_ENABLED: "",
    BETTER_STACK_INGESTING_URL: "",
    BETTER_STACK_SOURCE_TOKEN: "",
    CLERK_SECRET_KEY: "",
    CLERK_PUBLISHABLE_KEY: "",
    ...overrides,
  };
}

function startFixtureServer() {
  const server = http.createServer((request, response) => {
    if (request.url === "/published") {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify([publication]));
      return;
    }

    response.writeHead(404, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Not found" }));
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      assert(address && typeof address === "object");
      resolve({
        server,
        url: `http://127.0.0.1:${address.port}/published`,
      });
    });
  });
}

function reservePort() {
  const server = net.createServer();
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      assert(address && typeof address === "object");
      const { port } = address;
      server.close((error) => (error ? reject(error) : resolve(port)));
    });
  });
}

function runCommand(command, args, options = {}) {
  const child = spawn(command, args, {
    cwd: rootDirectory,
    env: commandEnvironment(options.env),
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  child.stdout.on("data", (chunk) => (output += chunk));
  child.stderr.on("data", (chunk) => (output += chunk));

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error(`${command} ${args.join(" ")} timed out.\n${output}`));
    }, commandTimeoutMs);

    child.once("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.once("close", (code, signal) => {
      clearTimeout(timeout);
      resolve({ code, signal, output });
    });
  });
}

function terminateProcessTree(child, signal) {
  if (child.exitCode !== null) return;
  if (process.platform !== "win32" && child.pid) {
    try {
      process.kill(-child.pid, signal);
      return;
    } catch (error) {
      if (error.code !== "ESRCH") throw error;
    }
  }
  child.kill(signal);
}

async function waitForHealth(baseUrl, child, getOutput) {
  const deadline = Date.now() + commandTimeoutMs;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Production server exited before becoming ready.\n${getOutput()}`);
    }

    try {
      const response = await fetch(`${baseUrl}/api/healthz`, {
        signal: AbortSignal.timeout(requestTimeoutMs),
      });
      if (response.status === 200) return;
    } catch {
      // The server may still be binding its assigned port.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Production server did not become ready.\n${getOutput()}`);
}

async function request(baseUrl, route) {
  return fetch(`${baseUrl}${route}`, {
    redirect: "follow",
    signal: AbortSignal.timeout(requestTimeoutMs),
  });
}

async function assertHtmlRoute(baseUrl, route) {
  const response = await request(baseUrl, route);
  assert.equal(response.status, 200, `${route} should resolve with HTTP 200`);
  assert.match(
    response.headers.get("content-type") ?? "",
    /text\/html/i,
    `${route} should return HTML`,
  );
  assert((await response.text()).includes("<html"), `${route} should return an HTML document`);
}

async function assertJsonResponse(baseUrl, route, status, body) {
  const response = await request(baseUrl, route);
  assert.equal(response.status, status, `${route} should resolve with HTTP ${status}`);
  assert.match(
    response.headers.get("content-type") ?? "",
    /application\/json/i,
    `${route} should return JSON`,
  );
  assert.deepEqual(await response.json(), body, `${route} should return the expected JSON`);
}

async function assertImageResponse(baseUrl, route, contentType) {
  const response = await request(baseUrl, route);
  assert.equal(response.status, 200, `${route} should resolve with HTTP 200`);
  assert.match(
    response.headers.get("content-type") ?? "",
    new RegExp(contentType, "i"),
    `${route} should return ${contentType} content`,
  );
  assert((await response.arrayBuffer()).byteLength > 0, `${route} should not be empty`);
}

const fixture = await startFixtureServer();
let productionServer;
let productionOutput = "";

try {
  const build = await runCommand("npm", ["run", "build"], {
    env: {
      NODE_ENV: "production",
      PUBLIC_SITE_URL: "http://127.0.0.1:4173",
      PUBLICATIONS_API_URL: fixture.url,
      DATABASE_URL: "",
      ALLOW_EMPTY_PUBLICATIONS_BOOTSTRAP: "",
      BASE_PATH: "/",
    },
  });
  assert.equal(build.code, 0, `Production build failed.\n${build.output}`);

  const port = await reservePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  productionServer = spawn("npm", ["start"], {
    cwd: rootDirectory,
    env: commandEnvironment({
      NODE_ENV: "production",
      PORT: String(port),
    }),
    detached: process.platform !== "win32",
    stdio: ["ignore", "pipe", "pipe"],
  });
  productionServer.stdout.on("data", (chunk) => (productionOutput += chunk));
  productionServer.stderr.on("data", (chunk) => (productionOutput += chunk));

  await waitForHealth(baseUrl, productionServer, () => productionOutput);

  for (const route of [
    "/",
    "/book",
    "/publications",
    `/publications/${publicationSlug}`,
    "/technical-assistance",
    "/authors",
    "/endorsements",
    "/admin",
  ]) {
    await assertHtmlRoute(baseUrl, route);
  }
  await assertImageResponse(
    baseUrl,
    "/favicon.ico?v=3",
    "image/(x-icon|vnd\\.microsoft\\.icon)",
  );
  await assertImageResponse(baseUrl, "/rgg-favicon.png?v=3", "image/png");

  await assertJsonResponse(baseUrl, "/api/healthz", 200, { status: "ok" });
  await assertJsonResponse(baseUrl, "/api/route-smoke-missing", 404, {
    error: "Not found",
  });

  console.log("Verified production HTML routes and API health/404 behavior.");
} finally {
  await new Promise((resolve) => fixture.server.close(resolve));
  if (productionServer && productionServer.exitCode === null) {
    terminateProcessTree(productionServer, "SIGTERM");
    await new Promise((resolve) => {
      productionServer.once("close", resolve);
      setTimeout(() => {
        terminateProcessTree(productionServer, "SIGKILL");
        resolve();
      }, 10_000).unref();
    });
  }
}