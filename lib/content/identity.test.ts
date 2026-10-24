import { describe, expect, it } from "vitest";
import { DRAFT_ENTITY_TYPES } from "@/lib/db/content/drafts";
import { decodeEntityId, encodeEntityId, entityTypeFromUrl, entityTypeToUrl, identityOf, isEntityId, refOfDocument } from "./identity";

const UID = "11111111-1111-4111-8111-111111111111";

describe("entity types in URLs", () => {
  it.each(DRAFT_ENTITY_TYPES)("%s round-trips through its URL name", (type) => {
    expect(entityTypeFromUrl(entityTypeToUrl(type))).toBe(type);
  });

  it("uses kebab-case and rejects the database spelling and unknown names", () => {
    expect(entityTypeToUrl("spec_item")).toBe("spec-item");
    expect(entityTypeFromUrl("spec_item")).toBeNull();
    expect(entityTypeFromUrl("products")).toBeNull();
  });
});

describe("entity ids", () => {
  it("accepts a uid for uid entities (any case) and nothing else", () => {
    expect(decodeEntityId("product", UID.toUpperCase())).toBe(UID);
    expect(decodeEntityId("product", "to-roi")).toBeNull();
    expect(decodeEntityId("post", "not-a-uuid")).toBeNull();
  });

  it("accepts a kebab-case key for vocabulary and structural records", () => {
    expect(decodeEntityId("material", "giay-loai-c")).toBe("giay-loai-c");
    expect(decodeEntityId("category", "Tiep Thi")).toBeNull();
    expect(decodeEntityId("menu", "tet")).toBe("tet");
  });

  it("carries a spec item's kind/key as kind.key and decodes it back", () => {
    expect(encodeEntityId("spec_item", "technique/offset")).toBe("technique.offset");
    expect(decodeEntityId("spec_item", "technique.offset")).toBe("technique/offset");
    expect(decodeEntityId("spec_item", "offset")).toBeNull();
    expect(decodeEntityId("spec_item", "unknown-kind.offset")).toBeNull();
    expect(encodeEntityId("material", "giay-loai-c")).toBe("giay-loai-c");
  });

  it("accepts a CamelCase namespace for site messages", () => {
    expect(decodeEntityId("site_message", "heroSection")).toBe("heroSection");
    expect(decodeEntityId("site_message", "1bad")).toBeNull();
    expect(isEntityId("site_message", "hero-section")).toBe(false);
  });
});

describe("identity", () => {
  it("files uid entities under entityUid and the rest under entityKey", () => {
    expect(identityOf({ type: "product", id: UID })).toEqual({ entityUid: UID, entityKey: null });
    expect(identityOf({ type: "trait", id: "glossy-coat" })).toEqual({ entityUid: null, entityKey: "glossy-coat" });
  });

  it("reads the identity out of a document", () => {
    expect(refOfDocument("product", { uid: UID })).toEqual({ type: "product", id: UID });
    expect(refOfDocument("menu", { key: "tet" })).toEqual({ type: "menu", id: "tet" });
    expect(() => refOfDocument("product", {})).toThrow(/no uid/);
    expect(() => refOfDocument("unit", { uid: UID })).toThrow(/no key/);
  });
});
