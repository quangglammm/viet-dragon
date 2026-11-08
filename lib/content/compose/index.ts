import { asc } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import type { DraftEntityType } from "@/lib/db/content/drafts";
import type { DbExecutor } from "@/lib/db/types";
import { composeCategory, composeFastPrintItem, composeMaterial, composePostCategory, composeShowcaseItem, composeSpecItem, composeTrait, composeUnit } from "./library";
import { composeMenu } from "./menu";
import { composePost } from "./post";
import { composeProduct } from "./product";
import type { Composed } from "./shared";
import { composeSiteMessage } from "./site-message";

export type { Composed } from "./shared";

type Composer = (x: DbExecutor, id: string) => Promise<Composed<unknown> | null>;

/** One composer per entity type that can have a draft. The id is the entity's uid, or its immutable key. */
const COMPOSERS = {
  product: composeProduct,
  post: composePost,
  category: composeCategory,
  material: composeMaterial,
  trait: composeTrait,
  unit: composeUnit,
  spec_item: composeSpecItem,
  fast_print_item: composeFastPrintItem,
  showcase_item: composeShowcaseItem,
  post_category: composePostCategory,
  site_message: composeSiteMessage,
  menu: composeMenu,
} as const satisfies Record<DraftEntityType, Composer>;

/** The live rows of an entity as its document, or null when there is none. */
export function composeEntity<T extends DraftEntityType>(x: DbExecutor, type: T, id: string): ReturnType<(typeof COMPOSERS)[T]> {
  // Indexing the map by a generic key leaves TypeScript with the union of all composers; the return type restores the pairing.
  return COMPOSERS[type](x, id) as ReturnType<(typeof COMPOSERS)[T]>;
}

export interface EntityRef {
  type: DraftEntityType;
  /** uid for product / post / Fast Print / showcase, the immutable key for everything else. */
  id: string;
}

/** Every entity that has live rows, in a stable order: what the seed writes revision 1 for. */
export async function listEntities(x: DbExecutor): Promise<EntityRef[]> {
  const refs: EntityRef[] = [];
  const add = (type: DraftEntityType, ids: readonly string[]) => refs.push(...ids.map((id) => ({ type, id })));
  add("category", (await x.select({ id: schema.category.id }).from(schema.category).orderBy(asc(schema.category.position))).map((r) => r.id));
  add("menu", (await x.select({ id: schema.category.id }).from(schema.category).orderBy(asc(schema.category.position))).map((r) => r.id));
  add("trait", (await x.select({ id: schema.trait.key }).from(schema.trait).orderBy(asc(schema.trait.key))).map((r) => r.id));
  add("unit", (await x.select({ id: schema.unit.key }).from(schema.unit).orderBy(asc(schema.unit.key))).map((r) => r.id));
  add("material", (await x.select({ id: schema.material.slug }).from(schema.material).orderBy(asc(schema.material.slug))).map((r) => r.id));
  add("spec_item", (await x.select({ kind: schema.specItem.kind, key: schema.specItem.key }).from(schema.specItem).orderBy(asc(schema.specItem.kind), asc(schema.specItem.key))).map((r) => `${r.kind}/${r.key}`));
  add("product", (await x.select({ id: schema.product.uid }).from(schema.product).orderBy(asc(schema.product.categoryId), asc(schema.product.position))).map((r) => r.id));
  add("fast_print_item", (await x.select({ id: schema.fastPrintItem.uid }).from(schema.fastPrintItem).orderBy(asc(schema.fastPrintItem.position))).map((r) => r.id));
  add("showcase_item", (await x.select({ id: schema.showcaseItem.uid }).from(schema.showcaseItem).orderBy(asc(schema.showcaseItem.position))).map((r) => r.id));
  add("post_category", (await x.select({ id: schema.postCategory.key }).from(schema.postCategory).orderBy(asc(schema.postCategory.key))).map((r) => r.id));
  add("post", (await x.select({ id: schema.post.uid }).from(schema.post).orderBy(asc(schema.post.publishedOn))).map((r) => r.id));
  add("site_message", (await x.selectDistinct({ id: schema.siteMessage.namespace }).from(schema.siteMessage).orderBy(asc(schema.siteMessage.namespace))).map((r) => r.id));
  return refs;
}
