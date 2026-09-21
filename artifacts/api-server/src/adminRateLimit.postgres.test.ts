import { randomUUID } from "node:crypto";
import pg from "pg";
import { createPostgresAdministratorRateLimitStore } from "./middlewares/adminSecurity";

const { Pool } = pg;
describe("administrator rate limit PostgreSQL store", () => {
  const schema = `rate_limit_test_${randomUUID().replaceAll("-", "")}`;
  const adminPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 2_000,
  });
  const testPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 2_000,
    max: 8,
    options: `-c search_path=${schema}`,
  });
  const store = createPostgresAdministratorRateLimitStore(testPool);

  beforeAll(async () => {
    await adminPool.query(`CREATE SCHEMA "${schema}"`);
    await adminPool.query(`
      CREATE TABLE "${schema}".admin_rate_limits (
        key text PRIMARY KEY NOT NULL,
        count integer NOT NULL,
        reset_at timestamp with time zone NOT NULL
      )
    `);
  });

  afterAll(async () => {
    await testPool.end();
    await adminPool.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
    await adminPool.end();
  });

  it("consumes, resets, and atomically shares counters across pooled connections", async () => {
    const first = await store.consume("session:first", Date.now(), 60_000);
    const second = await store.consume("session:first", Date.now(), 60_000);
    expect(first.count).toBe(1);
    expect(second.count).toBe(2);
    expect(second.retryAfter).toBeGreaterThan(0);
    expect(second.retryAfter).toBeLessThanOrEqual(60);

    await adminPool.query(
      `UPDATE "${schema}".admin_rate_limits
       SET reset_at = clock_timestamp() - interval '1 second'
       WHERE key = $1`,
      ["session:first"],
    );
    const reset = await store.consume("session:first", Date.now(), 60_000);
    expect(reset.count).toBe(1);

    const concurrent = await Promise.all(
      Array.from({ length: 40 }, () =>
        store.consume("mutation:concurrent", Date.now(), 60_000)
      ),
    );
    expect(concurrent.map(({ count }) => count).sort((a, b) => a - b)).toEqual(
      Array.from({ length: 40 }, (_, index) => index + 1),
    );
  });
});