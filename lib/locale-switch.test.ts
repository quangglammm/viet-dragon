import { describe, expect, it } from "vitest";
import { alternateInternalPath } from "./locale-switch";

/** A document whose head holds `<link rel="alternate" hreflang=…>` for each pair given. */
function head(links: Record<string, string>) {
  return {
    querySelector: (selector: string) => {
      const language = /hreflang="([^"]+)"/.exec(selector)?.[1] ?? "";
      const href = links[language];
      return href === undefined ? null : { getAttribute: (name: string) => (name === "href" ? href : null) };
    },
  } as unknown as Pick<Document, "querySelector">;
}

const PRODUCT = {
  vi: "https://vietdragon.vn/san-pham/tiep-thi/to-roi",
  en: "https://vietdragon.vn/en/products/marketing/flyers",
  zh: "https://vietdragon.vn/zh/products/marketing/flyers",
  "x-default": "https://vietdragon.vn/san-pham/tiep-thi/to-roi",
};

describe("alternateInternalPath", () => {
  it("returns the internal path the page declares for the language — that language's own slugs, no hop", () => {
    expect(alternateInternalPath("en", head(PRODUCT))).toBe("/products/marketing/flyers");
    expect(alternateInternalPath("vi", head(PRODUCT))).toBe("/products/tiep-thi/to-roi");
  });

  it("reads the Vietnamese words and the home page back", () => {
    expect(alternateInternalPath("vi", head({ vi: "http://localhost:3000/san-pham/in-nhanh" }))).toBe("/products/fast-print");
    expect(alternateInternalPath("vi", head({ vi: "http://localhost:3000/" }))).toBe("/");
    expect(alternateInternalPath("ja", head({ ja: "http://localhost:3000/ja" }))).toBe("/");
  });

  it("cares about the path only, whatever origin the declaration was written for", () => {
    expect(alternateInternalPath("ko", head({ ko: "https://staging.example.org/ko/blog/printing-guide" }))).toBe("/blog/printing-guide");
  });

  it("also reads a declaration written as a path", () => {
    expect(alternateInternalPath("en", head({ en: "/en/products/marketing/flyers?utm=1" }))).toBe("/products/marketing/flyers?utm=1");
  });

  it("returns null when the page declares nothing for the language, or something that is not that language", () => {
    expect(alternateInternalPath("ja", head(PRODUCT))).toBeNull();
    expect(alternateInternalPath("en", head({ en: "https://vietdragon.vn/san-pham/tiep-thi/to-roi" }))).toBeNull();
    expect(alternateInternalPath("en", head({ en: "" }))).toBeNull();
  });
});
