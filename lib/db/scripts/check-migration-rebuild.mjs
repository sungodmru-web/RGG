import { randomUUID } from "node:crypto";
import { mkdtemp, readFile, readdir, writeFile, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDir = path.join(packageDir, "drizzle");
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to validate migration rebuilds.");
}

const suffix = randomUUID().replaceAll("-", "").slice(0, 16);
const migratedDatabase = `rgg_rebuild_${suffix}`;
const schemaDatabase = `rgg_schema_${suffix}`;
const dumpDir = await mkdtemp(
  path.join(tmpdir(), `rgg-migration-rebuild-${suffix}-`),
);

function urlFor(databaseName) {
  const url = new URL(databaseUrl);
  url.pathname = `/${databaseName}`;
  return url.toString();
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: packageDir,
    env: process.env,
    encoding: "utf8",
    ...options,
  });

  if (result.error || result.status !== 0 || /^Error:/m.test(result.stdout)) {
    process.stderr.write(result.stdout ?? "");
    process.stderr.write(result.stderr ?? "");
    throw result.error ?? new Error(`${command} exited with status ${result.status}.`);
  }

  return result.stdout;
}

function createDatabase(name) {
  run("createdb", [`--maintenance-db=${databaseUrl}`, name]);
}

function dropDatabase(name) {
  return spawnSync(
    "dropdb",
    [`--maintenance-db=${databaseUrl}`, "--if-exists", "--force", name],
    { cwd: packageDir, env: process.env, encoding: "utf8" },
  );
}

async function validateMigrationJournal() {
  const journal = JSON.parse(
    await readFile(path.join(migrationsDir, "meta/_journal.json"), "utf8"),
  );
  const sqlFiles = (await readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort();
  const journalFiles = journal.entries.map((entry) => `${entry.tag}.sql`);

  if (sqlFiles.join("\n") !== journalFiles.join("\n")) {
    throw new Error(
      "Migration SQL files do not exactly match the ordered Drizzle journal.",
    );
  }
}

function normalizeDump(dump) {
  return dump
    .split("\n")
    .filter((line) => !/^\\(?:un)?restrict /.test(line))
    .join("\n");
}

try {
  await validateMigrationJournal();
  createDatabase(migratedDatabase);
  createDatabase(schemaDatabase);

  run("pnpm", ["run", "migration:migrate"], {
    env: { ...process.env, DATABASE_URL: urlFor(migratedDatabase) },
  });
  run(
    "pnpm",
    [
      "exec",
      "drizzle-kit",
      "push",
      "--config",
      "./drizzle.config.ts",
      "--force",
    ],
    { env: { ...process.env, DATABASE_URL: urlFor(schemaDatabase) } },
  );

  const dumpArgs = [
    "--schema-only",
    "--no-owner",
    "--no-privileges",
    "--exclude-schema=drizzle",
  ];
  const migratedDump = normalizeDump(
    run("pg_dump", [urlFor(migratedDatabase), ...dumpArgs]),
  );
  const schemaDump = normalizeDump(
    run("pg_dump", [urlFor(schemaDatabase), ...dumpArgs]),
  );

  if (migratedDump !== schemaDump) {
    const migratedPath = path.join(dumpDir, "migrations.sql");
    const schemaPath = path.join(dumpDir, "schema.sql");
    await Promise.all([
      writeFile(migratedPath, migratedDump),
      writeFile(schemaPath, schemaDump),
    ]);
    const difference = spawnSync("diff", ["-u", migratedPath, schemaPath], {
      encoding: "utf8",
    });
    process.stderr.write(difference.stdout ?? "");
    throw new Error(
      "The schema rebuilt from migrations differs from the current Drizzle schema.",
    );
  }

  console.log(
    "All checked-in migrations rebuilt a database matching the current Drizzle schema.",
  );
} finally {
  const cleanupResults = [
    [migratedDatabase, dropDatabase(migratedDatabase)],
    [schemaDatabase, dropDatabase(schemaDatabase)],
  ];
  await rm(dumpDir, { recursive: true, force: true });

  const cleanupFailures = cleanupResults.filter(
    ([, result]) => result.error || result.status !== 0,
  );
  if (cleanupFailures.length > 0) {
    for (const [, result] of cleanupFailures) {
      process.stderr.write(result.stdout ?? "");
      process.stderr.write(result.stderr ?? "");
    }
    throw new Error(
      `Failed to clean up disposable databases: ${cleanupFailures
        .map(([name]) => name)
        .join(", ")}.`,
    );
  }
}