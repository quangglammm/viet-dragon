import { and, eq, max, sql } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import type { DraftEntityType } from "@/lib/db/content/drafts";
import type { DbExecutor } from "@/lib/db/types";
import type { EntityRef } from "./compose";

// The rows of an admin list: every live entity of a type, plus the ones that exist only as a draft, each with the state of
// its open draft. The label is the Vietnamese name (the admin is Vietnamese-only).

export interface DraftInfo {
  draftVersion: number;
  /** null = a brand-new entity that is not published yet. */
  baseVersion: number | null;
  updatedAt: Date;
  updatedBy: string | null;
}

export interface Summary {
  ref: EntityRef;
  label: string | null;
  status: "published" | "archived" | null;
  /** null = not published yet. */
  version: number | null;
  updatedAt: Date | null;
  /** What the row is filed under in a list: a product's category, a post's category. */
  group: string | null;
  draft: DraftInfo | null;
}

interface LiveRow {
  id: string;
  label: string | null;
  status: "published" | "archived" | null;
  version: number;
  updatedAt: Date;
  group?: string | null;
}

const VI = "vi";

async function products(x: DbExecutor): Promise<LiveRow[]> {
  return x
    .select({ id: sql<string>`${schema.product.uid}::text`, label: schema.productI18n.title, status: schema.product.status, version: schema.product.version, updatedAt: schema.product.updatedAt, group: schema.product.categoryId })
    .from(schema.product)
    .leftJoin(schema.productI18n, and(eq(schema.productI18n.productId, schema.product.id), eq(schema.productI18n.locale, VI)));
}

async function posts(x: DbExecutor): Promise<LiveRow[]> {
  return x
    .select({ id: sql<string>`${schema.post.uid}::text`, label: schema.postI18n.title, status: schema.post.status, version: schema.post.version, updatedAt: schema.post.updatedAt, group: schema.post.categoryKey })
    .from(schema.post)
    .leftJoin(schema.postI18n, and(eq(schema.postI18n.postId, schema.post.id), eq(schema.postI18n.locale, VI)));
}

async function categories(x: DbExecutor, versionOf: "version" | "menuVersion"): Promise<LiveRow[]> {
  const version = versionOf === "version" ? schema.category.version : schema.category.menuVersion;
  return x
    .select({ id: schema.category.id, label: schema.categoryI18n.name, status: sql<null>`null`, version, updatedAt: schema.category.updatedAt })
    .from(schema.category)
    .leftJoin(schema.categoryI18n, and(eq(schema.categoryI18n.categoryId, schema.category.id), eq(schema.categoryI18n.locale, VI)));
}

async function fastPrintItems(x: DbExecutor): Promise<LiveRow[]> {
  return x
    .select({ id: sql<string>`${schema.fastPrintItem.uid}::text`, label: schema.fastPrintItemI18n.name, status: schema.fastPrintItem.status, version: schema.fastPrintItem.version, updatedAt: schema.fastPrintItem.updatedAt })
    .from(schema.fastPrintItem)
    .leftJoin(schema.fastPrintItemI18n, and(eq(schema.fastPrintItemI18n.itemId, schema.fastPrintItem.id), eq(schema.fastPrintItemI18n.locale, VI)));
}

async function showcaseItems(x: DbExecutor): Promise<LiveRow[]> {
  return x
    .select({ id: sql<string>`${schema.showcaseItem.uid}::text`, label: schema.showcaseItemI18n.label, status: sql<null>`null`, version: schema.showcaseItem.version, updatedAt: schema.showcaseItem.updatedAt })
    .from(schema.showcaseItem)
    .leftJoin(schema.showcaseItemI18n, and(eq(schema.showcaseItemI18n.itemId, schema.showcaseItem.id), eq(schema.showcaseItemI18n.locale, VI)));
}

async function materials(x: DbExecutor): Promise<LiveRow[]> {
  return x
    .select({ id: schema.material.slug, label: schema.materialI18n.name, status: sql<null>`null`, version: schema.material.version, updatedAt: schema.material.updatedAt })
    .from(schema.material)
    .leftJoin(schema.materialI18n, and(eq(schema.materialI18n.materialId, schema.material.id), eq(schema.materialI18n.locale, VI)));
}

async function traits(x: DbExecutor): Promise<LiveRow[]> {
  return x
    .select({ id: schema.trait.key, label: schema.traitI18n.label, status: sql<null>`null`, version: schema.trait.version, updatedAt: schema.trait.updatedAt })
    .from(schema.trait)
    .leftJoin(schema.traitI18n, and(eq(schema.traitI18n.traitKey, schema.trait.key), eq(schema.traitI18n.locale, VI)));
}

async function units(x: DbExecutor): Promise<LiveRow[]> {
  return x
    .select({ id: schema.unit.key, label: schema.unitI18n.label, status: sql<null>`null`, version: schema.unit.version, updatedAt: schema.unit.updatedAt })
    .from(schema.unit)
    .leftJoin(schema.unitI18n, and(eq(schema.unitI18n.unitKey, schema.unit.key), eq(schema.unitI18n.locale, VI)));
}

async function specItems(x: DbExecutor): Promise<LiveRow[]> {
  return x
    .select({ id: sql<string>`${schema.specItem.kind} || '/' || ${schema.specItem.key}`, label: schema.specItemI18n.label, status: sql<null>`null`, version: schema.specItem.version, updatedAt: schema.specItem.updatedAt })
    .from(schema.specItem)
    .leftJoin(schema.specItemI18n, and(eq(schema.specItemI18n.specItemId, schema.specItem.id), eq(schema.specItemI18n.locale, VI)));
}

async function postCategories(x: DbExecutor): Promise<LiveRow[]> {
  return x
    .select({ id: schema.postCategory.key, label: schema.postCategoryI18n.label, status: sql<null>`null`, version: schema.postCategory.version, updatedAt: schema.postCategory.updatedAt })
    .from(schema.postCategory)
    .leftJoin(schema.postCategoryI18n, and(eq(schema.postCategoryI18n.categoryKey, schema.postCategory.key), eq(schema.postCategoryI18n.locale, VI)));
}

async function siteMessages(x: DbExecutor): Promise<LiveRow[]> {
  const rows = await x
    .select({ id: schema.siteMessage.namespace, version: max(schema.siteMessage.version), updatedAt: max(schema.siteMessage.updatedAt) })
    .from(schema.siteMessage)
    .groupBy(schema.siteMessage.namespace);
  return rows.map((row) => ({ id: row.id, label: row.id, status: null, version: row.version as number, updatedAt: row.updatedAt as Date }));
}

const LIVE: Record<DraftEntityType, (x: DbExecutor) => Promise<LiveRow[]>> = {
  product: products,
  post: posts,
  category: (x) => categories(x, "version"),
  menu: (x) => categories(x, "menuVersion"),
  material: materials,
  trait: traits,
  unit: units,
  spec_item: specItems,
  fast_print_item: fastPrintItems,
  showcase_item: showcaseItems,
  post_category: postCategories,
  site_message: siteMessages,
};

/** The Vietnamese name a draft's document gives itself, for a new entity that has no live row to read it from. */
export function labelOfSnapshot(snapshot: unknown): string | null {
  const document = snapshot as { i18n?: Record<string, Record<string, unknown> | string | undefined>; key?: unknown } | null;
  const vi = document?.i18n?.[VI];
  const named = typeof vi === "object" && vi !== null ? (vi.title ?? vi.name ?? vi.label) : undefined;
  if (typeof named === "string") return named;
  return typeof document?.key === "string" ? document.key : null;
}

function groupOfSnapshot(type: DraftEntityType, snapshot: unknown): string | null {
  const category = type === "product" || type === "post" ? (snapshot as { category?: unknown } | null)?.category : undefined;
  return typeof category === "string" ? category : null;
}

export async function listSummaries(x: DbExecutor, type: DraftEntityType): Promise<Summary[]> {
  const live = await LIVE[type](x);
  const drafts = await x.select().from(schema.contentDraft).where(eq(schema.contentDraft.entityType, type));
  const draftOf = new Map(drafts.map((d) => [d.entityUid ?? (d.entityKey as string), d]));
  const info = (id: string): DraftInfo | null => {
    const d = draftOf.get(id);
    return d ? { draftVersion: d.draftVersion, baseVersion: d.baseVersion, updatedAt: d.updatedAt, updatedBy: d.updatedBy } : null;
  };

  const summaries: Summary[] = live.map((row) => ({ ref: { type, id: row.id }, label: row.label, status: row.status, version: row.version, updatedAt: row.updatedAt, group: row.group ?? null, draft: info(row.id) }));
  const liveIds = new Set(live.map((row) => row.id));
  for (const [id, d] of draftOf) {
    if (!liveIds.has(id)) summaries.push({ ref: { type, id }, label: labelOfSnapshot(d.snapshot), status: null, version: null, updatedAt: null, group: groupOfSnapshot(type, d.snapshot), draft: info(id) });
  }
  return summaries;
}
