import { describe, expect, it } from "vitest";
import { COLUMN_REGISTRY, documentPaths, UNREGISTERED_TABLES } from "./column-registry";
import { schemaHasPath } from "./schema-paths";
import { DOCUMENT_SCHEMAS } from "./schemas";

const registered = Object.entries(COLUMN_REGISTRY).flatMap(([table, entry]) =>
  Object.entries(entry.columns).flatMap(([column, source]) =>
    documentPaths(source).map((path) => ({ table, column, path, document: entry.document }) as const),
  ),
);

describe("column registry ⇄ document schemas", () => {
  it("registers a document path for every non-system column", () => {
    expect(registered.length).toBeGreaterThan(150);
  });

  it.each(registered.map((r) => [`${r.table}.${r.column} → ${r.document}:${r.path}`, r] as const))("%s exists in the document schema", (_label, r) => {
    expect(schemaHasPath(DOCUMENT_SCHEMAS[r.document], r.path), `${r.path} is not a field of the ${r.document} document`).toBe(true);
  });

  it("does not list a table both as registered and as unregistered", () => {
    expect(Object.keys(COLUMN_REGISTRY).filter((table) => table in UNREGISTERED_TABLES)).toEqual([]);
  });

  it("gives every unregistered table a reason", () => {
    for (const [table, reason] of Object.entries(UNREGISTERED_TABLES)) expect(reason.length, table).toBeGreaterThan(10);
  });
});

describe("schemaHasPath", () => {
  const schema = DOCUMENT_SCHEMAS.product;
  it("follows properties, array elements and language maps", () => {
    expect(schemaHasPath(schema, "slug")).toBe(true);
    expect(schemaHasPath(schema, "options[].bullets[].i18n.*")).toBe(true);
    expect(schemaHasPath(schema, "shapes[].i18n.*.badge")).toBe(true);
  });
  it("rejects paths that are not in the document", () => {
    expect(schemaHasPath(schema, "slugg")).toBe(false);
    expect(schemaHasPath(schema, "slug[]")).toBe(false);
    expect(schemaHasPath(schema, "shapes.name")).toBe(false);
    expect(schemaHasPath(schema, "i18n.*.nope")).toBe(false);
  });
  it("sees through unions (a menu item targets a shape or an option)", () => {
    const menu = DOCUMENT_SCHEMAS.menu;
    expect(schemaHasPath(menu, "columns[].groups[].items[].target.shape")).toBe(true);
    expect(schemaHasPath(menu, "columns[].groups[].items[].target.option")).toBe(true);
    expect(schemaHasPath(menu, "columns[].groups[].items[].target.size")).toBe(false);
  });
});
