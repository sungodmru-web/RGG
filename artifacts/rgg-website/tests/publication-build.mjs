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
  id: "published-1",
  slug: approvedSlug,
  title: "Approved Cannabis Policy",
  abstract: "An approved abstract about evidence-led cannabis governance.",
  publicationType: "policy-brief",
  authors: [{ name: "Research Author" }],
  publicationDate: "2026-09-20",
  status: "published",
};
const approvedArticle = {
  ...approvedPublication,
  id: "published-article",
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
      id: "published-2",
      title: "Conflicting Publication",
    },
  ],
  invalidSchema: [
    {
      ...approvedPublication,
      publicationDate: "2026-02-30",
      authors: [{ name: "" }],
    },
  ],
};

const server = http.createServer((request, response) => {
  const fixtureName = request.url?.split("/").at(-1);
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

async function build(port, fixtureName) {
  return new Promise((resolve) => {
    const child = spawn("pnpm", ["run", "build"], {
      cwd: projectDir,
      env: {
        ...process.env,
        PORT: "4173",
        BASE_PATH: "/",
        SITE_URL: siteUrl,
        PUBLICATIONS_API_URL: `http://127.0.0.1:${port}/${fixtureName}`,
      },
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
try {
  const successfulBuild = await build(port, "published");
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

  const duplicateBuild = await build(port, "duplicate");
  assert.notEqual(duplicateBuild.code, 0, duplicateBuild.output);
  assert.match(
    duplicateBuild.output,
    /Published publication metadata contains duplicate slug "approved-cannabis-policy"/,
  );
  await assert.rejects(access(articlePath), { code: "ENOENT" });

  const invalidSchemaBuild = await build(port, "invalidSchema");
  assert.notEqual(invalidSchemaBuild.code, 0, invalidSchemaBuild.output);
  assert.match(
    invalidSchemaBuild.output,
    /CreativeWork JSON-LD has an invalid "datePublished" date/,
  );

  console.log("Publication prerender build regression checks passed.");
} finally {
  await new Promise((resolve) => server.close(resolve));
}