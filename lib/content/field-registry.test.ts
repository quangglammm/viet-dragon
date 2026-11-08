import { describe, expect, it } from "vitest";
import { DRAFT_ENTITY_TYPES } from "@/lib/db/content/drafts";
import { FIELD_REGISTRY, LIST_ELEMENT_NOUNS, SYSTEM_PATHS, fieldLabel, registryPathOf } from "./field-registry";
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

  it("says which row a problem is in when the path counts rows by position", () => {
    expect(fieldLabel("product", "options[2].prices.base")).toBe("Giá cơ bản (đ) · chất liệu 3");
    expect(fieldLabel("product", "options[0].bullets[3].i18n.vi")).toMatch(/ · chất liệu 1 · dòng nội dung 4$/);
  });

  it("names a container by its first field, so «shapes[3].i18n.en» reads as a field the editor knows", () => {
    expect(fieldLabel("product", "shapes[3].i18n.en")).toBe("Tên hình thức (en) · hình thức 4");
    expect(fieldLabel("product", "i18n.zh")).toBe("Tên sản phẩm (zh)");
  });

  it("names a whole row by what it is: a row added to or removed from a list, or one the document complains about", () => {
    expect(fieldLabel("product", "options[3f2a].bullets[feature:3]")).toBe("Dòng nội dung");
    expect(fieldLabel("product", "shapes[3]")).toBe("Hình thức 4");
    expect(fieldLabel("product", "options[1].bullets[2]")).toBe("Dòng nội dung 3 · chất liệu 2");
    expect(fieldLabel("product", "sizes[0]")).toBe("Kích thước 1");
  });

  it("names a UI text by its language and its place in the namespace", () => {
    expect(fieldLabel("site_message", "data.zh.about.checklist[2]")).toBe("Văn bản giao diện (zh) · about.checklist[2]");
    expect(fieldLabel("site_message", "data.vi.title")).toBe("Văn bản giao diện (vi) · title");
    expect(fieldLabel("site_message", "data")).toBe("Văn bản giao diện"); // the whole tree: named by its first field, like any container
  });

  it("reads a menu column's number as its identity in a diff, and as a position (from 0) in an issue", () => {
    expect(fieldLabel("menu", "columns[1]")).toBe("Cột menu 2"); // an issue: the second column of the list
    expect(fieldLabel("menu", "columns[4]", true)).toBe("Cột menu 4"); // a diff: column number 4
    expect(fieldLabel("menu", "columns[2].groups[3f2a]", true)).toBe("Nhóm menu · cột menu 2");
    expect(fieldLabel("product", "options[0].bullets[1]", true)).toBe("Dòng nội dung 2 · chất liệu 1"); // other lists stay positions
  });

  it("knows what every list in the registry calls its rows", () => {
    const lists = new Set(Object.values(FIELD_REGISTRY).flatMap((fields) => fields.flatMap((field) => [...field.path.matchAll(/([A-Za-z_]+)\[\]/g)].map((match) => match[1]))));
    expect([...lists].filter((list) => !(list in LIST_ELEMENT_NOUNS))).toEqual([]);
  });
});
