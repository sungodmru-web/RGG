import test from "node:test";
import assert from "node:assert/strict";

import {
  formatRecordCounts,
  poolOptions,
  RECORD_COUNT_QUERY,
  sslOptions,
  verifyRecordCounts,
} from "./verify-record-counts.mjs";
import pg from "pg";

test("record-count query is a read-only aggregate over the migration inventory", () => {
  assert.match(RECORD_COUNT_QUERY, /SELECT/);
  assert.doesNotMatch(RECORD_COUNT_QUERY, /\b(INSERT|UPDATE|DELETE|DROP|TRUNCATE|ALTER)\b/i);
  for (const table of ["publications", "themes", "endorsements", "media", "enquiries"]) {
    assert.match(RECORD_COUNT_QUERY, new RegExp(`\\b${table}\\b`));
  }
});

test("record counts are normalized into a migration comparison shape", () => {
  assert.deepEqual(
    formatRecordCounts({
      publications_total: "8",
      publications_draft: "2",
      publications_published: "5",
      publications_archived: "1",
      themes_total: "3",
      endorsements_total: "4",
      endorsements_approved: "3",
      media_total: "6",
      enquiries_total: "9",
    }),
    {
      publications: {
        total: 8,
        byStatus: { draft: 2, published: 5, archived: 1 },
      },
      themes: { total: 3 },
      endorsements: { total: 4, approved: 3 },
      media: { total: 6 },
      enquiries: { total: 9 },
    },
  );
});

test("external PostgreSQL SSL never disables certificate verification", () => {
  assert.deepEqual(sslOptions({ PGSSLMODE: "require" }), {
    rejectUnauthorized: true,
  });
  assert.deepEqual(sslOptions({ DATABASE_SSL: "true" }), {
    rejectUnauthorized: true,
  });
  assert.deepEqual(
    sslOptions({
      DATABASE_SSL: "true",
      DATABASE_SSL_CA: "-----BEGIN CERTIFICATE-----\\nCA\\n-----END CERTIFICATE-----",
    }),
    {
      rejectUnauthorized: true,
      ca: "-----BEGIN CERTIFICATE-----\nCA\n-----END CERTIFICATE-----",
    },
  );
  assert.equal(sslOptions({ PGSSLMODE: "disable" }), undefined);
});

test("explicit private CA overrides conflicting URL-level SSL parameters", () => {
  const options = poolOptions({
    DATABASE_URL:
      "postgresql://user:password@database.example/rgg?sslmode=require&uselibpqcompat=true",
    DATABASE_SSL: "true",
    DATABASE_SSL_CA: "PRIVATE-CA",
  });
  assert.doesNotMatch(options.connectionString, /sslmode|uselibpqcompat/);
  const client = new pg.Client(options);
  assert.deepEqual(client.connectionParameters.ssl, {
    rejectUnauthorized: true,
    ca: "PRIVATE-CA",
  });
});

test("missing credentials fail before opening a database connection", async () => {
  await assert.rejects(
    verifyRecordCounts({}),
    /DATABASE_URL is required; no database connection was attempted/,
  );
});