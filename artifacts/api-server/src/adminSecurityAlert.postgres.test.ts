import { randomUUID } from "node:crypto";
import pg from "pg";
import {
  createPostgresAdministratorSecurityAlertStore,
  type AdministratorSecurityAlertConfig,
} from "./lib/logger";

const { Pool } = pg;

describe("administrator security alert PostgreSQL store", () => {
  const schema = `security_alert_test_${randomUUID().replaceAll("-", "")}`;
  const adminPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 2_000,
  });
  const poolOptions = {
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 2_000,
    max: 4,
    options: `-c search_path=${schema}`,
  };
  const firstInstancePool = new Pool(poolOptions);
  const secondInstancePool = new Pool(poolOptions);
  let firstInstanceClosed = false;
  const firstStore =
    createPostgresAdministratorSecurityAlertStore(firstInstancePool);
  const secondStore =
    createPostgresAdministratorSecurityAlertStore(secondInstancePool);
  const config: AdministratorSecurityAlertConfig = {
    threshold: 3,
    windowMs: 10_000,
    cooldownMs: 5_000,
  };

  beforeAll(async () => {
    await adminPool.query(`CREATE SCHEMA "${schema}"`);
    await adminPool.query(`
      CREATE TABLE "${schema}".admin_security_alerts (
        event_type text PRIMARY KEY NOT NULL,
        event_timestamps timestamp with time zone[] NOT NULL,
        last_alert_at timestamp with time zone,
        updated_at timestamp with time zone NOT NULL
      )
    `);
  });

  afterAll(async () => {
    if (!firstInstanceClosed) await firstInstancePool.end();
    await secondInstancePool.end();
    await adminPool.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
    await adminPool.end();
  });

  it("atomically shares thresholds, event types, and cooldowns across connections", async () => {
    const thresholdResults = await Promise.all(
      [
        firstStore.record("admin_origin_rejected", 0, config),
        secondStore.record("admin_origin_rejected", 0, config),
        firstStore.record("admin_origin_rejected", 0, config),
      ],
    );

    expect(thresholdResults.filter(({ shouldAlert }) => shouldAlert)).toHaveLength(
      1,
    );
    expect(
      await secondStore.record("admin_csrf_rejected", 0, config),
    ).toEqual({ eventCount: 1, shouldAlert: false });
    expect(
      await firstStore.record("admin_origin_rejected", 0, config),
    ).toEqual({ eventCount: 3, shouldAlert: false });

    await adminPool.query(
      `UPDATE "${schema}".admin_security_alerts
          SET last_alert_at = clock_timestamp() - interval '6 seconds'
        WHERE event_type = 'admin_origin_rejected'`,
    );
    await firstInstancePool.end();
    firstInstanceClosed = true;
    const restartedPool = new Pool(poolOptions);
    const restartedStore =
      createPostgresAdministratorSecurityAlertStore(restartedPool);
    const afterRestartCooldown = await restartedStore.record(
      "admin_origin_rejected",
      0,
      config,
    );
    await restartedPool.end();
    expect(afterRestartCooldown).toEqual({ eventCount: 3, shouldAlert: true });
  });

  it("fails promptly when another instance holds the event lock", async () => {
    const lockClient = await secondInstancePool.connect();
    try {
      await lockClient.query("BEGIN");
      await lockClient.query(
        `SELECT event_type FROM admin_security_alerts
          WHERE event_type = 'admin_csrf_rejected'
          FOR UPDATE`,
      );

      const startedAt = Date.now();
      await expect(
        secondStore.record("admin_csrf_rejected", 0, config),
      ).rejects.toThrow();
      expect(Date.now() - startedAt).toBeLessThan(1_800);
    } finally {
      await lockClient.query("ROLLBACK");
      lockClient.release();
    }

    await expect(
      secondStore.record("admin_csrf_rejected", 0, config),
    ).resolves.toEqual({ eventCount: 2, shouldAlert: false });
  });
});