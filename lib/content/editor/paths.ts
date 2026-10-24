// Reading and changing a document by a concrete path — `options[2].prices.base`, `i18n.vi.title` — without ever mutating it.
// Every editor control is bound to one such path; the document in React state is only ever replaced by a new copy.

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
export type Segment = string | number;

const SEGMENT = /([^.[\]]+)|\[(\d+)]/g;

/** `a.b[2].c` → ["a", "b", 2, "c"]. */
export function parsePath(path: string): Segment[] {
  const segments: Segment[] = [];
  for (const match of path.matchAll(SEGMENT)) segments.push(match[1] === undefined ? Number(match[2]) : match[1]);
  return segments;
}

export function formatPath(segments: readonly Segment[]): string {
  return segments.reduce<string>((text, segment) => (typeof segment === "number" ? `${text}[${segment}]` : text === "" ? segment : `${text}.${segment}`), "");
}

const isContainer = (value: unknown): value is Record<string, unknown> | unknown[] => typeof value === "object" && value !== null;

export function getIn(document: unknown, path: string): unknown {
  let node: unknown = document;
  for (const segment of parsePath(path)) {
    if (!isContainer(node)) return undefined;
    node = (node as Record<Segment, unknown>)[segment];
  }
  return node;
}

function replaceAt(node: unknown, segments: readonly Segment[], value: unknown): unknown {
  if (segments.length === 0) return value;
  const [head, ...rest] = segments;
  const container: unknown = isContainer(node) ? node : typeof head === "number" ? [] : {};
  const child = (container as Record<Segment, unknown>)[head];
  const next = replaceAt(child, rest, value);
  if (Array.isArray(container)) {
    const copy = [...container];
    copy[head as number] = next;
    return copy;
  }
  return { ...(container as Record<string, unknown>), [head]: next };
}

/** A copy of `document` with the value at `path` replaced (missing objects and lists on the way are created). */
export function setIn<D>(document: D, path: string, value: unknown): D {
  return replaceAt(document, parsePath(path), value) as D;
}

function removeAt(node: unknown, segments: readonly Segment[]): unknown {
  if (!isContainer(node) || segments.length === 0) return node;
  const [head, ...rest] = segments;
  if (rest.length === 0) {
    if (Array.isArray(node)) return node.filter((_, index) => index !== head);
    const others = { ...(node as Record<string, unknown>) };
    delete others[head as string];
    return others;
  }
  const child = (node as Record<Segment, unknown>)[head];
  if (child === undefined) return node;
  const next = removeAt(child, rest);
  return Array.isArray(node) ? node.map((item, index) => (index === head ? next : item)) : { ...node, [head]: next };
}

/** A copy without the key (or list element) at `path`. */
export function removeIn<D>(document: D, path: string): D {
  return removeAt(document, parsePath(path)) as D;
}

/** A copy with `change` applied to the value at `path` (for lists: insert, remove, reorder). */
export function updateIn<D, V>(document: D, path: string, change: (current: V | undefined) => V): D {
  return setIn(document, path, change(getIn(document, path) as V | undefined));
}

const isBlank = (text: string): boolean => text.trim() === "";

/**
 * Sets an optional text. Blank means "not provided": the key is removed — never stored as "" — and a language row left empty
 * (`i18n.zh` with nothing in it) goes too, so that language falls back to English instead of failing the document's rules.
 */
export function setText<D>(document: D, path: string, text: string): D {
  if (!isBlank(text)) return setIn(document, path, text);
  const segments = parsePath(path);
  let result = removeIn(document, path);
  // The row of one language: …, "i18n", "zh", "title" — or, for a text with no field name of its own, …, "i18n", "zh".
  for (const rowLength of [segments.length - 1, segments.length]) {
    if (rowLength < 2 || segments[rowLength - 2] !== "i18n") continue;
    const rowPath = formatPath(segments.slice(0, rowLength));
    const row = getIn(result, rowPath);
    if (isContainer(row) && !Array.isArray(row) && Object.keys(row).length === 0) result = removeIn(result, rowPath);
  }
  return result;
}

/** `path` is `prefix` itself or something inside it: `shapes[1]` holds `shapes[1].image`, but not `shapes[10]`. */
export function isWithin(path: string, prefix: string): boolean {
  return path === prefix || (path.startsWith(prefix) && /^[.[]/.test(path.slice(prefix.length)));
}

/** The position of the list element a path points into: `listIndexOf("shapes[3].i18n.en", "shapes")` is 3; null when it is elsewhere. */
export function listIndexOf(path: string, list: string): number | null {
  const match = new RegExp(`^${list}\\[(\\d+)\\]`).exec(path);
  return match ? Number(match[1]) : null;
}
