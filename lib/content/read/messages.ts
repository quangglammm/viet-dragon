// The site's UI copy: the file defaults (`messages/<language>.json`) with the published texts of the database laid over them, text by
// text. The files own the STRUCTURE (a text the files do not have is ignored, so a stray namespace can never add a key the code does
// not read), the database owns the WORDING; an empty text means "not translated" and leaves the default alone.

export type Messages = { [key: string]: unknown };

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);

function overlayValue(base: unknown, over: unknown): unknown {
  if (typeof base === "string") return typeof over === "string" && over.trim() !== "" ? over : base;
  if (Array.isArray(base)) return base.map((item, index) => overlayValue(item, Array.isArray(over) ? over[index] : undefined));
  if (isRecord(base)) return Object.fromEntries(Object.entries(base).map(([key, value]) => [key, overlayValue(value, isRecord(over) ? over[key] : undefined)]));
  return base;
}

/** `defaults` with the namespaces of `published` (namespace → that language's tree) laid over it. */
export function mergeMessages(defaults: Messages, published: Readonly<Record<string, unknown>>): Messages {
  return Object.fromEntries(Object.entries(defaults).map(([namespace, tree]) => [namespace, overlayValue(tree, published[namespace])]));
}
