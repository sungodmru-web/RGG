#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
suffix="rgg_migration_test_${RANDOM}_$$"
fresh_database="${suffix}_fresh"
legacy_database="${suffix}_legacy"
expected_migration_count="$(
  node -e '
    const journal = require(process.argv[1]);
    process.stdout.write(String(journal.entries.length));
  ' "$project_root/lib/db/drizzle/meta/_journal.json"
)"

database_url_for() {
  node -e '
    const url = new URL(process.env.DATABASE_URL);
    url.pathname = `/${process.argv[1]}`;
    process.stdout.write(url.toString());
  ' "$1"
}

cleanup() {
  dropdb --if-exists --force "$fresh_database" >/dev/null 2>&1 || true
  dropdb --if-exists --force "$legacy_database" >/dev/null 2>&1 || true
}
trap cleanup EXIT

createdb "$fresh_database"
createdb "$legacy_database"

fresh_url="$(database_url_for "$fresh_database")"
legacy_url="$(database_url_for "$legacy_database")"

psql "$legacy_url" -v ON_ERROR_STOP=1 <<'SQL'
CREATE TYPE publication_type AS ENUM(
  'research-paper', 'policy-brief', 'article', 'commentary', 'report', 'case-study'
);
CREATE TYPE endorsement_status AS ENUM('draft', 'approved', 'archived');
CREATE TABLE publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  subtitle text,
  abstract text NOT NULL,
  publication_type publication_type NOT NULL,
  category text,
  authors jsonb NOT NULL,
  publication_date date NOT NULL,
  reading_time integer,
  featured boolean DEFAULT false NOT NULL,
  featured_image text,
  pdf_url text,
  external_url text,
  doi text,
  content text,
  seo_title text,
  seo_description text,
  is_published boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
INSERT INTO publications (
  id, slug, title, subtitle, abstract, publication_type, category, authors,
  publication_date, reading_time, featured, featured_image, pdf_url, external_url,
  doi, content, seo_title, seo_description, is_published, created_at, updated_at
) VALUES
  (
    '11111111-1111-4111-8111-111111111111', 'legacy-published',
    'Published legacy title', 'Published legacy subtitle',
    'Published legacy abstract', 'report', 'forestry',
    '[{"name":"Ama Mensah","organization":"Green Gold Institute"},{"name":"Kojo Owusu"}]',
    '2026-01-01', 17, true, '/images/legacy-cover.webp',
    '/publications/legacy-paper.pdf', 'https://example.org/legacy-paper',
    '10.1234/legacy.2026.1', 'Published legacy body',
    'Published legacy SEO title', 'Published legacy SEO description', true,
    '2025-12-01 10:11:12+00', '2026-01-02 13:14:15+00'
  ),
  (
    '22222222-2222-4222-8222-222222222222', 'legacy-draft',
    'Draft legacy title', NULL, 'Draft legacy abstract', 'policy-brief', NULL,
    '[]', '2026-01-02', NULL, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    false, '2025-12-03 16:17:18+00', '2026-01-04 19:20:21+00'
  );
CREATE TABLE endorsements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  title text,
  organization text,
  quote text NOT NULL,
  photo_url text,
  source_url text,
  status endorsement_status DEFAULT 'draft' NOT NULL,
  display_order integer DEFAULT 0 NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
INSERT INTO endorsements (
  id, name, title, organization, quote, photo_url, source_url, status,
  display_order, created_at, updated_at
) VALUES
  (
    '33333333-3333-4333-8333-333333333333', 'Dr. Efua Asante',
    'Executive Director', 'Forest Futures Ghana',
    'A practical and timely account of Ghana''s green economy.',
    'https://example.org/images/efua-asante.webp',
    'https://example.org/endorsements/efua-asante', 'approved', 7,
    '2026-02-01 08:09:10+00', '2026-02-02 11:12:13+00'
  ),
  (
    '44444444-4444-4444-8444-444444444444', 'Kwame Boateng',
    NULL, NULL, 'Essential reading for policy makers.',
    NULL, NULL, 'archived', 0,
    '2026-02-03 14:15:16+00', '2026-02-04 17:18:19+00'
  );
SQL

(
  cd "$project_root"
  DATABASE_URL="$fresh_url" pnpm --filter @workspace/db run migration:migrate
  DATABASE_URL="$legacy_url" pnpm --filter @workspace/db run migration:migrate
)

assert_schema_sql=$(cat <<'SQL'
WITH expected_endorsement_columns (
  ordinal_position, column_name, data_type, is_not_null, column_default
) AS (
  VALUES
    (1, 'id', 'uuid', true, 'gen_random_uuid()'),
    (2, 'name', 'text', true, NULL),
    (3, 'title', 'text', false, NULL),
    (4, 'organization', 'text', false, NULL),
    (5, 'quote', 'text', true, NULL),
    (6, 'photo_url', 'text', false, NULL),
    (7, 'source_url', 'text', false, NULL),
    (8, 'status', 'endorsement_status', true, '''draft''::endorsement_status'),
    (9, 'display_order', 'integer', true, '0'),
    (10, 'created_at', 'timestamp with time zone', true, 'now()'),
    (11, 'updated_at', 'timestamp with time zone', true, 'now()'),
    (12, 'approved_by', 'text', false, NULL),
    (13, 'approved_at', 'timestamp with time zone', false, NULL),
    (14, 'language', 'endorsement_language', true, '''english''::endorsement_language'),
    (15, 'verification_note', 'text', false, NULL),
    (16, 'verified', 'boolean', true, 'false'),
    (17, 'photo_media_id', 'uuid', false, NULL),
    (18, 'created_by', 'text', false, NULL),
    (19, 'updated_by', 'text', false, NULL)
),
actual_endorsement_columns AS (
  SELECT
    a.attnum::integer AS ordinal_position,
    a.attname::text AS column_name,
    format_type(a.atttypid, a.atttypmod)::text AS data_type,
    a.attnotnull AS is_not_null,
    pg_get_expr(d.adbin, d.adrelid)::text AS column_default
  FROM pg_attribute a
  LEFT JOIN pg_attrdef d
    ON d.adrelid = a.attrelid AND d.adnum = a.attnum
  WHERE a.attrelid = 'public.endorsements'::regclass
    AND a.attnum > 0
    AND NOT a.attisdropped
),
endorsement_column_differences AS (
  (SELECT * FROM expected_endorsement_columns EXCEPT SELECT * FROM actual_endorsement_columns)
  UNION ALL
  (SELECT * FROM actual_endorsement_columns EXCEPT SELECT * FROM expected_endorsement_columns)
)
SELECT CASE WHEN
  (SELECT array_agg(column_name::text ORDER BY column_name)
   FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'publications')
  = ARRAY[
    'abstract', 'archived_at', 'archived_by', 'authors', 'category', 'content',
    'created_at', 'created_by', 'doi', 'external_url', 'featured',
    'featured_image', 'featured_image_media_id', 'id', 'language',
    'pdf_media_id', 'pdf_url', 'publication_date', 'publication_type',
    'published_at', 'published_by', 'reading_time', 'seo_description',
    'seo_title', 'slug', 'status', 'subtitle', 'theme_id', 'title',
    'updated_at', 'updated_by'
  ]::text[]
  AND to_regclass('public.administrators') IS NOT NULL
  AND to_regclass('public.admin_activity') IS NOT NULL
  AND to_regclass('public.media') IS NOT NULL
  AND to_regclass('public.themes') IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'published_publication_date_required'
      AND conrelid = 'public.publications'::regclass
  )
  AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'publications'
      AND column_name = 'status'
      AND is_nullable = 'NO'
      AND udt_name = 'publication_status'
      AND column_default LIKE '%draft%'
  )
  AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'publications'
      AND column_name = 'publication_date'
      AND is_nullable = 'YES'
  )
  AND NOT EXISTS (SELECT 1 FROM endorsement_column_differences)
  AND (
    SELECT array_agg(e.enumlabel::text ORDER BY e.enumsortorder)
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'endorsement_status'
  ) = ARRAY['draft', 'approved', 'archived']::text[]
  AND (
    SELECT array_agg(e.enumlabel::text ORDER BY e.enumsortorder)
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'endorsement_language'
  ) = ARRAY['english', 'french', 'bilingual']::text[]
  AND EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_attribute a
      ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
    WHERE c.conrelid = 'public.endorsements'::regclass
      AND c.contype = 'p'
      AND a.attname = 'id'
      AND cardinality(c.conkey) = 1
  )
  AND EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_attribute source_column
      ON source_column.attrelid = c.conrelid
      AND source_column.attnum = c.conkey[1]
    JOIN pg_attribute target_column
      ON target_column.attrelid = c.confrelid
      AND target_column.attnum = c.confkey[1]
    WHERE c.conrelid = 'public.endorsements'::regclass
      AND c.confrelid = 'public.media'::regclass
      AND c.contype = 'f'
      AND source_column.attname = 'photo_media_id'
      AND target_column.attname = 'id'
      AND cardinality(c.conkey) = 1
      AND cardinality(c.confkey) = 1
      AND c.confdeltype = 'n'
  )
  AND EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_attribute a
      ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
    WHERE c.conrelid = 'public.media'::regclass
      AND c.contype = 'u'
      AND a.attname = 'storage_key'
      AND cardinality(c.conkey) = 1
  )
  AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'media'
      AND column_name = 'storage_key'
      AND data_type = 'text'
      AND is_nullable = 'NO'
  )
  AND (SELECT count(*) FROM drizzle.__drizzle_migrations) = EXPECTED_MIGRATION_COUNT
THEN 'ok' ELSE 'mismatch' END;
SQL
)
assert_schema_sql="${assert_schema_sql/EXPECTED_MIGRATION_COUNT/$expected_migration_count}"

test "$(psql "$fresh_url" -Atc "$assert_schema_sql")" = "ok"
test "$(psql "$legacy_url" -Atc "$assert_schema_sql")" = "ok"
test "$(psql "$legacy_url" -Atc "
  WITH expected (
    id, slug, title, subtitle, abstract, publication_type, category, authors,
    publication_date, reading_time, featured, featured_image, pdf_url, external_url,
    doi, content, seo_title, seo_description, status, created_at, updated_at
  ) AS (
    VALUES
      (
        '11111111-1111-4111-8111-111111111111'::uuid, 'legacy-published',
        'Published legacy title', 'Published legacy subtitle',
        'Published legacy abstract', 'report'::publication_type, 'forestry',
        '[{\"name\":\"Ama Mensah\",\"organization\":\"Green Gold Institute\"},{\"name\":\"Kojo Owusu\"}]'::jsonb,
        '2026-01-01'::date, 17, true, '/images/legacy-cover.webp',
        '/publications/legacy-paper.pdf', 'https://example.org/legacy-paper',
        '10.1234/legacy.2026.1', 'Published legacy body',
        'Published legacy SEO title', 'Published legacy SEO description',
        'published'::publication_status,
        '2025-12-01 10:11:12+00'::timestamptz, '2026-01-02 13:14:15+00'::timestamptz
      ),
      (
        '22222222-2222-4222-8222-222222222222'::uuid, 'legacy-draft',
        'Draft legacy title', NULL, 'Draft legacy abstract',
        'policy-brief'::publication_type, NULL, '[]'::jsonb, '2026-01-02'::date,
        NULL, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
        'draft'::publication_status,
        '2025-12-03 16:17:18+00'::timestamptz, '2026-01-04 19:20:21+00'::timestamptz
      )
  ),
  actual AS (
    SELECT
      id, slug, title, subtitle, abstract, publication_type, category, authors,
      publication_date, reading_time, featured, featured_image, pdf_url,
      external_url, doi, content, seo_title, seo_description, status, created_at,
      updated_at
    FROM publications
  ),
  differences AS (
    (SELECT * FROM expected EXCEPT SELECT * FROM actual)
    UNION ALL
    (SELECT * FROM actual EXCEPT SELECT * FROM expected)
  )
  SELECT CASE WHEN EXISTS (SELECT 1 FROM differences) THEN 'mismatch' ELSE 'ok' END;
")" = "ok"
test "$(psql "$legacy_url" -Atc "
  WITH expected (
    id, name, title, organization, quote, photo_url, source_url, status,
    display_order, created_at, updated_at
  ) AS (
    VALUES
      (
        '33333333-3333-4333-8333-333333333333'::uuid, 'Dr. Efua Asante',
        'Executive Director', 'Forest Futures Ghana',
        'A practical and timely account of Ghana''s green economy.',
        'https://example.org/images/efua-asante.webp',
        'https://example.org/endorsements/efua-asante',
        'approved'::endorsement_status, 7,
        '2026-02-01 08:09:10+00'::timestamptz,
        '2026-02-02 11:12:13+00'::timestamptz
      ),
      (
        '44444444-4444-4444-8444-444444444444'::uuid, 'Kwame Boateng',
        NULL, NULL, 'Essential reading for policy makers.', NULL, NULL,
        'archived'::endorsement_status, 0,
        '2026-02-03 14:15:16+00'::timestamptz,
        '2026-02-04 17:18:19+00'::timestamptz
      )
  ),
  actual AS (
    SELECT
      id, name, title, organization, quote, photo_url, source_url, status,
      display_order, created_at, updated_at
    FROM endorsements
  ),
  differences AS (
    (SELECT * FROM expected EXCEPT SELECT * FROM actual)
    UNION ALL
    (SELECT * FROM actual EXCEPT SELECT * FROM expected)
  )
  SELECT CASE WHEN EXISTS (SELECT 1 FROM differences) THEN 'mismatch' ELSE 'ok' END;
")" = "ok"
if psql "$fresh_url" -v ON_ERROR_STOP=1 -c \
  "INSERT INTO publications (slug, title, abstract, publication_type, authors, status) VALUES ('invalid', 'Invalid', 'A', 'report', '[]', 'published')" \
  >/dev/null 2>&1; then
  echo "published publication date constraint was not enforced" >&2
  exit 1
fi

if psql "$fresh_url" -v ON_ERROR_STOP=1 -c \
  "INSERT INTO endorsements (name, quote, photo_media_id) VALUES ('Invalid portrait', 'Missing media must be rejected.', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')" \
  >/dev/null 2>&1; then
  echo "missing endorsement portrait media was not rejected" >&2
  exit 1
fi

psql "$fresh_url" -v ON_ERROR_STOP=1 >/dev/null <<'SQL'
INSERT INTO media (
  id, storage_key, original_filename, mime_type, file_size, media_type,
  purpose, uploaded_by
) VALUES (
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  'endorsements/delete-behavior.webp',
  'delete-behavior.webp',
  'image/webp',
  1234,
  'image',
  'endorsement-portrait',
  'migration-baseline'
);
INSERT INTO endorsements (
  id, name, quote, photo_media_id
) VALUES (
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  'Delete behavior',
  'Deleting media should preserve this endorsement.',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
);
DELETE FROM media WHERE id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
SQL

test "$(psql "$fresh_url" -Atc "
  SELECT CASE
    WHEN photo_media_id IS NULL THEN 'ok'
    ELSE 'mismatch'
  END
  FROM endorsements
  WHERE id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
")" = "ok"

echo "fresh and legacy publication and endorsement migration baselines verified"