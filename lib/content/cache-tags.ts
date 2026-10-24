import type { DraftEntityType } from "@/lib/db/content/drafts";
import type { EntityRef } from "./compose";

// Which cached pages a publish makes stale. The HTTP layer revalidates these tags after the transaction commits; the public
// pages (Phase 4) tag what they read the same way.

const CONTENT_TAG = "content";

/** What a change touches: one entity, or (no `id`) every entity of a type. */
export interface Affected {
  type: DraftEntityType;
  id?: string;
}

const tagOf = (affected: Affected): string => `${CONTENT_TAG}:${affected.type}${affected.id === undefined ? "" : `:${affected.id}`}`;

const asObject = (value: unknown): Record<string, unknown> | null => (typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null);

/** The types that render a record of this type (a trait's icon is drawn in every product that uses it). */
const RENDERED_IN: Partial<Record<DraftEntityType, readonly DraftEntityType[]>> = {
  trait: ["product"],
  material: ["product"],
  unit: ["product", "fast_print_item"],
  spec_item: ["product"],
  category: ["product"],
  post_category: ["post"],
};

/**
 * Everything a change to `ref` shows up in. A product is also rendered inside the mega-menu of its category (its title is the
 * default group label), so a product change also touches the menus it left and joined; the vocabulary and the categories
 * show up in every record that uses them.
 */
export function affectedBy(ref: EntityRef, before: unknown, after: unknown): Affected[] {
  const affected: Affected[] = [ref];
  if (ref.type === "product") {
    const categories = new Set([asObject(before)?.category, asObject(after)?.category].filter((c): c is string => typeof c === "string"));
    for (const id of categories) affected.push({ type: "menu", id });
  }
  if (ref.type === "category") affected.push({ type: "menu", id: ref.id });
  for (const type of RENDERED_IN[ref.type] ?? []) if (!affected.some((a) => a.type === type && a.id === undefined)) affected.push({ type });
  return affected;
}

/** The tags to revalidate: the whole content tree, each affected type, and each affected entity. */
export function cacheTags(affected: readonly Affected[]): string[] {
  const tags = new Set<string>([CONTENT_TAG]);
  for (const item of affected) {
    tags.add(tagOf({ type: item.type }));
    tags.add(tagOf(item));
  }
  return [...tags];
}
