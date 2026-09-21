import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cp,
  mkdtemp,
  readdir,
  readFile,
  rm,
  symlink,
  unlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const packageDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const trackedInputs = ["drizzle", "src", "scripts/check-migration-rebuild.mjs"];

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to test migration rebuilds.");
}

async function snapshot(directory, entries = trackedInputs) {
  const files = new Map();

  async function visit(relativePath) {
    const absolutePath = path.join(directory, relativePath);
    const directoryEntries = await readdir(absolutePath, { withFileTypes: true });

    for (const entry of directoryEntries) {
      const childPath = path.join(relativePath, entry.name);
      if (entry.isDirectory()) {
        await visit(childPath);
      } else if (entry.isFile()) {
        files.set(childPath, await readFile(path.join(directory, childPath)));
      }
    }
  }

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry);
    try {
      await visit(entry);
    } catch (error) {
      if (error.code !== "ENOTDIR") throw error;
      files.set(entry, await readFile(absolutePath));
    }
  }

  return files;
}

function assertSnapshotsEqual(actual, expected, message) {
  assert.deepEqual([...actual.keys()], [...expected.keys()], message);
  for (const [file, contents] of expected) {
    assert.deepEqual(actual.get(file), contents, `${message}: ${file}`);
  }
}

async function createFixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), "migration-rebuild-test-"));
  const fixtureDir = path.join(root, "db");
  await Promise.all([
    cp(path.join(packageDir, "drizzle"), path.join(fixtureDir, "drizzle"), {
      recursive: true,
    }),
    cp(path.join(packageDir, "src"), path.join(fixtureDir, "src"), {
      recursive: true,
    }),
    cp(path.join(packageDir, "scripts"), path.join(fixtureDir, "scripts"), {
      recursive: true,
    }),
    cp(
      path.join(packageDir, "drizzle.config.ts"),
      path.join(fixtureDir, "drizzle.config.ts"),
    ),
    cp(
      path.join(packageDir, "package.json"),
      path.join(fixtureDir, "package.json"),
    ),
  ]);
  await symlink(
    path.join(packageDir, "node_modules"),
    path.join(fixtureDir, "node_modules"),
  );
  return { fixtureDir, root };
}

function temporaryDumpDirectories() {
  return readdir(os.tmpdir()).then((entries) =>
    entries.filter((entry) => entry.startsWith("rgg-migration-rebuild-")).sort(),
  );
}

function disposableDatabases() {
  const result = spawnSync(
    "psql",
    [
      process.env.DATABASE_URL,
      "--no-align",
      "--tuples-only",
      "--command",
      "SELECT datname FROM pg_database WHERE datname LIKE 'rgg_rebuild_%' OR datname LIKE 'rgg_schema_%' ORDER BY datname",
    ],
    { encoding: "utf8", env: process.env },
  );
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return result.stdout.trim().split("\n").filter(Boolean);
}

async function runCase(mutate) {
  const realBefore = await snapshot(packageDir);
  const databasesBefore = disposableDatabases();
  const dumpDirectoriesBefore = await temporaryDumpDirectories();
  const { fixtureDir, root } = await createFixture();

  try {
    if (mutate) await mutate(fixtureDir);
    const fixtureBefore = await snapshot(fixtureDir, ["drizzle", "src"]);
    const result = spawnSync("node", ["./scripts/check-migration-rebuild.mjs"], {
      cwd: fixtureDir,
      encoding: "utf8",
      env: process.env,
    });

    assert.deepEqual(
      disposableDatabases(),
      databasesBefore,
      "the checker must remove its disposable databases",
    );
    assert.deepEqual(
      await temporaryDumpDirectories(),
      dumpDirectoriesBefore,
      "the checker must remove its temporary dump directory",
    );
    assertSnapshotsEqual(
      await snapshot(fixtureDir, ["drizzle", "src"]),
      fixtureBefore,
      "fixture schema and migrations must stay unchanged",
    );
    assertSnapshotsEqual(
      await snapshot(packageDir),
      realBefore,
      "tracked database package inputs must stay unchanged",
    );
    return result;
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test("current migrations rebuild the current schema without changing files", async () => {
  const result = await runCase();
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(
    result.stdout,
    /All checked-in migrations rebuilt a database matching the current Drizzle schema\./,
  );
});

test("a migration and schema mismatch fails clearly and cleans up", async () => {
  const result = await runCase(async (fixtureDir) => {
    const schemaPath = path.join(fixtureDir, "src/schema/index.ts");
    await writeFile(
      schemaPath,
      `${await readFile(schemaPath, "utf8")}
import { pgTable, text } from "drizzle-orm/pg-core";
export const migrationRebuildProbe = pgTable("migration_rebuild_probe", {
  value: text("value").notNull(),
});
`,
    );
  });

  assert.notEqual(result.status, 0);
  assert.match(
    result.stderr,
    /The schema rebuilt from migrations differs from the current Drizzle schema\./,
  );
});

test("an invalid migration journal fails before rebuilding and cleans up", async () => {
  const result = await runCase((fixtureDir) =>
    unlink(path.join(fixtureDir, "drizzle/0000_long_lilith.sql")),
  );

  assert.notEqual(result.status, 0);
  assert.match(
    result.stderr,
    /Migration SQL files do not exactly match the ordered Drizzle journal\./,
  );
});