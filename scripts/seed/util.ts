import { isBlank } from "@/lib/content/schemas/common";

// Small pure helpers shared by the seed steps.

export const KEBAB_SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** True for null, undefined, "" and text made only of whitespace in any script (the database's `nonblank()` rule). */
export const isBlankText = (value: string | null | undefined): boolean => value == null || isBlank(value);

/** The text, or null when it is blank — what an optional column should receive. */
export const orNull = (value: string | null | undefined): string | null => (isBlankText(value) ? null : (value as string));

export { slugify } from "@/lib/content/slugify";

/** `base`, or `base-2`, `base-3`… when taken; the result is added to `taken`. */
export function uniqueSlug(base: string, taken: Set<string>): string {
  let slug = base;
  for (let n = 2; taken.has(slug); n += 1) slug = `${base}-${n}`;
  taken.add(slug);
  return slug;
}

export function bump<K>(counts: Map<K, number>, key: K): void {
  counts.set(key, (counts.get(key) ?? 0) + 1);
}

/** The most frequent key (the first one seen wins a tie) and how many distinct keys there were. */
export function majority(counts: ReadonlyMap<string, number>): { value: string; distinct: number } {
  let value = "";
  let best = -1;
  for (const [key, count] of counts) {
    if (count > best) {
      value = key;
      best = count;
    }
  }
  return { value, distinct: counts.size };
}

/** Group `items` by `keyOf`, keeping encounter order. */
export function groupBy<T, K>(items: readonly T[], keyOf: (item: T) => K): Map<K, T[]> {
  const groups = new Map<K, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    const bucket = groups.get(key);
    if (bucket) bucket.push(item);
    else groups.set(key, [item]);
  }
  return groups;
}

/** `/images/a.webp` → `images/a.webp` (the media storage key). */
export const storageKeyOf = (publicPath: string): string => publicPath.replace(/^\//, "");
