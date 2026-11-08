import { inArray, max } from "drizzle-orm";
import type { DbExecutor } from "@/lib/db/types";
import { getDb } from "@/lib/db";
import { contentRevision } from "@/lib/db/schema";
import type { DraftEntityType } from "@/lib/db/content/drafts";
import { readTags } from "../cache-tags";
import { composeEntity, listEntities, type Composed, type EntityRef } from "../compose";
import type { DocumentFor, LocaleCode, MenuDocument } from "../schemas";
import { buildCatalog, type CatalogInput } from "./catalog";
import { cachedRead } from "./cache";
import { buildMenus } from "./menus";
import { buildFastPrint, buildShowcase, type FastPrint, type ShowcaseItemView } from "./merchandising";
import { buildBlog, type Blog } from "./posts";
import { mergeMessages, type Messages } from "./messages";
import type { PreviewOverlay } from "./preview";
import { previewOverlay } from "./preview-session";
import { MODIFIED_TYPES, revisionKey, type Modified } from "./sitemap";
import type { Catalog, MenuView } from "./types";

// Where the public site's reads meet the database. `load*` take any executor (the tests give them a seeded scratch database) and,
// optionally, a preview overlay of drafts; `get*` are the cached ones the pages call. Everything published is read through
// `composeEntity`, the same read side the publish and restore services use, so what a visitor sees is exactly what an editor published.

/**
 * The documents of one entity type: the live ones in listing order (a row deleted between the listing and the read is simply missing),
 * a valid draft standing in for the entity it is a draft of, then the drafts of entities that are not published yet.
 */
async function documentsOf<T extends DraftEntityType>(x: DbExecutor, refs: readonly EntityRef[], type: T, overlay?: PreviewOverlay): Promise<DocumentFor<T>[]> {
  const drafts: ReadonlyMap<string, DocumentFor<T>> = overlay?.documents[type] ?? new Map();
  const liveIds = refs.filter((ref) => ref.type === type).map((ref) => ref.id);
  // `composeEntity` is typed per literal type name; with a generic one TypeScript cannot pair the composer with its document.
  const documentOf = async (id: string): Promise<DocumentFor<T> | undefined> =>
    drafts.get(id) ?? ((await composeEntity(x, type, id)) as unknown as Composed<DocumentFor<T>> | null)?.document;
  // `Awaited<DocumentFor<T>>` does not simplify for a generic T (a document could, in theory, be a thenable); it is the document itself.
  const live = (await Promise.all(liveIds.map(documentOf))) as (DocumentFor<T> | undefined)[];
  const fresh = [...drafts].filter(([id]) => !liveIds.includes(id)).map(([, document]) => document);
  return [...live.filter((document): document is DocumentFor<T> => document !== undefined), ...fresh];
}

export async function loadCatalogInput(x: DbExecutor, overlay?: PreviewOverlay): Promise<CatalogInput & { menus: MenuDocument[] }> {
  const refs = await listEntities(x);
  const of = <T extends DraftEntityType>(type: T) => documentsOf(x, refs, type, overlay);
  const [categories, products, materials, traits, specItems, menus] = await Promise.all([of("category"), of("product"), of("material"), of("trait"), of("spec_item"), of("menu")]);
  return { categories, products, materials, traits, specItems, menus };
}

export async function loadCatalog(x: DbExecutor, overlay?: PreviewOverlay): Promise<Catalog> {
  const { categories, products, materials, traits, specItems } = await loadCatalogInput(x, overlay);
  return buildCatalog({ categories, products, materials, traits, specItems });
}

export async function loadMenus(x: DbExecutor, overlay?: PreviewOverlay): Promise<Record<string, MenuView>> {
  const { menus, ...input } = await loadCatalogInput(x, overlay);
  return buildMenus(buildCatalog(input), menus);
}

export async function loadBlog(x: DbExecutor, overlay?: PreviewOverlay): Promise<Blog> {
  const refs = await listEntities(x);
  const [posts, categories] = await Promise.all([documentsOf(x, refs, "post", overlay), documentsOf(x, refs, "post_category", overlay)]);
  return buildBlog({ posts, categories });
}

export async function loadFastPrint(x: DbExecutor, overlay?: PreviewOverlay): Promise<FastPrint> {
  const refs = await listEntities(x);
  const [items, units] = await Promise.all([documentsOf(x, refs, "fast_print_item", overlay), documentsOf(x, refs, "unit", overlay)]);
  return buildFastPrint({ items, units });
}

export async function loadShowcase(x: DbExecutor, overlay?: PreviewOverlay): Promise<ShowcaseItemView[]> {
  return buildShowcase(await documentsOf(x, await listEntities(x), "showcase_item", overlay));
}

/** Namespace → that language's published texts. A namespace with no row for the language is absent (the file defaults stand). */
export async function loadPublishedMessages(x: DbExecutor, locale: LocaleCode, overlay?: PreviewOverlay): Promise<Record<string, unknown>> {
  const messages = await documentsOf(x, await listEntities(x), "site_message", overlay);
  return Object.fromEntries(messages.flatMap((message) => (message.data[locale] === undefined ? [] : [[message.key, message.data[locale]] as const])));
}

/** When each product, category and post last changed (its newest revision), for the sitemap's `lastmod`. */
export async function loadRevisionDates(x: DbExecutor): Promise<Modified> {
  const rows = await x
    .select({ type: contentRevision.entityType, uid: contentRevision.entityUid, key: contentRevision.entityKey, at: max(contentRevision.createdAt) })
    .from(contentRevision)
    .where(inArray(contentRevision.entityType, [...MODIFIED_TYPES]))
    .groupBy(contentRevision.entityType, contentRevision.entityUid, contentRevision.entityKey);
  return Object.fromEntries(rows.flatMap((row) => (row.at === null ? [] : [[revisionKey(row.type, row.uid ?? row.key ?? ""), row.at.toISOString()] as const])));
}

// ───────────── the reads the pages call ─────────────

type Read<R> = () => Promise<R>;
const once = <R>(make: () => Read<R>): Read<R> => {
  let read: Read<R> | undefined;
  return () => (read ??= make())();
};

/**
 * What a page reads: for a signed-in editor in Draft Mode the published site with their drafts laid over it, read straight from the
 * database — never through `cachedRead`, so a preview cannot be written into the data cache — and for everyone else the cached
 * published read. The decision is made here, outside the cache callback, because `draftMode()` cannot be called inside one.
 */
const previewable =
  <R>(preview: (overlay: PreviewOverlay) => Promise<R>, published: Read<R>): Read<R> =>
  async () => {
    const overlay = await previewOverlay();
    return overlay ? preview(overlay) : published();
  };

/** The whole catalog: categories, published products, traits and materials. One entry (it stays well under the data cache's size limit — a test watches it). */
export const getPublishedCatalog = once(() =>
  cachedRead("catalog", readTags({ type: "product" }, { type: "category" }, { type: "material" }, { type: "trait" }, { type: "spec_item" }), () => loadCatalog(getDb())),
);
export const getCatalog = previewable((overlay) => loadCatalog(getDb(), overlay), getPublishedCatalog);

/** The mega-menus, by category id. Rebuilt when a menu or any product changes (a product's name and image are the menu's defaults). */
const getPublishedMenus = once(() => cachedRead("menus", readTags({ type: "menu" }, { type: "product" }, { type: "category" }), () => loadMenus(getDb())));
export const getMenus = previewable((overlay) => loadMenus(getDb(), overlay), getPublishedMenus);

/** The published posts and their categories. */
export const getPublishedBlog = once(() => cachedRead("blog", readTags({ type: "post" }, { type: "post_category" }), () => loadBlog(getDb())));
export const getBlog = previewable((overlay) => loadBlog(getDb(), overlay), getPublishedBlog);

/** The Fast Print items and the units their prices are quoted in. */
const getPublishedFastPrint = once(() => cachedRead("fast-print", readTags({ type: "fast_print_item" }, { type: "unit" }), () => loadFastPrint(getDb())));
export const getFastPrint = previewable((overlay) => loadFastPrint(getDb(), overlay), getPublishedFastPrint);

/** The pictures of the gallery on /products. */
const getPublishedShowcase = once(() => cachedRead("showcase", readTags({ type: "showcase_item" }), () => loadShowcase(getDb())));
export const getShowcase = previewable((overlay) => loadShowcase(getDb(), overlay), getPublishedShowcase);

/** The dates behind the sitemap: they move when a product, a category or a post is published. */
export const getRevisionDates = once(() => cachedRead("revision-dates", readTags({ type: "product" }, { type: "category" }, { type: "post" }), () => loadRevisionDates(getDb())));

const messageReads = new Map<LocaleCode, Read<Messages>>();

/** The UI copy of a language: `messages/<language>.json` with the published texts of the database laid over it (see `messages.ts`). */
export async function loadMessages(x: DbExecutor, locale: LocaleCode, overlay?: PreviewOverlay): Promise<Messages> {
  const defaults = (await import(`../../../messages/${locale}.json`)).default as Messages;
  return mergeMessages(defaults, await loadPublishedMessages(x, locale, overlay));
}

/** What `i18n/request.ts` hands next-intl: the merged tree is the cache entry, rebuilt when a UI-copy publish revalidates `site_message`. */
export function getMessages(locale: LocaleCode): Promise<Messages> {
  let published = messageReads.get(locale);
  if (!published) {
    published = cachedRead(`messages:${locale}`, readTags({ type: "site_message" }), () => loadMessages(getDb(), locale));
    messageReads.set(locale, published);
  }
  return previewable((overlay) => loadMessages(getDb(), locale, overlay), published)();
}
