import type { EntityRef } from "./compose";

// Which cached pages a publish makes stale. The HTTP layer revalidates these tags after the transaction commits; the public
// pages (Phase 4) tag what they read the same way.

const CONTENT_TAG = "content";

const tagOf = (ref: EntityRef): string => `${CONTENT_TAG}:${ref.type}:${ref.id}`;

const asObject = (value: unknown): Record<string, unknown> | null => (typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null);

/**
 * Everything a change to `ref` shows up in. A product is also rendered inside the mega-menu of its category (its title is
 * the default group label), so a product publish also touches the menus it left and the one it joined.
 */
export function affectedBy(ref: EntityRef, before: unknown, after: unknown): EntityRef[] {
  const affected: EntityRef[] = [ref];
  if (ref.type === "product") {
    const categories = new Set([asObject(before)?.category, asObject(after)?.category].filter((c): c is string => typeof c === "string"));
    for (const id of categories) affected.push({ type: "menu", id });
  }
  return affected;
}

/** The tags to revalidate: the whole content tree, each affected type, and each affected entity. */
export function cacheTags(refs: readonly EntityRef[]): string[] {
  const tags = new Set<string>([CONTENT_TAG]);
  for (const ref of refs) {
    tags.add(`${CONTENT_TAG}:${ref.type}`);
    tags.add(tagOf(ref));
  }
  return [...tags];
}
