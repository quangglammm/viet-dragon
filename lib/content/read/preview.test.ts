import { describe, expect, it } from "vitest";
import { postDocument, productDocument, UID } from "@/tests/fixtures/documents";
import { overlayOf, type DraftEntry } from "./preview";

// Which open drafts are laid over the site and which are held back. Pure: validation is done before (`validateSnapshot`), so these
// tests hand over its verdict.

const product = (): DraftEntry => ({ ref: { type: "product", id: UID.product }, snapshot: productDocument(), isNew: false, issues: [] });
const post = (): DraftEntry => ({ ref: { type: "post", id: UID.post }, snapshot: postDocument(), isNew: true, issues: [] });

describe("overlayOf", () => {
  it("lays a valid draft over the site under the identity of its entity, as the parsed document", () => {
    const overlay = overlayOf([product()]);
    expect(overlay.documents.product.get(UID.product)?.uid).toBe(UID.product);
    expect(overlay.documents.product.size).toBe(1);
    expect(overlay.applied).toEqual([{ ref: { type: "product", id: UID.product }, label: expect.any(String), isNew: false }]);
    expect(overlay.skipped).toEqual([]);
  });

  it("keeps drafts of each type apart and marks an unpublished entity as new", () => {
    const overlay = overlayOf([product(), post()]);
    expect([...overlay.documents.product.keys()]).toEqual([UID.product]);
    expect([...overlay.documents.post.keys()]).toEqual([UID.post]);
    expect(overlay.documents.category.size).toBe(0);
    expect(overlay.applied.map((draft) => draft.isNew)).toEqual([false, true]);
  });

  it("holds back a draft the validator refused, and says why, in the editor's words", () => {
    const refused: DraftEntry = { ...product(), issues: [{ path: "i18n.vi.title", message: "Bắt buộc phải nhập." }, { path: "cover", message: "Không tìm thấy ảnh." }] };
    const overlay = overlayOf([refused, post()]);
    expect(overlay.documents.product.size).toBe(0);
    expect(overlay.skipped).toEqual([{ ref: { type: "product", id: UID.product }, label: expect.any(String), issue: "Bắt buộc phải nhập." }]);
    expect(overlay.applied.map((draft) => draft.ref.type)).toEqual(["post"]);
  });

  it("holds back a draft whose document does not parse even if nothing was reported (never partly applied)", () => {
    const broken: DraftEntry = { ref: { type: "post", id: UID.post }, snapshot: { ...postDocument(), publishedOn: "not a date" }, isNew: false, issues: [] };
    const overlay = overlayOf([broken]);
    expect(overlay.documents.post.size).toBe(0);
    expect(overlay.applied).toEqual([]);
    expect(overlay.skipped).toHaveLength(1);
    expect(overlay.skipped[0].issue).toBe("Bản nháp chưa hợp lệ.");
  });

  it("names a draft by its Vietnamese title, or by its id when it has none", () => {
    const named = overlayOf([post()]).applied[0];
    expect(named.label).toBe("Hướng dẫn in ấn");
    const unnamed: DraftEntry = { ref: { type: "post", id: UID.post }, snapshot: {}, isNew: true, issues: [{ path: "", message: "x" }] };
    expect(overlayOf([unnamed]).skipped[0].label).toBe(UID.post);
  });

  it("is empty when there are no drafts", () => {
    const overlay = overlayOf([]);
    expect(overlay.applied).toEqual([]);
    expect(overlay.skipped).toEqual([]);
    expect(Object.values(overlay.documents).every((documents) => documents.size === 0)).toBe(true);
  });
});
