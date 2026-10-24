import { describe, expect, it } from "vitest";
import { DRAFT_ENTITY_TYPES } from "@/lib/db/content/drafts";
import { FIELD_REGISTRY, SYSTEM_PATHS, fieldLabel, registryPathOf } from "./field-registry";
import { documentLeafPaths } from "./schema-paths";
import { DOCUMENT_SCHEMAS } from "./schemas";

describe.each(DRAFT_ENTITY_TYPES)("field registry: %s", (type) => {
  const leaves = documentLeafPaths(DOCUMENT_SCHEMAS[type]);
  const registered = FIELD_REGISTRY[type].map((field) => field.path);
  const system = SYSTEM_PATHS[type];

  it("gives every editable leaf of the document schema a control (or marks it system-only)", () => {
    const covered = new Set([...registered, ...system]);
    expect(leaves.filter((path) => !covered.has(path))).toEqual([]);
  });

  it("lists no field the document schema does not have", () => {
    const real = new Set(leaves);
    expect([...registered, ...system].filter((path) => !real.has(path))).toEqual([]);
  });

  it("registers each path once, and never as both editable and system", () => {
    expect(new Set(registered).size).toBe(registered.length);
    expect(registered.filter((path) => system.includes(path))).toEqual([]);
  });

  it("labels every field in Vietnamese text", () => {
    for (const field of FIELD_REGISTRY[type]) expect(field.label, field.path).toMatch(/\S{2}/);
  });
});

describe("documentLeafPaths", () => {
  it("lists the leaves of nested lists and language maps, and both branches of a union", () => {
    expect(documentLeafPaths(DOCUMENT_SCHEMAS.product)).toEqual(expect.arrayContaining(["options[].bullets[].i18n.*", "options[].images.default[]", "slugs.*.aliases[].category", "sizes[].w"]));
    expect(documentLeafPaths(DOCUMENT_SCHEMAS.menu)).toEqual(expect.arrayContaining(["columns[].groups[].items[].target.shape", "columns[].groups[].items[].target.option"]));
    expect(documentLeafPaths(DOCUMENT_SCHEMAS.site_message)).toContain("data.*.*");
  });
});

describe("registryPathOf and fieldLabel", () => {
  it("turns a concrete path into the registry's: list indexes and languages generalize", () => {
    expect(registryPathOf("options[3f2a].prices.base")).toBe("options[].prices.base");
    expect(registryPathOf("i18n.vi.title")).toBe("i18n.*.title");
    expect(registryPathOf("shapes[2].slugs.zh.aliases[0]")).toBe("shapes[].slugs.*.aliases[]");
    expect(registryPathOf("options[ab-cd].bullets[feature:0].i18n.ko")).toBe("options[].bullets[].i18n.*");
  });

  it("labels a path with its language, and falls back to the path itself for anything unknown", () => {
    expect(fieldLabel("product", "i18n.en.title")).toBe("Tên sản phẩm (en)");
    expect(fieldLabel("product", "options[u1].prices.base")).toBe("Giá cơ bản (đ)");
    expect(fieldLabel("product", "no.such.field")).toBe("no.such.field");
  });
});
