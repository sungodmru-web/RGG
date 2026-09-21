import { fileURLToPath, pathToFileURL } from "node:url";
import pg from "pg";

const { Pool } = pg;

export const RECORD_COUNT_QUERY = `
  SELECT
    (SELECT count(*) FROM publications)::text AS publications_total,
    (SELECT count(*) FROM publications WHERE status = 'draft')::text AS publications_draft,
    (SELECT count(*) FROM publications WHERE status = 'published')::text AS publications_published,
    (SELECT count(*) FROM publications WHERE status = 'archived')::text AS publications_archived,
    (SELECT count(*) FROM themes)::text AS themes_total,
    (SELECT count(*) FROM endorsements)::text AS endorsements_total,
    (SELECT count(*) FROM endorsements WHERE status = 'approved')::text AS endorsements_approved,
    (SELECT count(*) FROM media)::text AS media_total,
    (SELECT count(*) FROM enquiries)::text AS enquiries_total
`;

export function sslOptions(environment = process.env) {
  const sslMode = environment.PGSSLMODE?.toLowerCase();
  const explicitlyEnabled = environment.DATABASE_SSL?.toLowerCase() === "true";
  if (sslMode === "require" || sslMode === "verify-ca" || sslMode === "verify-full" || explicitlyEnabled) {
    return {
      rejectUnauthorized: true,
      ...(environment.DATABASE_SSL_CA
        ? { ca: environment.DATABASE_SSL_CA.replaceAll("\\n", "\n") }
        : {}),
    };
  }
  return undefined;
}

export function poolOptions(environment = process.env) {
  if (!environment.DATABASE_URL) {
    throw new Error("DATABASE_URL is required; no database connection was attempted.");
  }
  const ssl = sslOptions(environment);
  let connectionString = environment.DATABASE_URL;
  if (ssl) {
    const parsed = new URL(connectionString);
    for (const name of [
      "sslmode",
      "sslrootcert",
      "sslcert",
      "sslkey",
      "uselibpqcompat",
    ]) {
      parsed.searchParams.delete(name);
    }
    connectionString = parsed.toString();
  }
  return {
    connectionString,
    ssl,
    connectionTimeoutMillis: 5_000,
    max: 1,
  };
}

export function formatRecordCounts(row) {
  const count = (key) => Number.parseInt(row[key] ?? "0", 10);
  return {
    publications: {
      total: count("publications_total"),
      byStatus: {
        draft: count("publications_draft"),
        published: count("publications_published"),
        archived: count("publications_archived"),
      },
    },
    themes: { total: count("themes_total") },
    endorsements: {
      total: count("endorsements_total"),
      approved: count("endorsements_approved"),
    },
    media: { total: count("media_total") },
    enquiries: { total: count("enquiries_total") },
  };
}

export async function verifyRecordCounts(environment = process.env) {
  const pool = new Pool(poolOptions(environment));

  try {
    const result = await pool.query(RECORD_COUNT_QUERY);
    return formatRecordCounts(result.rows[0]);
  } finally {
    await pool.end();
  }
}

const isMain = process.argv[1]
  ? pathToFileURL(process.argv[1]).href === import.meta.url
  : false;

if (isMain) {
  if (process.argv.slice(2).length > 0) {
    if (process.argv[2] === "--help") {
      process.stdout.write(
        "Read-only PostgreSQL record counts. Configure PostgreSQL through environment variables; no credentials are accepted as arguments.\n",
      );
      process.exit(0);
    }
    process.stderr.write("This command accepts no arguments except --help.\n");
    process.exit(2);
  }

  try {
    const counts = await verifyRecordCounts();
    process.stdout.write(`${JSON.stringify(counts, null, 2)}\n`);
  } catch {
    process.stderr.write(
      "Record-count verification failed without printing database connection details.\n",
    );
    process.exitCode = 1;
  }
}