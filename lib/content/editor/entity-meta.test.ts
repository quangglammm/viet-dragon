import { describe, expect, it } from "vitest";
import { DRAFT_ENTITY_TYPES } from "../entity-types";
import { CREATABLE_TYPES } from "./templates";
import { EDITABLE_TYPES, ENTITY_META, editorUrl, listUrl } from "./entity-meta";

describe("entity meta", () => {
  it("names every entity type", () => {
    for (const type of DRAFT_ENTITY_TYPES) {
      expect(ENTITY_META[type].label, type).toMatch(/\S/);
      expect(ENTITY_META[type].singular, type).toMatch(/\S/);
    }
  });

  it("builds the admin URLs with the type's kebab-case name", () => {
    expect(listUrl("fast_print_item")).toBe("/admin/content/fast-print-item");
    expect(editorUrl("spec_item", "technique.offset")).toBe("/admin/content/spec-item/technique.offset");
  });

  it("only offers 'create' for types that have an editor", () => {
    for (const type of CREATABLE_TYPES) expect(EDITABLE_TYPES, type).toContain(type);
  });
});
