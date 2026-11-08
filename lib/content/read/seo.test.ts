import { describe, expect, it } from "vitest";
import { absoluteUrl, alternatesOf, pageMetadata, samePath, seoMeta, type LanguagePaths } from "./seo";

const paths: LanguagePaths = { vi: "/products/tiep-thi/to-roi", en: "/products/marketing/flyers", zh: "/products/marketing/flyers", ja: "/products/marketing/flyers", ko: "/products/marketing/flyers" };
const SITE = { siteName: "Viet Dragon", defaultImage: "/images/hero/slide-1.jpg" };
const fallback = { title: "Tờ rơi | Viet Dragon", description: "In tờ rơi nhanh" };

describe("seoMeta", () => {
  it("keeps the page's own title and description when the editor wrote no SEO text", () => {
    expect(seoMeta("vi", { title: {}, description: {} }, fallback, "/images/a.webp")).toEqual({ ...fallback, image: "/images/a.webp" });
  });

  it("takes an SEO text written for THIS language, and each field on its own", () => {
    const seo = { title: { vi: "In tờ rơi giá rẻ" }, description: {} };
    expect(seoMeta("vi", seo, fallback, null)).toEqual({ title: "In tờ rơi giá rẻ", description: "In tờ rơi nhanh", image: null });
  });

  it("never shows another language's SEO text, and treats a blank one as none", () => {
    const seo = { title: { vi: "Tiêu đề SEO", en: "   " }, description: { vi: "Mô tả SEO" } };
    expect(seoMeta("en", seo, { title: "Flyers", description: "Fast flyers" }, null)).toEqual({ title: "Flyers", description: "Fast flyers", image: null });
    expect(seoMeta("zh", seo, { title: "宣传单", description: "快印" }, null).title).toBe("宣传单");
  });
});

describe("alternatesOf", () => {
  it("names the page's own address and the same page in every language, each with its prefix and its words", () => {
    expect(alternatesOf("vi", paths)).toEqual({
      canonical: "/san-pham/tiep-thi/to-roi",
      languages: {
        vi: "/san-pham/tiep-thi/to-roi",
        en: "/en/products/marketing/flyers",
        zh: "/zh/products/marketing/flyers",
        ja: "/ja/products/marketing/flyers",
        ko: "/ko/products/marketing/flyers",
        "x-default": "/san-pham/tiep-thi/to-roi",
      },
    });
  });

  it("makes the canonical the page's own language, whichever language asks, and points x-default at Vietnamese", () => {
    const en = alternatesOf("en", paths);
    expect(en.canonical).toBe("/en/products/marketing/flyers");
    expect(en.languages["x-default"]).toBe("/san-pham/tiep-thi/to-roi");
  });

  it("handles the pages that are the same path in every language", () => {
    expect(alternatesOf("ja", samePath("/")).languages).toEqual({ vi: "/", en: "/en", zh: "/zh", ja: "/ja", ko: "/ko", "x-default": "/" });
    expect(alternatesOf("vi", samePath("/products/fast-print")).canonical).toBe("/san-pham/in-nhanh");
    expect(alternatesOf("vi", samePath("/blog")).canonical).toBe("/bai-viet");
  });
});

describe("pageMetadata", () => {
  const meta = { title: "Tờ rơi | Viet Dragon", description: "In tờ rơi nhanh", image: "/images/product/to-roi.webp" };

  it("carries the title, description, hreflang and an Open Graph card in the page's language", () => {
    const result = pageMetadata({ locale: "vi", meta, paths, site: SITE });
    expect(result).toMatchObject({ title: meta.title, description: meta.description, alternates: { canonical: "/san-pham/tiep-thi/to-roi" } });
    expect(result.openGraph).toMatchObject({ type: "website", title: meta.title, url: "/san-pham/tiep-thi/to-roi", siteName: "Viet Dragon", locale: "vi_VN", images: [{ url: "/images/product/to-roi.webp" }] });
    expect(result.openGraph).not.toHaveProperty("publishedTime");
  });

  it("lists the other languages as alternates and never the current one", () => {
    const og = pageMetadata({ locale: "en", meta, paths, site: SITE }).openGraph as { locale: string; alternateLocale: string[] };
    expect(og.locale).toBe("en_US");
    expect(og.alternateLocale).toEqual(["vi_VN", "zh_CN", "ja_JP", "ko_KR"]);
  });

  it("falls back to the site's picture, and to none at all", () => {
    expect(pageMetadata({ locale: "vi", meta: { ...meta, image: null }, paths, site: SITE }).openGraph).toMatchObject({ images: [{ url: "/images/hero/slide-1.jpg" }] });
    expect(pageMetadata({ locale: "vi", meta: { ...meta, image: null }, paths, site: { ...SITE, defaultImage: null } }).openGraph).toMatchObject({ images: undefined });
  });

  it("makes a large-image Twitter card with the same words and picture", () => {
    expect(pageMetadata({ locale: "vi", meta, paths, site: SITE }).twitter).toMatchObject({ card: "summary_large_image", title: meta.title, images: [{ url: "/images/product/to-roi.webp" }] });
  });

  it("marks a post as an article with its date", () => {
    const result = pageMetadata({ locale: "vi", meta, paths: samePath("/blog"), site: SITE, type: "article", publishedTime: "2026-06-10" });
    expect(result.openGraph).toMatchObject({ type: "article", publishedTime: "2026-06-10" });
  });
});

describe("absoluteUrl", () => {
  it("joins the origin and the path, and writes the home page as the bare origin (what Next writes for its canonical)", () => {
    expect(absoluteUrl("https://vietdragon.vn", "/san-pham/tiep-thi")).toBe("https://vietdragon.vn/san-pham/tiep-thi");
    expect(absoluteUrl("https://vietdragon.vn", "/en")).toBe("https://vietdragon.vn/en");
    expect(absoluteUrl("https://vietdragon.vn", "/")).toBe("https://vietdragon.vn");
  });
});
