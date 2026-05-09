#!/usr/bin/env bash
# Seed the `default` and `1_default` users into Intelligence's Postgres.
#
# Why: the seed API key `cpk_sPRVSEED_seed0privat0longtoken00` that the BFF
# uses to talk to Intelligence resolves to userId='default', but Intelligence's
# built-in migrations only seed three *demo* users (jordan-beamson /
# alex-typeson / cam-elsworth). The very first thread-create call from the BFF
# therefore fails with:
#   threads_user_id_fkey: Key (user_id)=(1_default) is not present in users
#
# organization_id MUST match the organization owned by INTELLIGENCE_API_KEY.
# The bundled seed key `cpk_sPRVSEED...` belongs to `casa-de-erlang`.
#
# Idempotent: re-run after changing org — ON CONFLICT updates organization_id.
# Wrapper: `npm run seed` (also runs automatically as part of `npm run dev:infra`).
set -euo pipefail

CONTAINER="${INTELLIGENCE_PG_CONTAINER:-hackathon-intelligence-notion-postgres-1}"
ORG_ID="${INTELLIGENCE_DEFAULT_ORG_ID:-casa-de-erlang}"

if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
  echo "ERROR: Postgres container '${CONTAINER}' not running. Did you run 'npm run dev:infra'?" >&2
  exit 1
fi

SQL="
INSERT INTO cpki.organizations (id, name, slug, created_at, updated_at)
VALUES ('${ORG_ID}', 'Hackathon', '${ORG_ID}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO cpki.users (id, organization_id, created_at)
VALUES ('default', '${ORG_ID}', NOW()), ('1_default', '${ORG_ID}', NOW())
ON CONFLICT (id) DO UPDATE SET organization_id = EXCLUDED.organization_id;

SELECT id, organization_id FROM cpki.users WHERE id IN ('default','1_default');
"

docker exec "$CONTAINER" psql -U intelligence -d intelligence_app -v ON_ERROR_STOP=1 -c "$SQL"
