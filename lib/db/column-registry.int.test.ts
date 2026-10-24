import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { COLUMN_REGISTRY, UNREGISTERED_TABLES } from "@/lib/content/column-registry";
import { DOCUMENT_SCHEMAS, documentIdentity, parseDocument } from "@/lib/content/schemas";
import { menuDocument, postDocument, productDocument } from "@/tests/fixtures/documents";
import { createScratchDatabase, type ScratchDatabase } from "@/tests/helpers/db";

// The registry must describe the database exactly (docs/data-model.md §10): a column added without being registered
// fails here, so it cannot ship un-editable or be silently reset by a publish.

const AUTH_AND_INFRASTRUCTURE = ["app_user", "session", "account", "verification", "rate_limit", "login_attempt", "audit_log"];

let scratch: ScratchDatabase;
beforeAll(async () => {
  scratch = await createScratchDatabase("registry");
});
afterAll(async () => {
  await scratch.drop();
});

async function contentColumns(): Promise<Map<string, string[]>> {
  const { rows } = await scratch.pool.query<{ table_name: string; column_name: string }>(
    `select c.table_name, c.column_name from information_schema.columns c join information_schema.tables t using (table_schema, table_name)
     where c.table_schema = 'public' and t.table_type = 'BASE TABLE' and not (c.table_name = any($1)) and c.table_name <> '__drizzle_migrations'
     order by c.table_name, c.ordinal_position`,
    [AUTH_AND_INFRASTRUCTURE],
  );
  const byTable = new Map<string, string[]>();
  for (const row of rows) byTable.set(row.table_name, [...(byTable.get(row.table_name) ?? []), row.column_name]);
  return byTable;
}

describe("column registry ⇄ database", () => {
  it("accounts for every content table, registered or explicitly unregistered with a reason", async () => {
    const tables = [...(await contentColumns()).keys()].sort();
    expect([...Object.keys(COLUMN_REGISTRY), ...Object.keys(UNREGISTERED_TABLES)].sort()).toEqual(tables);
  });

  it("lists exactly the columns of every registered table", async () => {
    const actual = await contentColumns();
    for (const [table, entry] of Object.entries(COLUMN_REGISTRY)) {
      expect(Object.keys(entry.columns).sort(), `columns of ${table}`).toEqual([...(actual.get(table) ?? [])].sort());
    }
  });
});

describe("a document is filed under the identity the database enforces", () => {
  const cases = [
    ["product", productDocument()],
    ["post", postDocument()],
    ["menu", menuDocument()],
  ] as const;

  it.each(cases)("accepts a valid %s document as a draft and as a revision", async (type, document) => {
    expect(parseDocument(type, document).success).toBe(true);
    const identity = documentIdentity(type, document);
    const client = await scratch.pool.connect();
    try {
      await client.query("begin");
      const columns = "(entity_type, entity_uid, entity_key, snapshot)";
      await client.query(`insert into content_draft ${columns} values ($1, $2, $3, $4)`, [type, identity.entityUid, identity.entityKey, JSON.stringify(document)]);
      await client.query(`insert into content_revision (entity_type, entity_uid, entity_key, version, snapshot) values ($1, $2, $3, 1, $4)`, [type, identity.entityUid, identity.entityKey, JSON.stringify(document)]);
    } finally {
      await client.query("rollback");
      client.release();
    }
  });

  it("has a document schema for every entity type the draft table accepts", async () => {
    const { rows } = await scratch.pool.query<{ def: string }>(`select pg_get_constraintdef(oid) def from pg_constraint where conname = 'content_draft_entity_type_valid'`);
    const allowed = [...rows[0].def.matchAll(/'([a-z_]+)'::text/g)].map((m) => m[1]).sort();
    expect(Object.keys(DOCUMENT_SCHEMAS).sort()).toEqual(allowed);
  });
});
