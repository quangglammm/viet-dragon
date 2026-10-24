import { describe, expect, it } from "vitest";
import { Conflict, Invalid, NotFound } from "./errors";
import { databaseErrorOf, humanize } from "./humanize";

const databaseError = (code: string, constraint?: string, message = "boom") => Object.assign(new Error(message), { code, constraint });
/** Drizzle wraps the driver's error: the original is `cause`. */
const wrapped = (inner: Error) => Object.assign(new Error("Failed query: insert …"), { cause: inner });

describe("databaseErrorOf", () => {
  it("finds the driver error through Drizzle's wrapper", () => {
    expect(databaseErrorOf(wrapped(databaseError("23505", "x_pk")))).toEqual({ code: "23505", constraint: "x_pk", message: "boom" });
  });
  it("ignores errors that do not come from the database", () => {
    expect(databaseErrorOf(new Error("nope"))).toBeNull();
    expect(databaseErrorOf(Object.assign(new Error("x"), { code: "ECONNRESET" }))).toBeNull();
    expect(databaseErrorOf("text")).toBeNull();
  });
  it("keeps only the first line of the message", () => {
    expect(databaseErrorOf(databaseError("23514", undefined, "line one\nDETAIL: line two"))?.message).toBe("line one");
  });
});

describe("humanize", () => {
  const messageOf = (error: unknown) => (error as Invalid).issues[0].message;

  it.each([
    ["product_slug_locale_category_id_slug_pk", /đã được sản phẩm khác dùng/],
    ["product_segment_product_id_locale_slug_pk", /hình dạng hoặc tùy chọn bị trùng/],
    ["post_slug_locale_slug_pk", /bài khác/],
    ["category_slug_locale_slug_pk", /danh mục khác/],
  ])("explains a taken URL (%s)", (constraint, pattern) => {
    const result = humanize(wrapped(databaseError("23505", constraint)));
    expect(result).toBeInstanceOf(Invalid);
    expect(messageOf(result)).toMatch(pattern);
  });

  it("explains a key that another record already uses (Fast Print, showcase, vocabulary)", () => {
    for (const constraint of ["fast_print_item_key_unique", "showcase_item_key_unique", "material_slug_unique", "trait_pkey"]) {
      expect(messageOf(humanize(databaseError("23505", constraint))), constraint).toMatch(/Khóa \(mã\)/);
    }
  });

  it("explains a uid that belongs to another record", () => {
    expect(messageOf(humanize(databaseError("23505", "shape_uid_unique")))).toMatch(/mã định danh/);
    expect(messageOf(humanize(databaseError("23505", "option_uid_key")))).toMatch(/mã định danh/);
  });

  it("explains a shape or option that a menu still uses, found at COMMIT", () => {
    expect(messageOf(humanize(databaseError("23503", "menu_item_shape_fk")))).toMatch(/menu/);
    expect(messageOf(humanize(databaseError("23503", "menu_item_option_fk")))).toMatch(/menu/);
  });

  it("explains a video in a photo slot, then falls back to a generic reference message", () => {
    expect(messageOf(humanize(databaseError("23503", "option_image_media_fk")))).toMatch(/chỉ nhận ảnh/);
    expect(messageOf(humanize(databaseError("23503", "product_og_media_fk")))).toMatch(/chỉ nhận ảnh/);
    expect(messageOf(humanize(databaseError("23503", "option_material_id_material_id_fk")))).toMatch(/tham chiếu/);
  });

  it("reports a violated integrity rule with its name", () => {
    expect(messageOf(humanize(databaseError("23514", "option_i18n_not_empty")))).toContain("option_i18n_not_empty");
    expect(messageOf(humanize(databaseError("23514", undefined, "product 5 has no canonical slug in category x for language zh")))).toContain("canonical slug");
  });

  it("returns domain errors and unrelated failures untouched", () => {
    const conflict = new Conflict("GONE", "x");
    const notFound = new NotFound();
    const outage = databaseError("57P01", undefined, "terminating connection");
    expect(humanize(conflict)).toBe(conflict);
    expect(humanize(notFound)).toBe(notFound);
    expect(humanize(outage)).toBe(outage);
    const bug = new TypeError("x is undefined");
    expect(humanize(bug)).toBe(bug);
  });
});
