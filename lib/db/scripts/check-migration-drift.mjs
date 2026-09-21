import {
  cp,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const checkedInDir = path.join(packageDir, "drizzle");
const temporaryDir = await mkdtemp(path.join(packageDir, ".migration-check-"));
const temporaryName = path.basename(temporaryDir);

async function listFiles(directory, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = path.join(prefix, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(path.join(directory, entry.name), relativePath)));
    } else if (entry.isFile()) {
      files.push(relativePath);
    }
  }

  return files.sort();
}

async function findDifference(expectedDir, actualDir) {
  const [expectedFiles, actualFiles] = await Promise.all([
    listFiles(expectedDir),
    listFiles(actualDir),
  ]);

  if (expectedFiles.join("\n") !== actualFiles.join("\n")) {
    return "the generated migration file list differs";
  }

  for (const relativePath of expectedFiles) {
    const [expected, actual] = await Promise.all([
      readFile(path.join(expectedDir, relativePath)),
      readFile(path.join(actualDir, relativePath)),
    ]);

    if (!expected.equals(actual)) {
      return `${relativePath} differs`;
    }
  }

  return null;
}

async function validateMigrationJournal(directory) {
  const journal = JSON.parse(
    await readFile(path.join(directory, "meta/_journal.json"), "utf8"),
  );
  const files = new Set(await listFiles(directory));

  for (const entry of journal.entries) {
    const migrationFile = `${entry.tag}.sql`;
    if (!files.has(migrationFile)) {
      throw new Error(
        `Migration journal entry ${entry.tag} is missing ${migrationFile}.`,
      );
    }
  }
}

try {
  await validateMigrationJournal(checkedInDir);

  await Promise.all([
    cp(path.join(packageDir, "src"), path.join(temporaryDir, "src"), {
      recursive: true,
    }),
    cp(checkedInDir, path.join(temporaryDir, "drizzle"), { recursive: true }),
    writeFile(
      path.join(temporaryDir, "drizzle.config.ts"),
      `import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: ${JSON.stringify(`./${temporaryName}/src/schema/index.ts`)},
  out: ${JSON.stringify(`./${temporaryName}/drizzle`)},
  dialect: "postgresql",
});
`,
    ),
  ]);

  const generation = spawnSync(
    "pnpm",
    [
      "exec",
      "drizzle-kit",
      "generate",
      "--config",
      `./${temporaryName}/drizzle.config.ts`,
    ],
    {
      cwd: packageDir,
      env: process.env,
      encoding: "utf8",
    },
  );

  if (
    generation.status !== 0 ||
    generation.error ||
    /^Error:/m.test(generation.stdout)
  ) {
    process.stderr.write(generation.stdout);
    process.stderr.write(generation.stderr);
    process.exitCode =
      generation.status !== null && generation.status !== 0
        ? generation.status
        : 1;
  } else {
    const difference = await findDifference(
      checkedInDir,
      path.join(temporaryDir, "drizzle"),
    );

    if (difference) {
      console.error(
        `Database migration drift detected: ${difference}.\n` +
          "Run `pnpm --filter @workspace/db run migration:generate`, review the generated SQL, and commit it.",
      );
      process.exitCode = 1;
    } else {
      console.log("Database schema and checked-in migrations are in sync.");
    }
  }
} finally {
  await rm(temporaryDir, { recursive: true, force: true });
}