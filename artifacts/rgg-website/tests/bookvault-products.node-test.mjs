import assert from "node:assert/strict";
import { createServer } from "node:http";
import { after, before, test } from "node:test";

import { checkEditions } from "./bookvault-products.mjs";

let server;
let baseUrl;

before(async () => {
  server = createServer((request, response) => {
    switch (request.url) {
      case "/direct":
      case "/approved-final":
        response.writeHead(200, { "content-type": "text/html" });
        response.end("<html></html>");
        break;
      case "/approved":
        response.writeHead(302, { location: "/approved-final" });
        response.end();
        break;
      case "/unapproved":
        response.writeHead(302, { location: "/unapproved-final" });
        response.end();
        break;
      case "/failed-redirect":
        response.writeHead(302, { location: "/failed-final" });
        response.end();
        break;
      case "/failed-final":
        response.writeHead(503);
        response.end();
        break;
      default:
        response.writeHead(404);
        response.end();
    }
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  assert(address && typeof address === "object");
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

function edition(language, format, path, approvedRedirects = []) {
  return {
    language,
    format,
    href: `${baseUrl}${path}`,
    approvedRedirects: approvedRedirects.map((redirect) => `${baseUrl}${redirect}`),
  };
}

test("accepts a direct successful response", async () => {
  const failures = await checkEditions([
    edition("English", "Hardcover", "/direct"),
  ]);

  assert.deepEqual(failures, []);
});

test("follows an approved redirect to a successful response", async () => {
  const failures = await checkEditions([
    edition("French", "Paperback", "/approved", ["/approved-final"]),
  ]);

  assert.deepEqual(failures, []);
});

test("rejects an unapproved redirect and identifies the edition", async () => {
  const failures = await checkEditions([
    edition("French", "Hardcover", "/unapproved"),
  ]);

  assert.equal(failures.length, 1);
  assert.match(failures[0], /^French Hardcover:/);
  assert.match(failures[0], /redirected to unapproved destination/);
});

test("rejects a failed approved destination and identifies the edition", async () => {
  const failures = await checkEditions([
    edition("English", "Paperback", "/failed-redirect", ["/failed-final"]),
  ]);

  assert.equal(failures.length, 1);
  assert.match(failures[0], /^English Paperback:/);
  assert.match(failures[0], /returned HTTP 503/);
  assert.match(failures[0], /\/failed-final$/);
});