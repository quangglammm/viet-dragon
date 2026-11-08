import type { EntityRef } from "../compose";
import type { LocaleCode } from "../schemas";
import { postPath, type Blog } from "./posts";
import type { Catalog } from "./types";
import { categoryById, categoryPath, productByUid, productPath } from "./urls";

// Where the "Xem trước" button of an editor lands: the page that shows the draft being edited, as an internal path (the caller writes
// it in the language's own words with `publicPath`). Computed on the catalog and blog WITH the drafts laid over them, so a product
// that was never published lands on its draft URL. Pure.

const PRODUCTS = "/products";
const BLOG = "/blog";
const FAST_PRINT = "/products/fast-print";

/**
 * An entity with a page of its own lands there; one that only changes words or lists on other pages lands on the page that draws it
 * (the home page for the vocabulary — material, trait, spec item — and for UI copy). An archived product or post is not on the site,
 * so its preview falls back to the index it would be listed in.
 */
export function previewPathOf(ref: EntityRef, locale: LocaleCode, { catalog, blog }: { catalog: Catalog; blog: Blog }): string {
  switch (ref.type) {
    case "product": {
      const product = productByUid(catalog, ref.id);
      return product ? productPath(catalog, locale, product) : PRODUCTS;
    }
    case "post": {
      const post = blog.posts.find((candidate) => candidate.uid === ref.id);
      return post ? postPath(locale, post) : BLOG;
    }
    case "category":
    case "menu": {
      const category = categoryById(catalog, ref.id);
      return category ? categoryPath(locale, category) : PRODUCTS;
    }
    case "fast_print_item":
    case "unit":
      return FAST_PRINT;
    case "showcase_item":
      return PRODUCTS;
    case "post_category":
      return BLOG;
    case "material":
    case "trait":
    case "spec_item":
    case "site_message":
      return "/";
  }
}
