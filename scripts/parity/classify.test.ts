import { describe, expect, it } from "vitest";
import { compare, firstDifference, withoutForms, type Expectations } from "./classify";
import type { PageDigest } from "./text";

const page = (overrides: Partial<PageDigest> = {}): PageDigest => ({ title: "T", description: "D", text: "Intro. Outro.", links: ["/a", "/b"], ...overrides });
const expectations = (overrides: Partial<Expectations> = {}): Expectations => ({ canonical: (link) => link, ...overrides });
const FORM_TEXT = "Kích thước phổ biến: Lớn Vừa Nhỏ Kỹ thuật in: Offset Chất liệu: Giấy C Thành phẩm sau in: Cán màng Tư vấn Zalo";

describe("withoutForms", () => {
  it("replaces the form under each card, in any language, with a marker", () => {
    expect(withoutForms(`Heading ${FORM_TEXT} More ${FORM_TEXT} End`)).toBe("Heading ⟨form⟩ More ⟨form⟩ End");
    expect(withoutForms("Popular sizes: Large Printing technique: Offset Zalo Consultation after")).toBe("⟨form⟩ after");
  });

  it("leaves a text without a form alone", () => {
    expect(withoutForms("Nothing  to   see")).toBe("Nothing to see");
  });
});

describe("compare", () => {
  it("calls equal pages identical", () => {
    expect(compare(page(), page(), expectations())).toEqual({ verdict: "identical", detail: [] });
  });

  it("follows the old links through the redirects the new site answers", () => {
    const canonical = (link: string) => (link === "/a" ? "/a-new" : link);
    expect(compare(page(), page({ links: ["/a-new", "/b"] }), expectations({ canonical })).verdict).toBe("identical");
    const result = compare(page(), page({ links: ["/a", "/b"] }), expectations({ canonical }));
    expect(result.verdict).toBe("links");
    expect(result.detail).toEqual(["only on the old page: /a-new", "only on the new page: /a"]);
  });

  it("recognizes a page that differs only in the cards' forms", () => {
    const old = page({ text: `Intro ${FORM_TEXT} Outro` });
    const now = page({ text: "Intro Kích thước phổ biến: Lớn (A4) Kỹ thuật in: Offset Chất liệu: Giấy Thành phẩm sau in: Bế Tư vấn Zalo Outro" });
    expect(compare(old, now, expectations()).verdict).toBe("forms-only");
  });

  it("does not hide a changed title or description behind the form rule", () => {
    const result = compare(page({ title: "Old" }), page({ title: "New" }), expectations());
    expect(result.verdict).toBe("other");
    expect(result.detail.join("\n")).toContain("head:");
  });

  it("reports where the texts first differ", () => {
    const result = compare(page({ text: "one two three" }), page({ text: "one 2 three" }), expectations());
    expect(result.verdict).toBe("other");
    expect(result.detail.at(-1)).toBe("text: …one two three…  ≠  …one 2 three…");
  });
});

describe("helpers", () => {
  it("shows the first difference with context", () => {
    expect(firstDifference("abcdef", "abcXef", 2)).toBe("…bcde…  ≠  …bcXe…");
  });
});
