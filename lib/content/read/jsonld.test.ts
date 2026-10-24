import { describe, expect, it } from "vitest";
import { blogPostingOf, breadcrumbOf, organizationOf, serializeJsonLd, urlOf, websiteOf } from "./jsonld";

const ORIGIN = "https://vietdragon.vn";

describe("urlOf", () => {
  it("is the absolute address of an internal path in a language", () => {
    expect(urlOf(ORIGIN, "vi", "/products/tiep-thi")).toBe("https://vietdragon.vn/san-pham/tiep-thi");
    expect(urlOf(ORIGIN, "en", "/blog/x")).toBe("https://vietdragon.vn/en/blog/x");
    expect(urlOf(ORIGIN, "vi", "/")).toBe("https://vietdragon.vn");
    expect(urlOf(ORIGIN, "ko", "/")).toBe("https://vietdragon.vn/ko");
  });
});

describe("breadcrumbOf", () => {
  it("lists the trail from 1, each item with its name and absolute address in the page's language", () => {
    const list = breadcrumbOf(ORIGIN, "vi", [{ name: "Trang chủ", path: "/" }, { name: "Sản phẩm", path: "/products" }, { name: "Tiếp thị", path: "/products/tiep-thi" }]);
    expect(list).toMatchObject({ "@type": "BreadcrumbList" });
    expect(list.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: "https://vietdragon.vn" },
      { "@type": "ListItem", position: 2, name: "Sản phẩm", item: "https://vietdragon.vn/san-pham" },
      { "@type": "ListItem", position: 3, name: "Tiếp thị", item: "https://vietdragon.vn/san-pham/tiep-thi" },
    ]);
  });
});

describe("organizationOf and websiteOf", () => {
  const organization = organizationOf({ origin: ORIGIN, locale: "en", name: "Viet Dragon", logo: "/logo-icon.webp", telephone: "+84901448377", email: "contact@vietdragon.vn", areaServed: "HCM City" });

  it("describes the business with its contact details and no street address", () => {
    expect(organization).toMatchObject({ "@type": "Organization", name: "Viet Dragon", url: "https://vietdragon.vn/en", logo: "https://vietdragon.vn/logo-icon.webp", telephone: "+84901448377", email: "contact@vietdragon.vn", areaServed: "HCM City" });
    expect(organization).not.toHaveProperty("address");
    expect(organization).not.toHaveProperty("sameAs");
  });

  it("links the website to the organization by id and names its language", () => {
    expect(websiteOf({ origin: ORIGIN, locale: "ja", name: "Viet Dragon" })).toMatchObject({ "@type": "WebSite", url: "https://vietdragon.vn/ja", inLanguage: "ja", publisher: { "@id": "https://vietdragon.vn/#organization" } });
    expect(organization["@id"]).toBe("https://vietdragon.vn/#organization");
  });
});

describe("blogPostingOf", () => {
  const input = { origin: ORIGIN, locale: "vi" as const, headline: "Chọn giấy", description: "Mô tả", path: "/blog/chon-giay", image: "/images/blog/a.webp", datePublished: "2026-06-10", publisher: { name: "Viet Dragon", logo: "/logo-icon.webp" } };

  it("carries the headline, dates, address, image and publisher", () => {
    expect(blogPostingOf(input)).toMatchObject({
      "@type": "BlogPosting",
      headline: "Chọn giấy",
      datePublished: "2026-06-10",
      url: "https://vietdragon.vn/bai-viet/chon-giay",
      mainEntityOfPage: "https://vietdragon.vn/bai-viet/chon-giay",
      image: "https://vietdragon.vn/images/blog/a.webp",
      inLanguage: "vi",
      publisher: { "@type": "Organization", name: "Viet Dragon", logo: { url: "https://vietdragon.vn/logo-icon.webp" } },
    });
  });

  it("leaves out an image or a description the post does not have", () => {
    const bare = blogPostingOf({ ...input, image: null, description: "" });
    expect(bare).not.toHaveProperty("image");
    expect(bare).not.toHaveProperty("description");
  });
});

describe("serializeJsonLd", () => {
  it("can never close the script tag or start a comment, whatever the text says", () => {
    const text = serializeJsonLd({ name: "</script><script>alert(1)</script><!-- & \u2028" });
    expect(text).not.toMatch(/<\/?script|<!--|&|\u2028/);
    expect(JSON.parse(text)).toEqual({ name: "</script><script>alert(1)</script><!-- & \u2028" });
  });

  it("serializes a list the same way", () => {
    expect(JSON.parse(serializeJsonLd([{ a: 1 }, { b: "<" }]))).toEqual([{ a: 1 }, { b: "<" }]);
  });
});
