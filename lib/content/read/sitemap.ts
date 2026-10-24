import { LOCALES } from "../schemas";
import { postPath, type Blog } from "./posts";
import { alternatesOf, samePath, type LanguagePaths } from "./seo";
import type { Catalog } from "./types";
import { alternatePaths, type SegmentTarget } from "./urls";

// Every page of the public site, once per language: its canonical address, the same page in the other languages, and when it last
// changed. Pure — `app/sitemap.ts` only turns the paths into absolute URLs, and the tests check each path against the resolvers.

export interface SitemapEntry {
  /** Public path (language prefix and fixed words included): the page's canonical address. */
  path: string;
  /** `hreflang` → public path, `x-default` included. */
  languages: Record<string, string>;
  /** ISO time of the newest publish behind the page; absent where no record decides it. */
  lastModified?: string;
}

/** The records whose newest publish dates a page. */
export type ModifiedType = "product" | "category" | "post";
export const MODIFIED_TYPES: readonly ModifiedType[] = ["product", "category", "post"];

/** `revisionKey(type, id)` → ISO time of that record's newest revision. */
export type Modified = Readonly<Record<string, string>>;
export const revisionKey = (type: string, id: string): string => `${type}:${id}`;

/** ISO times compare as text. */
const newest = (times: readonly (string | undefined)[]): string | undefined => times.filter((time): time is string => time !== undefined).sort().at(-1);

interface Page {
  paths: LanguagePaths;
  modified?: string;
}

/** The pages with no single record behind them (a gallery, a list of everything, a price table): no date rather than a guessed one. */
const FIXED_PAGES: readonly Page[] = ["/", "/products", "/blog", "/products/fast-print"].map((path) => ({ paths: samePath(path) }));

function catalogPages(catalog: Catalog, modified: Modified): Page[] {
  return catalog.categories.flatMap((category) => {
    const products = catalog.products.filter((product) => product.category === category.id);
    const changedAt = (product: { uid: string }): string | undefined => modified[revisionKey("product", product.uid)];
    const categoryPage: Page = { paths: alternatePaths(catalog, category, null, null), modified: newest([modified[revisionKey("category", category.id)], ...products.map(changedAt)]) };
    const productPages = products.flatMap((product) => {
      const targets: (SegmentTarget | null)[] = [null, ...product.shapes.map((shape) => ({ shape })), ...product.options.map((option) => ({ option }))];
      return targets.map((target): Page => ({ paths: alternatePaths(catalog, category, product, target), modified: changedAt(product) }));
    });
    return [categoryPage, ...productPages];
  });
}

const postPages = (blog: Blog, modified: Modified): Page[] =>
  blog.posts.map((post) => ({
    paths: Object.fromEntries(LOCALES.map((locale) => [locale, postPath(locale, post)])) as LanguagePaths,
    modified: modified[revisionKey("post", post.uid)],
  }));

export function sitemapOf(input: { catalog: Catalog; blog: Blog; modified: Modified }): SitemapEntry[] {
  const pages = [...FIXED_PAGES, ...catalogPages(input.catalog, input.modified), ...postPages(input.blog, input.modified)];
  return pages.flatMap(({ paths, modified }) =>
    LOCALES.map((locale): SitemapEntry => {
      const { canonical, languages } = alternatesOf(locale, paths);
      return { path: canonical, languages, ...(modified === undefined ? {} : { lastModified: modified }) };
    }),
  );
}
