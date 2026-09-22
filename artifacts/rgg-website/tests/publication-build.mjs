import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const siteUrl = "https://example.test";
const productionHost = "https://luxury-web-estate.replit.app";
const approvedSlug = "approved-cannabis-policy";
const approvedPublication = {
  id: "00000000-0000-4000-8000-000000000001",
  slug: approvedSlug,
  title: "Approved Cannabis Policy",
  abstract: "An approved abstract about evidence-led cannabis governance.",
  publicationType: "policy-brief",
  authors: [{ name: "Research Author" }],
  publicationDate: "2026-09-20",
  featured: false,
};
const approvedArticle = {
  ...approvedPublication,
  id: "00000000-0000-4000-8000-000000000002",
  slug: "approved-cannabis-article",
  title: "Approved Cannabis Article",
  publicationType: "article",
};

const fixtures = {
  published: [approvedPublication, approvedArticle],
  duplicate: [
    approvedPublication,
    {
      ...approvedPublication,
      id: "00000000-0000-4000-8000-000000000003",
      title: "Conflicting Publication",
    },
  ],
  duplicateId: [
    approvedPublication,
    {
      ...approvedArticle,
      id: approvedPublication.id,
    },
  ],
  invalidSchema: [
    {
      ...approvedPublication,
      publicationDate: "2026-02-30",
      authors: [{ name: "" }],
    },
  ],
  invalidShape: { publications: [approvedPublication] },
  unpublished: [
    {
      ...approvedPublication,
      status: "draft",
    },
  ],
};

const server = http.createServer((request, response) => {
  const fixtureName = request.url?.split("/").at(-1);
  if (fixtureName === "disconnect") {
    request.socket.destroy();
    return;
  }
  if (fixtureName === "created") {
    response.writeHead(201, { "content-type": "application/json" });
    response.end(JSON.stringify(fixtures.published));
    return;
  }
  if (fixtureName === "redirect") {
    response.writeHead(302, { location: "/published" }).end();
    return;
  }
  if (fixtureName === "forbidden") {
    response
      .writeHead(403, { "content-type": "application/json" })
      .end(JSON.stringify({ error: "Forbidden" }));
    return;
  }
  if (fixtureName === "malformed") {
    response.writeHead(200, { "content-type": "application/json" });
    response.end("[");
    return;
  }
  const payload = fixtures[fixtureName];
  if (!payload) {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, { "content-type": "application/json" });
  response.end(JSON.stringify(payload));
});

async function listen() {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  assert(address && typeof address === "object");
  return address.port;
}

async function build({
  apiUrl,
  databaseUrl,
  bootstrapValue = "",
  siteOrigin = siteUrl,
}) {
  return new Promise((resolve) => {
    const environment = { ...process.env };
    delete environment.PUBLIC_SITE_URL;
    delete environment.PUBLICATIONS_API_URL;
    delete environment.ALLOW_EMPTY_PUBLICATIONS_BOOTSTRAP;
    delete environment.REPLIT_DOMAINS;
    delete environment.DATABASE_URL;
    delete environment.DATABASE_SSL;
    delete environment.DATABASE_SSL_CA;
    delete environment.PGSSLMODE;
    Object.assign(environment, {
      PORT: "4173",
      BASE_PATH: "/",
      SITE_URL: siteOrigin,
      PUBLICATIONS_API_URL: apiUrl ?? "",
      DATABASE_URL: databaseUrl ?? "",
      ALLOW_EMPTY_PUBLICATIONS_BOOTSTRAP: bootstrapValue,
    });
    const child = spawn("npm", ["run", "build"], {
      cwd: projectDir,
      env: environment,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    child.stdout.on("data", (chunk) => (output += chunk));
    child.stderr.on("data", (chunk) => (output += chunk));
    child.on("close", (code) => resolve({ code, output }));
  });
}

function jsonLdByType(html, type) {
  return jsonLdScripts(html).find((value) => value["@type"] === type);
}

function jsonLdScripts(html) {
  return [
    ...html.matchAll(
      /<script type="application\/ld\+json">(?<json>.*?)<\/script>/gs,
    ),
  ].map((match) => JSON.parse(match.groups.json));
}

function assertAbsoluteUrl(value, field, type) {
  assert.equal(typeof value[field], "string", `${type}.${field}`);
  const url = new URL(value[field]);
  assert.match(url.protocol, /^https?:$/, `${type}.${field}`);
}

function assertGeneratedSchema(value) {
  const type = value["@type"];
  assert.equal(value["@context"], "https://schema.org");
  assertAbsoluteUrl(value, "@id", type);
  assert.equal(typeof value.name, "string");
  assert(value.name.length > 0);
  assertAbsoluteUrl(value, "url", type);
  if (["Book", "Article", "CreativeWork"].includes(type)) {
    assert(Array.isArray(value.author) && value.author.length > 0);
    for (const author of value.author) {
      assert.deepEqual(Object.keys(author).sort(), ["@type", "name"]);
      assert.equal(author["@type"], "Person");
      assert.equal(typeof author.name, "string");
      assert(author.name.length > 0);
    }
  }
  if (["Article", "CreativeWork"].includes(type)) {
    assert.match(value.datePublished, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(
      new Date(`${value.datePublished}T00:00:00.000Z`).toISOString().slice(0, 10),
      value.datePublished,
    );
    assertAbsoluteUrl(value.publisher, "@id", `${type}.publisher`);
    assertAbsoluteUrl(value.isPartOf, "@id", `${type}.isPartOf`);
  }
}

const articlePath = path.join(
  projectDir,
  "dist/public/publications",
  approvedSlug,
  "index.html",
);
const port = await listen();
const fixtureUrl = (fixtureName) =>
  `http://127.0.0.1:${port}/${fixtureName}`;
try {
  const successfulBuild = await build({ apiUrl: fixtureUrl("published") });
  assert.equal(successfulBuild.code, 0, successfulBuild.output);
  const article = await readFile(articlePath, "utf8");
  const articleTypePage = await readFile(
    path.join(
      projectDir,
      "dist/public/publications/approved-cannabis-article/index.html",
    ),
    "utf8",
  );
  const home = await readFile(path.join(projectDir, "dist/public/index.html"), "utf8");
  const book = await readFile(
    path.join(projectDir, "dist/public/book/index.html"),
    "utf8",
  );
  const robots = await readFile(
    path.join(projectDir, "dist/public/robots.txt"),
    "utf8",
  );
  const llms = await readFile(path.join(projectDir, "dist/public/llms.txt"), "utf8");
  assert.match(
    article,
    /<title>Approved Cannabis Policy \| Reclaiming the Green Gold<\/title>/,
  );
  assert.match(home, /"@type":"Organization"/);
  assert.match(home, /"@type":"WebSite"/);
  assert.match(home, /https:\/\/example\.test\/#organization/);
  const bookSchema = jsonLdByType(book, "Book");
  assert(bookSchema);
  assert.equal(bookSchema.creativeWorkStatus, "Forthcoming");
  assert.equal(bookSchema.isbn, undefined);
  assert.equal(bookSchema.publisher, undefined);
  assert.equal(bookSchema.offers, undefined);
  assert.match(article, /"@type":"CreativeWork"/);
  assert.match(articleTypePage, /"@type":"Article"/);
  assert.match(article, /"datePublished":"2026-09-20"/);
  const generatedSchemas = [
    ...jsonLdScripts(home),
    ...jsonLdScripts(book),
    ...jsonLdScripts(article),
    ...jsonLdScripts(articleTypePage),
  ];
  for (const type of [
    "Organization",
    "WebSite",
    "Book",
    "Article",
    "CreativeWork",
  ]) {
    assert(generatedSchemas.some((schema) => schema["@type"] === type));
  }
  generatedSchemas.forEach(assertGeneratedSchema);
  for (const agent of ["OAI-SearchBot", "ChatGPT-User", "GPTBot"]) {
    assert.match(robots, new RegExp(`User-agent: ${agent}`));
  }
  assert.match(llms, new RegExp(productionHost.replaceAll(".", "\\.")));
  for (const content of [home, book, article]) {
    assert.match(content, /https:\/\/example\.test/);
    assert.doesNotMatch(content, /\.replit\.dev|localhost|127\.0\.0\.1/);
  }
  for (const content of [robots, llms]) {
    assert.match(content, new RegExp(productionHost.replaceAll(".", "\\.")));
    assert.doesNotMatch(content, /\.replit\.dev|localhost|127\.0\.0\.1/);
  }

  const duplicateBuild = await build({
    apiUrl: fixtureUrl("duplicate"),
    bootstrapValue: "true",
  });
  assert.notEqual(duplicateBuild.code, 0, duplicateBuild.output);
  assert.match(
    duplicateBuild.output,
    /Published publication metadata contains duplicate slug "approved-cannabis-policy"/,
  );
  await assert.rejects(access(articlePath), { code: "ENOENT" });

  const duplicateIdBuild = await build({
    apiUrl: fixtureUrl("duplicateId"),
    bootstrapValue: "true",
  });
  assert.notEqual(duplicateIdBuild.code, 0, duplicateIdBuild.output);
  assert.match(
    duplicateIdBuild.output,
    /Published publication metadata contains duplicate id/,
  );

  const invalidSchemaBuild = await build({
    apiUrl: fixtureUrl("invalidSchema"),
    bootstrapValue: "true",
  });
  assert.notEqual(invalidSchemaBuild.code, 0, invalidSchemaBuild.output);
  assert.match(
    invalidSchemaBuild.output,
    /Published publication metadata contained an invalid record/,
  );

  const unreachableUrl = fixtureUrl("disconnect");
  const strictUnreachableBuild = await build({ apiUrl: unreachableUrl });
  assert.notEqual(
    strictUnreachableBuild.code,
    0,
    strictUnreachableBuild.output,
  );
  assert.match(
    strictUnreachableBuild.output,
    /Could not reach published publication metadata endpoint/,
  );

  const bootstrapUnreachableBuild = await build({
    apiUrl: unreachableUrl,
    bootstrapValue: "true",
  });
  assert.equal(
    bootstrapUnreachableBuild.code,
    0,
    bootstrapUnreachableBuild.output,
  );
  assert.match(
    bootstrapUnreachableBuild.output,
    /\[prerender-public-metadata\].*API unreachable/s,
  );
  await assert.rejects(access(articlePath), { code: "ENOENT" });
  const unreachableBootstrapSitemap = await readFile(
    path.join(projectDir, "dist/public/sitemap.xml"),
    "utf8",
  );
  assert.doesNotMatch(unreachableBootstrapSitemap, /approved-cannabis-policy/);

  const bootstrap404Build = await build({
    apiUrl: fixtureUrl("missing"),
    bootstrapValue: "true",
  });
  assert.equal(bootstrap404Build.code, 0, bootstrap404Build.output);
  assert.match(
    bootstrap404Build.output,
    /\[prerender-public-metadata\].*HTTP 404/s,
  );
  await assert.rejects(access(articlePath), { code: "ENOENT" });
  const bootstrapHome = await readFile(
    path.join(projectDir, "dist/public/index.html"),
    "utf8",
  );
  const bootstrapSitemap = await readFile(
    path.join(projectDir, "dist/public/sitemap.xml"),
    "utf8",
  );
  assert.match(bootstrapHome, /"@type":"Organization"/);
  assert.doesNotMatch(bootstrapHome, /"@type":"Article"|"@type":"CreativeWork"/);
  assert.doesNotMatch(bootstrapSitemap, /\/publications\/approved-/);

  const bootstrapMissingBuild = await build({
    bootstrapValue: "true",
  });
  assert.equal(bootstrapMissingBuild.code, 0, bootstrapMissingBuild.output);
  assert.match(
    bootstrapMissingBuild.output,
    /\[prerender-public-metadata\].*DATABASE_URL is not configured/s,
  );
  await assert.rejects(access(articlePath), { code: "ENOENT" });

  const strictMissingBuild = await build({
    siteOrigin: `http://127.0.0.1:${port}`,
  });
  assert.notEqual(strictMissingBuild.code, 0, strictMissingBuild.output);
  assert.match(
    strictMissingBuild.output,
    /DATABASE_URL is required for normal publication metadata builds/,
  );

  const unavailableDatabaseUrl = "postgresql://127.0.0.1:1/rgg";
  const strictUnavailableDatabaseBuild = await build({
    databaseUrl: unavailableDatabaseUrl,
  });
  assert.notEqual(
    strictUnavailableDatabaseBuild.code,
    0,
    strictUnavailableDatabaseBuild.output,
  );
  assert.match(
    strictUnavailableDatabaseBuild.output,
    /Could not load published publication metadata from PostgreSQL/,
  );

  const bootstrapUnavailableDatabaseBuild = await build({
    databaseUrl: unavailableDatabaseUrl,
    bootstrapValue: "true",
  });
  assert.equal(
    bootstrapUnavailableDatabaseBuild.code,
    0,
    bootstrapUnavailableDatabaseBuild.output,
  );
  assert.match(
    bootstrapUnavailableDatabaseBuild.output,
    /\[prerender-public-metadata\].*publication database unavailable/s,
  );

  const malformedBuild = await build({
    apiUrl: fixtureUrl("malformed"),
    bootstrapValue: "true",
  });
  assert.notEqual(malformedBuild.code, 0, malformedBuild.output);
  assert.match(
    malformedBuild.output,
    /Published publication metadata was not valid JSON/,
  );

  const invalidShapeBuild = await build({
    apiUrl: fixtureUrl("invalidShape"),
    bootstrapValue: "true",
  });
  assert.notEqual(invalidShapeBuild.code, 0, invalidShapeBuild.output);
  assert.match(
    invalidShapeBuild.output,
    /Published publication metadata was not an array/,
  );

  const unpublishedBuild = await build({
    apiUrl: fixtureUrl("unpublished"),
    bootstrapValue: "true",
  });
  assert.notEqual(unpublishedBuild.code, 0, unpublishedBuild.output);
  assert.match(
    unpublishedBuild.output,
    /Published publication metadata contained a non-published record/,
  );

  for (const fixtureName of ["created", "redirect", "forbidden"]) {
    const unexpectedStatusBuild = await build({
      apiUrl: fixtureUrl(fixtureName),
      bootstrapValue: "true",
    });
    assert.notEqual(
      unexpectedStatusBuild.code,
      0,
      unexpectedStatusBuild.output,
    );
    assert.match(
      unexpectedStatusBuild.output,
      /Could not load published publication metadata \((201|302|403)\)/,
    );
  }

  const invalidUrlBuild = await build({
    apiUrl: "not-a-valid-url",
    bootstrapValue: "true",
  });
  assert.notEqual(invalidUrlBuild.code, 0, invalidUrlBuild.output);
  assert.match(
    invalidUrlBuild.output,
    /PUBLICATIONS_API_URL must be a valid absolute HTTP\(S\) URL/,
  );

  for (const bootstrapValue of ["TRUE", "1", " true"]) {
    const nonExactFlagBuild = await build({
      apiUrl: unreachableUrl,
      bootstrapValue,
    });
    assert.notEqual(nonExactFlagBuild.code, 0, nonExactFlagBuild.output);
    assert.match(
      nonExactFlagBuild.output,
      /Could not reach published publication metadata endpoint/,
    );
  }

  console.log("Publication prerender build regression checks passed.");
} finally {
  await new Promise((resolve) => server.close(resolve));
}