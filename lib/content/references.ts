import { inArray, sql } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import { DRAFT_REFERENCE_TYPES, type DraftEntityType, type DraftReferenceType } from "@/lib/db/content/drafts";
import type { DbExecutor } from "@/lib/db/types";
import type { Issue } from "./errors";

// What a document refers to outside itself. Two jobs:
//   * every autosave records the library records and media an open draft points at (`draft_reference`), because the
//     foreign keys cannot see drafts and "used by" must;
//   * publish checks that everything exists, with a message that names the field (the database would only say that
//     "a foreign key was violated").
// Drafts are incomplete by design, so extraction never assumes a field is there or has the right type.

export type ReferenceKind = DraftReferenceType | "category" | "post_category";

export interface Reference {
  kind: ReferenceKind;
  key: string;
  path: string;
  /** Media only: the slot takes photos, never videos (Open Graph images, option photos). */
  imageOnly?: boolean;
}

type JsonObject = Record<string, unknown>;

const asObject = (value: unknown): JsonObject | null => (typeof value === "object" && value !== null && !Array.isArray(value) ? (value as JsonObject) : null);
const asList = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

function forEachObject(value: unknown, visit: (item: JsonObject, index: number) => void): void {
  asList(value).forEach((item, index) => {
    const object = asObject(item);
    if (object) visit(object, index);
  });
}

class Collector {
  readonly references: Reference[] = [];

  add(kind: ReferenceKind, value: unknown, path: string, imageOnly = false): void {
    if (typeof value === "string" && value !== "") this.references.push({ kind, key: value, path, ...(imageOnly ? { imageOnly } : {}) });
  }
}

function collectProduct(c: Collector, doc: JsonObject): void {
  c.add("category", doc.category, "category");
  c.add("media", doc.cover, "cover");
  c.add("media", doc.ogImage, "ogImage", true);
  forEachObject(doc.shapes, (shape, i) => {
    c.add("media", shape.image, `shapes[${i}].image`);
    c.add("media", shape.ogImage, `shapes[${i}].ogImage`, true);
  });
  forEachObject(doc.options, (option, i) => {
    const at = `options[${i}]`;
    c.add("material", option.material, `${at}.material`);
    c.add("unit", option.unit, `${at}.unit`);
    c.add("media", option.ogImage, `${at}.ogImage`, true);
    forEachObject(option.bullets, (bullet, j) => c.add("trait", bullet.trait, `${at}.bullets[${j}].trait`));
    const images = asObject(option.images);
    for (const variant of ["default", "pure"] as const) {
      asList(images?.[variant]).forEach((key, j) => c.add("media", key, `${at}.images.${variant}[${j}]`, true));
    }
  });
  forEachObject(doc.specs, (spec, i) => {
    if (typeof spec.kind === "string" && typeof spec.item === "string") c.add("spec_item", `${spec.kind}/${spec.item}`, `specs[${i}].item`);
  });
}

function collectMenu(c: Collector, doc: JsonObject): void {
  c.add("category", doc.category, "category");
  forEachObject(doc.columns, (column, ci) => {
    forEachObject(column.groups, (group, gi) => {
      const at = `columns[${ci}].groups[${gi}]`;
      c.add("media", group.image, `${at}.image`);
      forEachObject(group.items, (item, ii) => c.add("media", item.image, `${at}.items[${ii}].image`));
    });
  });
}

function collectPost(c: Collector, doc: JsonObject): void {
  c.add("post_category", doc.category, "category");
  c.add("media", doc.cover, "cover");
  c.add("media", doc.ogImage, "ogImage", true);
}

function collectCategory(c: Collector, doc: JsonObject): void {
  c.add("media", doc.cover, "cover");
  c.add("media", doc.ogImage, "ogImage", true);
}

function collectFastPrintItem(c: Collector, doc: JsonObject): void {
  c.add("media", doc.image, "image");
  c.add("unit", doc.unit, "unit");
}

function collectShowcaseItem(c: Collector, doc: JsonObject): void {
  c.add("media", doc.media, "media");
}

const COLLECTORS: Record<DraftEntityType, ((c: Collector, doc: JsonObject) => void) | null> = {
  product: collectProduct,
  menu: collectMenu,
  post: collectPost,
  category: collectCategory,
  fast_print_item: collectFastPrintItem,
  showcase_item: collectShowcaseItem,
  material: null,
  trait: null,
  unit: null,
  spec_item: null,
  post_category: null,
  site_message: null,
};

/** Every reference in a document (also a half-filled one), with the field it was found in. */
export function collectReferences(type: DraftEntityType, snapshot: unknown): Reference[] {
  const document = asObject(snapshot);
  const collect = COLLECTORS[type];
  if (!document || !collect) return [];
  const collector = new Collector();
  collect(collector, document);
  return collector.references;
}

export interface DraftReferenceRow {
  refType: DraftReferenceType;
  refKey: string;
}

const isDraftReferenceType = (kind: ReferenceKind): kind is DraftReferenceType => (DRAFT_REFERENCE_TYPES as readonly string[]).includes(kind);

/** The distinct records an open draft points at, in the shape of the `draft_reference` table. */
export function draftReferenceRows(type: DraftEntityType, snapshot: unknown): DraftReferenceRow[] {
  const rows = new Map<string, DraftReferenceRow>();
  for (const { kind, key } of collectReferences(type, snapshot)) {
    if (isDraftReferenceType(kind)) rows.set(`${kind}\u0000${key}`, { refType: kind, refKey: key });
  }
  return [...rows.values()];
}

const KIND_LABEL: Record<ReferenceKind, string> = {
  material: "chất liệu",
  trait: "biểu tượng đặc điểm",
  unit: "đơn vị",
  spec_item: "thông số",
  media: "ảnh hoặc video",
  category: "danh mục",
  post_category: "chuyên mục bài viết",
};

const specItemId = sql<string>`${schema.specItem.kind} || '/' || ${schema.specItem.key}`;

/** The keys of `kind` that exist, and for media their kind. */
async function existingKeys(x: DbExecutor, kind: ReferenceKind, keys: string[]): Promise<Map<string, string>> {
  const found = new Map<string, string>();
  const add = (rows: readonly { key: string; extra?: string }[]) => rows.forEach((row) => found.set(row.key, row.extra ?? ""));
  switch (kind) {
    case "material":
      add(await x.select({ key: schema.material.slug }).from(schema.material).where(inArray(schema.material.slug, keys)));
      break;
    case "trait":
      add(await x.select({ key: schema.trait.key }).from(schema.trait).where(inArray(schema.trait.key, keys)));
      break;
    case "unit":
      add(await x.select({ key: schema.unit.key }).from(schema.unit).where(inArray(schema.unit.key, keys)));
      break;
    case "spec_item":
      add(await x.select({ key: specItemId }).from(schema.specItem).where(inArray(specItemId, keys)));
      break;
    case "category":
      add(await x.select({ key: schema.category.id }).from(schema.category).where(inArray(schema.category.id, keys)));
      break;
    case "post_category":
      add(await x.select({ key: schema.postCategory.key }).from(schema.postCategory).where(inArray(schema.postCategory.key, keys)));
      break;
    case "media":
      add(await x.select({ key: schema.media.storageKey, extra: schema.media.kind }).from(schema.media).where(inArray(schema.media.storageKey, keys)));
      break;
  }
  return found;
}

/** One issue per reference that points at nothing (or, for a photo slot, at a video). */
export async function checkReferences(x: DbExecutor, references: readonly Reference[]): Promise<Issue[]> {
  const keysByKind = new Map<ReferenceKind, Set<string>>();
  for (const { kind, key } of references) (keysByKind.get(kind) ?? keysByKind.set(kind, new Set()).get(kind))!.add(key);

  const existing = new Map<ReferenceKind, Map<string, string>>();
  for (const [kind, keys] of keysByKind) existing.set(kind, await existingKeys(x, kind, [...keys]));

  const issues: Issue[] = [];
  for (const { kind, key, path, imageOnly } of references) {
    const found = existing.get(kind)?.get(key);
    if (found === undefined) issues.push({ path, message: `Không tìm thấy ${KIND_LABEL[kind]} «${key}».` });
    else if (imageOnly && found !== "image") issues.push({ path, message: `«${key}» là video, nhưng ô này chỉ nhận ảnh.` });
  }
  return issues;
}
