// A field-level difference between two documents: what a 409 answers with, so an editor sees WHAT changed while they
// were editing, and what the draft screen shows next to the live version. Documents are plain JSON.

export interface Change {
  /** `options[<uid>].prices.base`: dotted fields, with the identity of an array element in brackets. */
  path: string;
  kind: "added" | "removed" | "changed";
  before?: unknown;
  after?: unknown;
}

type JsonObject = Record<string, unknown>;

const isObject = (value: unknown): value is JsonObject => typeof value === "object" && value !== null && !Array.isArray(value);

/** How an element of an array of objects is identified, so inserting one in the middle is not reported as a change of all that follow. */
const ELEMENT_KEYS: readonly ((element: JsonObject) => string | null)[] = [
  (e) => (typeof e.uid === "string" ? e.uid : null),
  (e) => (e.target !== undefined ? JSON.stringify(e.target) : null), // menu item
  (e) => (typeof e.product === "string" ? e.product : null), // menu group
  (e) => (typeof e.column === "number" ? String(e.column) : null), // menu column
  (e) => (typeof e.tier === "string" ? `${e.shape ?? "*"}|${e.tier}` : null), // size
  (e) => (typeof e.kind === "string" && typeof e.item === "string" ? `${e.shape ?? "*"}|${e.kind}|${e.item}` : null), // spec
  (e) => (typeof e.kind === "string" && typeof e.position === "number" ? `${e.kind}:${e.position}` : null), // bullet
  (e) => (typeof e.category === "string" && typeof e.slug === "string" ? `${e.category}/${e.slug}` : null), // product alias
];

function elementKey(element: unknown): string | null {
  if (!isObject(element)) return null;
  for (const keyOf of ELEMENT_KEYS) {
    const key = keyOf(element);
    if (key !== null) return key;
  }
  return null;
}

/** Keys for a whole array, or null when it has no usable identity (primitives, or a key missing / repeated). */
function keysOf(items: readonly unknown[]): string[] | null {
  const keys = items.map(elementKey);
  if (keys.some((key) => key === null) || new Set(keys).size !== keys.length) return null;
  return keys as string[];
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((item, i) => deepEqual(item, b[i]));
  if (isObject(a) && isObject(b)) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    return [...keys].every((key) => deepEqual(a[key], b[key]));
  }
  return false;
}

const join = (path: string, field: string): string => (path === "" ? field : `${path}.${field}`);

function diffArrays(before: readonly unknown[], after: readonly unknown[], path: string, out: Change[]): void {
  const beforeKeys = keysOf(before);
  const afterKeys = keysOf(after);
  if (beforeKeys && afterKeys) {
    const beforeByKey = new Map(beforeKeys.map((key, i) => [key, before[i]]));
    const afterByKey = new Map(afterKeys.map((key, i) => [key, after[i]]));
    for (const key of beforeKeys) {
      if (!afterByKey.has(key)) out.push({ path: `${path}[${key}]`, kind: "removed", before: beforeByKey.get(key) });
    }
    for (const key of afterKeys) {
      if (!beforeByKey.has(key)) out.push({ path: `${path}[${key}]`, kind: "added", after: afterByKey.get(key) });
      else diffValues(beforeByKey.get(key), afterByKey.get(key), `${path}[${key}]`, out);
    }
    return;
  }
  const length = Math.max(before.length, after.length);
  for (let i = 0; i < length; i += 1) {
    if (i >= after.length) out.push({ path: `${path}[${i}]`, kind: "removed", before: before[i] });
    else if (i >= before.length) out.push({ path: `${path}[${i}]`, kind: "added", after: after[i] });
    else diffValues(before[i], after[i], `${path}[${i}]`, out);
  }
}

function diffValues(before: unknown, after: unknown, path: string, out: Change[]): void {
  if (deepEqual(before, after)) return;
  if (isObject(before) && isObject(after)) {
    const fields = [...new Set([...Object.keys(after), ...Object.keys(before)])];
    for (const field of fields) {
      const at = join(path, field);
      if (before[field] === undefined && after[field] === undefined) continue;
      if (before[field] === undefined) out.push({ path: at, kind: "added", after: after[field] });
      else if (after[field] === undefined) out.push({ path: at, kind: "removed", before: before[field] });
      else diffValues(before[field], after[field], at, out);
    }
    return;
  }
  if (Array.isArray(before) && Array.isArray(after)) {
    diffArrays(before, after, path, out);
    return;
  }
  out.push({ path, kind: "changed", before, after });
}

/** What turns `before` into `after`. `before` null = the entity does not exist yet, so everything is new. */
export function diffDocuments(before: unknown, after: unknown): Change[] {
  if (before === null || before === undefined) return [{ path: "", kind: "added", after }];
  const changes: Change[] = [];
  diffValues(before, after, "", changes);
  return changes;
}

const ALIAS_ROW = /\.aliases\[[^\]]*\]$/;

/**
 * What PUBLISHING `draft` over `live` would change. Like `diffDocuments`, except an old URL missing from the draft is not a change:
 * a publish keeps every alias it already holds (only «Gỡ đường dẫn cũ» lets one go), so listing it as removed would promise
 * something that does not happen (a restored old version, for one, lacks the aliases created since).
 */
export function publishChanges(live: unknown, draft: unknown): Change[] {
  return diffDocuments(live, draft).filter((change) => !(change.kind === "removed" && ALIAS_ROW.test(change.path)));
}
