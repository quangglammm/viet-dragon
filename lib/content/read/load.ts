import type { DbExecutor } from "@/lib/db/types";
import { getDb } from "@/lib/db";
import type { DraftEntityType } from "@/lib/db/content/drafts";
import { readTags } from "../cache-tags";
import { composeEntity, listEntities, type Composed } from "../compose";
import type { LocaleCode, MenuDocument } from "../schemas";
import { buildCatalog, type CatalogInput } from "./catalog";
import { cachedRead } from "./cache";
import { buildMenus } from "./menus";
import type { Catalog, MenuView } from "./types";

// Where the public site's reads meet the database. `load*` take any executor (the tests give them a seeded scratch database); `get*`
// are the cached ones the pages call. Everything published is read through `composeEntity`, the same read side the publish and
// restore services use, so what a visitor sees is exactly what an editor published.

/** The documents of the entries that exist (a row deleted between the listing and the read is simply missing). */
const documents = <D>(entries: readonly (Composed<D> | null)[]): D[] => entries.flatMap((entry) => (entry ? [entry.document] : []));

export async function loadCatalogInput(x: DbExecutor): Promise<CatalogInput & { menus: MenuDocument[] }> {
  const refs = await listEntities(x);
  const idsOf = (type: DraftEntityType) => refs.filter((ref) => ref.type === type).map((ref) => ref.id);
  const [categories, products, materials, traits, specItems, menus] = await Promise.all([
    Promise.all(idsOf("category").map((id) => composeEntity(x, "category", id))),
    Promise.all(idsOf("product").map((id) => composeEntity(x, "product", id))),
    Promise.all(idsOf("material").map((id) => composeEntity(x, "material", id))),
    Promise.all(idsOf("trait").map((id) => composeEntity(x, "trait", id))),
    Promise.all(idsOf("spec_item").map((id) => composeEntity(x, "spec_item", id))),
    Promise.all(idsOf("menu").map((id) => composeEntity(x, "menu", id))),
  ]);
  return { categories: documents(categories), products: documents(products), materials: documents(materials), traits: documents(traits), specItems: documents(specItems), menus: documents(menus) };
}

export async function loadCatalog(x: DbExecutor): Promise<Catalog> {
  const { categories, products, materials, traits, specItems } = await loadCatalogInput(x);
  return buildCatalog({ categories, products, materials, traits, specItems });
}

export async function loadMenus(x: DbExecutor): Promise<Record<string, MenuView>> {
  const { menus, ...input } = await loadCatalogInput(x);
  return buildMenus(buildCatalog(input), menus);
}

/** Namespace → that language's published texts. A namespace with no row for the language is absent (the file defaults stand). */
export async function loadPublishedMessages(x: DbExecutor, locale: LocaleCode): Promise<Record<string, unknown>> {
  const refs = (await listEntities(x)).filter((ref) => ref.type === "site_message");
  const messages = documents(await Promise.all(refs.map((ref) => composeEntity(x, "site_message", ref.id))));
  return Object.fromEntries(messages.flatMap((message) => (message.data[locale] === undefined ? [] : [[message.key, message.data[locale]] as const])));
}

// ───────────── the cached reads the pages call ─────────────

type Read<R> = () => Promise<R>;
const once = <R>(make: () => Read<R>): Read<R> => {
  let read: Read<R> | undefined;
  return () => (read ??= make())();
};

/** The whole catalog: categories, published products, traits and materials. One entry (it stays well under the data cache's size limit — a test watches it). */
export const getCatalog = once(() =>
  cachedRead("catalog", readTags({ type: "product" }, { type: "category" }, { type: "material" }, { type: "trait" }, { type: "spec_item" }), () => loadCatalog(getDb())),
);

/** The mega-menus, by category id. Rebuilt when a menu or any product changes (a product's name and image are the menu's defaults). */
export const getMenus = once(() => cachedRead("menus", readTags({ type: "menu" }, { type: "product" }, { type: "category" }), () => loadMenus(getDb())));

const messageReads = new Map<LocaleCode, Read<Record<string, unknown>>>();

export function getPublishedMessages(locale: LocaleCode): Promise<Record<string, unknown>> {
  let read = messageReads.get(locale);
  if (!read) {
    read = cachedRead(`messages:${locale}`, readTags({ type: "site_message" }), () => loadPublishedMessages(getDb(), locale));
    messageReads.set(locale, read);
  }
  return read();
}
