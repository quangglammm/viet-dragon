import type { LocaleCode } from "../schemas";
import type { Catalog, MenuView } from "./types";
import type { FastPrint, ShowcaseItemView } from "./merchandising";
import type { Blog } from "./posts";
import type { Modified } from "./sitemap";
import type { Messages } from "./messages";
import {
  mockCatalog,
  mockMenus,
  mockBlog,
  mockFastPrint,
  mockShowcase,
  mockRevisionDates,
} from "@/lib/mock-data";

// ───────────── Public site reads (decoupled from PostgreSQL) ─────────────

/** The whole catalog: categories, published products, traits and materials. */
export async function getCatalog(): Promise<Catalog> {
  return mockCatalog;
}
export async function getPublishedCatalog(): Promise<Catalog> {
  return mockCatalog;
}

/** The mega-menus, by category id. */
export async function getMenus(): Promise<Record<string, MenuView>> {
  return mockMenus;
}
export async function getPublishedMenus(): Promise<Record<string, MenuView>> {
  return mockMenus;
}

/** The published posts and their categories. */
export async function getBlog(): Promise<Blog> {
  return mockBlog;
}
export async function getPublishedBlog(): Promise<Blog> {
  return mockBlog;
}

/** The Fast Print items and units (empty by customer request). */
export async function getFastPrint(): Promise<FastPrint> {
  return mockFastPrint;
}
export async function getPublishedFastPrint(): Promise<FastPrint> {
  return mockFastPrint;
}

/** The pictures of the gallery on /products. */
export async function getShowcase(): Promise<ShowcaseItemView[]> {
  return mockShowcase;
}
export async function getPublishedShowcase(): Promise<ShowcaseItemView[]> {
  return mockShowcase;
}

/** The dates behind the sitemap. */
export async function getRevisionDates(): Promise<Modified> {
  return mockRevisionDates;
}

/** The UI copy of a language from static messages files. */
export async function getMessages(locale: LocaleCode): Promise<Messages> {
  const defaults = (await import(`../../../messages/${locale}.json`)).default as Messages;
  return defaults;
}

// ───────────── Legacy helper aliases for backwards compatibility ─────────────

export async function loadCatalogInput(): Promise<Record<string, unknown>> {
  return {
    categories: mockCatalog.categories,
    products: mockCatalog.products,
    materials: Object.values(mockCatalog.materials),
    traits: Object.values(mockCatalog.traits),
    specItems: [],
    menus: [],
  };
}
export async function loadCatalog(): Promise<Catalog> {
  return mockCatalog;
}
export async function loadMenus(): Promise<Record<string, MenuView>> {
  return mockMenus;
}
export async function loadBlog(): Promise<Blog> {
  return mockBlog;
}
export async function loadFastPrint(): Promise<FastPrint> {
  return mockFastPrint;
}
export async function loadShowcase(): Promise<ShowcaseItemView[]> {
  return mockShowcase;
}
export async function loadRevisionDates(): Promise<Modified> {
  return mockRevisionDates;
}
export async function loadMessages(_x?: unknown, locale?: LocaleCode): Promise<Messages> {
  return getMessages(locale ?? "vi");
}
export async function loadPublishedMessages(): Promise<Record<string, unknown>> {
  return {};
}
