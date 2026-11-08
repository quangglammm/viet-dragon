import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { parsePublicPath, publicPath } from "@/lib/routes";
import { editAndPublish } from "@/tests/helpers/content-lifecycle";
import { createSeededDatabase, type SeededDatabase } from "@/tests/helpers/seeded-db";
import { LOCALES } from "../schemas";
import { loadBlog, loadCatalog, loadRevisionDates } from "./load";
import { postPath, resolvePostUrl, type Blog } from "./posts";
import { sitemapOf, type SitemapEntry } from "./sitemap";
import type { Catalog } from "./types";
import { productPath, resolveUrl } from "./urls";

// The sitemap built from the seeded site: every address it lists is a page that answers on its own (no redirect), in the language it
// names, and the dates are the revisions' own.

let seeded: SeededDatabase;

beforeAll(async () => {
  seeded = await createSeededDatabase("read-sitemap");
}, 180_000);
afterAll(async () => {
  await seeded.close();
});

async function build(): Promise<{ catalog: Catalog; blog: Blog; entries: SitemapEntry[] }> {
  const [catalog, blog, modified] = await Promise.all([loadCatalog(seeded.db), loadBlog(seeded.db), loadRevisionDates(seeded.db)]);
  return { catalog, blog, entries: sitemapOf({ catalog, blog, modified }) };
}

const FIXED = new Set(["/", "/products", "/blog", "/products/fast-print"]);

/** Whether the path is a page of the site, exactly at its canonical address. */
function answers(catalog: Catalog, blog: Blog, path: string): boolean {
  const { locale, internalPath: internal } = parsePublicPath(path);
  if (FIXED.has(internal)) return true;
  const [, first, ...parts] = internal.split("/");
  if (first === "blog") return parts.length === 1 && resolvePostUrl(blog, locale, parts[0]).status === "ok";
  if (first !== "products" || parts.length < 1 || parts.length > 3) return false;
  return resolveUrl(catalog, locale, { category: parts[0], product: parts[1], segment: parts[2] }).status === "ok";
}

describe("the sitemap of the seeded site", () => {
  it("lists every page in five languages, each at its canonical address, once", async () => {
    const { catalog, blog, entries } = await build();
    const pages = FIXED.size + catalog.categories.length + catalog.products.length + catalog.products.reduce((sum, product) => sum + product.shapes.length + product.options.length, 0) + blog.posts.length;
    expect(catalog.products).toHaveLength(25);
    expect(entries).toHaveLength(pages * LOCALES.length);
    expect(new Set(entries.map((entry) => entry.path)).size).toBe(entries.length);
    const notCanonical = entries.filter((entry) => !answers(catalog, blog, entry.path)).map((entry) => entry.path);
    expect(notCanonical).toEqual([]);
  });

  it("points every alternate at the same page in the other language, canonical too", async () => {
    const { catalog, blog, entries } = await build();
    const bad: string[] = [];
    for (const entry of entries) {
      for (const [language, path] of Object.entries(entry.languages)) {
        const expected = language === "x-default" ? "vi" : language;
        if (parsePublicPath(path).locale !== expected || !answers(catalog, blog, path)) bad.push(`${entry.path} → ${language}: ${path}`);
      }
      if (Object.keys(entry.languages).length !== LOCALES.length + 1) bad.push(`${entry.path} has ${Object.keys(entry.languages).length} alternates`);
    }
    expect(bad).toEqual([]);
  });

  it("dates each catalog page and post by the newest revision in the database, and leaves the four fixed pages undated", async () => {
    const { entries } = await build();
    const rows = (await seeded.scratch.pool.query(`select entity_type, coalesce(entity_uid::text, entity_key) as id, max(created_at) as at from content_revision where entity_type in ('product','category','post') group by 1, 2`)).rows as { entity_type: string; id: string; at: Date }[];
    expect(rows.length).toBeGreaterThan(30);
    const undated = entries.filter((entry) => entry.lastModified === undefined).map((entry) => parsePublicPath(entry.path).internalPath);
    expect(new Set(undated)).toEqual(FIXED);
    expect(undated).toHaveLength(FIXED.size * LOCALES.length);
    const newest = rows.map((row) => row.at.toISOString()).sort().at(-1);
    expect(entries.map((entry) => entry.lastModified).filter(Boolean).sort().at(-1)).toBe(newest);
  });

  it("moves a page's date when its record is published, and only that page's", async () => {
    const before = await build();
    const [first, second] = before.catalog.products;
    await editAndPublish(seeded.db, { type: "product", id: first.uid }, (document) => {
      document.i18n.en!.description = "Edited for the sitemap test.";
    });
    const after = await build();
    const dateOf = (list: SitemapEntry[], path: string) => list.find((entry) => entry.path === path)?.lastModified;
    const firstPath = `/en/products/${before.catalog.categories.find((category) => category.id === first.category)!.slugs.en.slug}/${first.slugs.en.slug}`;
    const secondPath = `/en/products/${before.catalog.categories.find((category) => category.id === second.category)!.slugs.en.slug}/${second.slugs.en.slug}`;
    expect(dateOf(after.entries, firstPath)! > dateOf(before.entries, firstPath)!).toBe(true);
    expect(dateOf(after.entries, secondPath)).toBe(dateOf(before.entries, secondPath));
  });

  it("lists a renamed address and not the old one — which still redirects", async () => {
    const before = await build();
    const product = before.catalog.products[2];
    const oldVi = product.slugs.vi.slug;
    await editAndPublish(seeded.db, { type: "product", id: product.uid }, (document) => {
      document.slugs.vi.slug = "ten-moi-cho-sitemap";
    });
    const after = await build();
    const category = after.catalog.categories.find((candidate) => candidate.id === product.category)!;
    const was = `/san-pham/${category.slugs.vi.slug}/${oldVi}`;
    const now = `/san-pham/${category.slugs.vi.slug}/ten-moi-cho-sitemap`;
    expect(after.entries.map((entry) => entry.path)).toContain(now);
    expect(after.entries.map((entry) => entry.path)).not.toContain(was);
    expect(resolveUrl(after.catalog, "vi", { category: category.slugs.vi.slug, product: oldVi })).toEqual({ status: "redirect", to: now.replace("/san-pham", "/products") });
    expect(after.entries.filter((entry) => !answers(after.catalog, after.blog, entry.path))).toEqual([]);
  });

  it("drops an archived post and an archived product, and everything else still answers", async () => {
    const before = await build();
    const post = before.blog.posts[0];
    const product = before.catalog.products[3];
    await editAndPublish(seeded.db, { type: "post", id: post.uid }, (document) => {
      document.status = "archived";
    });
    await editAndPublish(seeded.db, { type: "product", id: product.uid }, (document) => {
      document.status = "archived";
    });
    const after = await build();
    expect(after.entries).toHaveLength(before.entries.length - LOCALES.length * (1 + 1 + product.shapes.length + product.options.length));
    // the pages of the two records, in every language: the address itself and everything under it
    const gone = LOCALES.flatMap((locale) => [publicPath(locale, productPath(before.catalog, locale, product)), publicPath(locale, postPath(locale, post))]);
    expect(after.entries.filter((entry) => gone.some((prefix) => entry.path === prefix || entry.path.startsWith(`${prefix}/`)))).toEqual([]);
    expect(before.entries.filter((entry) => gone.some((prefix) => entry.path === prefix || entry.path.startsWith(`${prefix}/`)))).toHaveLength(LOCALES.length * (2 + product.shapes.length + product.options.length));
    expect(after.entries.filter((entry) => !answers(after.catalog, after.blog, entry.path))).toEqual([]);
  });
});
