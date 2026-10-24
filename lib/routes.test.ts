import { describe, expect, it } from "vitest";
import { routing } from "@/i18n/routing";
import { ROUTE_LOCALES, decideRoute, localizePath, parsePublicPath, publicPath, toInternalPath, type RouteLocale } from "./routes";

describe("the locales of the routing table", () => {
  it("are the ones the site routes", () => {
    expect([...ROUTE_LOCALES]).toEqual([...routing.locales]);
  });
});

describe("localizePath", () => {
  it("writes Vietnamese addresses with Vietnamese words, and every other language with the English ones", () => {
    expect(localizePath("vi", "/products")).toBe("/san-pham");
    expect(localizePath("vi", "/products/tiep-thi/to-roi/a5")).toBe("/san-pham/tiep-thi/to-roi/a5");
    expect(localizePath("vi", "/products/fast-print")).toBe("/san-pham/in-nhanh");
    expect(localizePath("vi", "/blog")).toBe("/bai-viet");
    expect(localizePath("vi", "/blog/bai-a")).toBe("/bai-viet/bai-a");
    for (const locale of ["en", "zh", "ja", "ko"] as const) {
      expect(localizePath(locale, "/products/x/y")).toBe("/products/x/y");
      expect(localizePath(locale, "/products/fast-print")).toBe("/products/fast-print");
      expect(localizePath(locale, "/blog/z")).toBe("/blog/z");
    }
  });

  it("keeps the query and the hash, and leaves a slug that merely looks like a word alone", () => {
    expect(localizePath("vi", "/products/tet/bao-li-xi#bao-li-xi-ep-kim")).toBe("/san-pham/tet/bao-li-xi#bao-li-xi-ep-kim");
    expect(localizePath("vi", "/blog?page=2")).toBe("/bai-viet?page=2");
    expect(localizePath("vi", "/products/blog/products")).toBe("/san-pham/blog/products");
    expect(localizePath("vi", "/products/tiep-thi/fast-print")).toBe("/san-pham/tiep-thi/fast-print"); // only the second segment is the word
    expect(localizePath("vi", "/products-and-more")).toBe("/products-and-more");
  });

  it("does not touch anything that is not an internal catalog or blog path", () => {
    for (const href of ["/", "/#cta", "/zalo-reply", "https://zalo.me/1", "mailto:a@b.vn", "tel:090", "//evil.example/products", "#top", ""]) expect(localizePath("vi", href), href).toBe(href);
  });
});

describe("toInternalPath", () => {
  it("reads any language's word back as the internal route name", () => {
    expect(toInternalPath("/san-pham/tiep-thi")).toBe("/products/tiep-thi");
    expect(toInternalPath("/san-pham/in-nhanh")).toBe("/products/fast-print");
    expect(toInternalPath("/bai-viet/bai-a#x")).toBe("/blog/bai-a#x");
    expect(toInternalPath("/products/x")).toBe("/products/x");
    expect(toInternalPath("/")).toBe("/");
  });

  it("undoes localizePath for every language", () => {
    const internal = ["/", "/products", "/products/fast-print", "/products/a/b/c", "/blog", "/blog/x", "/products/a?x=1#y"];
    for (const locale of ROUTE_LOCALES as readonly RouteLocale[]) for (const path of internal) expect(toInternalPath(localizePath(locale, path)), `${locale} ${path}`).toBe(path);
  });
});

describe("publicPath", () => {
  it("adds the prefix every language but Vietnamese has", () => {
    expect(publicPath("vi", "/products/a")).toBe("/san-pham/a");
    expect(publicPath("en", "/products/a")).toBe("/en/products/a");
    expect(publicPath("zh", "/blog")).toBe("/zh/blog");
    expect(publicPath("vi", "/")).toBe("/");
    expect(publicPath("ja", "/")).toBe("/ja");
  });
});

describe("parsePublicPath", () => {
  it("reads the language from the prefix (none: Vietnamese) and undoes the words", () => {
    expect(parsePublicPath("/")).toEqual({ locale: "vi", internalPath: "/" });
    expect(parsePublicPath("/en")).toEqual({ locale: "en", internalPath: "/" });
    expect(parsePublicPath("/san-pham/tiep-thi/to-roi")).toEqual({ locale: "vi", internalPath: "/products/tiep-thi/to-roi" });
    expect(parsePublicPath("/san-pham/in-nhanh")).toEqual({ locale: "vi", internalPath: "/products/fast-print" });
    expect(parsePublicPath("/ko/products/marketing/flyers/a4-flyer")).toEqual({ locale: "ko", internalPath: "/products/marketing/flyers/a4-flyer" });
    expect(parsePublicPath("/ja/blog/printing-guide")).toEqual({ locale: "ja", internalPath: "/blog/printing-guide" });
    expect(parsePublicPath("/bai-viet")).toEqual({ locale: "vi", internalPath: "/blog" });
  });

  it("keeps the query and the hash", () => {
    expect(parsePublicPath("/zh/products/a?x=1#top")).toEqual({ locale: "zh", internalPath: "/products/a?x=1#top" });
    expect(parsePublicPath("/en?x=1")).toEqual({ locale: "en", internalPath: "/?x=1" });
  });

  it("is the reverse of publicPath for every language", () => {
    for (const locale of ROUTE_LOCALES) {
      for (const internal of ["/", "/products", "/products/fast-print", "/products/a/b/c", "/blog", "/blog/x"]) {
        expect(parsePublicPath(publicPath(locale, internal))).toEqual({ locale, internalPath: internal });
      }
    }
  });
});

describe("decideRoute", () => {
  const redirect = (pathname: string) => ({ action: "redirect", pathname });
  const rewrite = (pathname: string) => ({ action: "rewrite", pathname });
  const pass = { action: "pass" };

  it("serves a Vietnamese address from the internal route", () => {
    expect(decideRoute("/san-pham")).toEqual(rewrite("/products"));
    expect(decideRoute("/san-pham/tiep-thi/to-roi")).toEqual(rewrite("/products/tiep-thi/to-roi"));
    expect(decideRoute("/san-pham/in-nhanh")).toEqual(rewrite("/products/fast-print"));
    expect(decideRoute("/bai-viet/bai-a")).toEqual(rewrite("/blog/bai-a"));
  });

  it("redirects every address the old site had to the Vietnamese one", () => {
    expect(decideRoute("/products")).toEqual(redirect("/san-pham"));
    expect(decideRoute("/products/marketing/flyers/a5")).toEqual(redirect("/san-pham/marketing/flyers/a5"));
    expect(decideRoute("/products/fast-print")).toEqual(redirect("/san-pham/in-nhanh"));
    expect(decideRoute("/blog")).toEqual(redirect("/bai-viet"));
    expect(decideRoute("/blog/chon-chat-lieu")).toEqual(redirect("/bai-viet/chon-chat-lieu"));
    expect(decideRoute("/san-pham/fast-print")).toEqual(redirect("/san-pham/in-nhanh"));
    expect(decideRoute("/products/in-nhanh")).toEqual(redirect("/san-pham/in-nhanh"));
  });

  it("drops an explicit /vi prefix in the same step", () => {
    expect(decideRoute("/vi/products/x")).toEqual(redirect("/san-pham/x"));
    expect(decideRoute("/vi/san-pham/x")).toEqual(redirect("/san-pham/x"));
    expect(decideRoute("/vi/blog")).toEqual(redirect("/bai-viet"));
  });

  it("leaves the other languages' English words alone, and corrects a Vietnamese word in them", () => {
    for (const locale of ["en", "zh", "ja", "ko"] as const) {
      expect(decideRoute(`/${locale}/products/a/b`)).toEqual(pass);
      expect(decideRoute(`/${locale}/products/fast-print`)).toEqual(pass);
      expect(decideRoute(`/${locale}/blog`)).toEqual(pass);
      expect(decideRoute(`/${locale}/san-pham/a`)).toEqual(redirect(`/${locale}/products/a`));
      expect(decideRoute(`/${locale}/bai-viet/x`)).toEqual(redirect(`/${locale}/blog/x`));
      expect(decideRoute(`/${locale}/products/in-nhanh`)).toEqual(redirect(`/${locale}/products/fast-print`));
    }
  });

  it("passes everything that is not a catalog or blog address", () => {
    for (const path of ["/", "/en", "/vi", "/zh/", "/not-found-page", "/en/unknown", "/products-and-more", "/blogger", "/en/blog-post", "/san-pham-moi", "/zalo-reply"]) expect(decideRoute(path), path).toEqual(pass);
  });

  it("ignores a trailing slash and collapses double slashes, never producing an address that starts with //", () => {
    expect(decideRoute("/products/")).toEqual(redirect("/san-pham"));
    expect(decideRoute("/san-pham/")).toEqual(rewrite("/products"));
    expect(decideRoute("//products//x")).toEqual(redirect("/san-pham/x"));
    expect(decideRoute("///evil.example/products")).toEqual(pass);
    expect(decideRoute("/en//products//x")).toEqual(pass);
    for (const path of ["//products", "/vi//products", "//en/products", "/products//", "/en/san-pham//a//b"]) {
      const decision = decideRoute(path);
      if (decision.action !== "pass") expect(decision.pathname.startsWith("//"), path).toBe(false);
    }
  });

  it("is idempotent: the address a redirect names is itself canonical", () => {
    const paths = ["/products", "/products/a/b", "/blog/x", "/vi/products/x", "/en/san-pham/a", "/ja/bai-viet", "/products/fast-print", "/zh/products/in-nhanh"];
    for (const path of paths) {
      const decision = decideRoute(path);
      if (decision.action === "redirect") expect(decideRoute(decision.pathname).action, path).not.toBe("redirect");
    }
  });
});
