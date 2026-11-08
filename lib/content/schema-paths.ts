import type { z } from "zod";

// Resolves the dotted paths of lib/content/column-registry.ts against a zod document schema:
//   `a.b` property · `a[]` element of the array `a` · `*` the value of a record (a language map).

type Def = {
  type: string;
  shape?: Record<string, z.ZodType>;
  element?: z.ZodType;
  valueType?: z.ZodType;
  innerType?: z.ZodType;
  options?: readonly z.ZodType[];
  in?: z.ZodType;
};

const defOf = (schema: z.ZodType): Def => schema.def as unknown as Def;

const WRAPPERS = new Set(["optional", "nullable", "default", "prefault", "nonoptional", "readonly", "catch"]);

/** The schemas this node may stand for once optional/nullable/default/pipe wrappers are peeled (a union has several). */
function candidates(schema: z.ZodType): z.ZodType[] {
  const def = defOf(schema);
  if (WRAPPERS.has(def.type) && def.innerType) return candidates(def.innerType);
  if (def.type === "pipe" && def.in) return candidates(def.in);
  if (def.type === "union" && def.options) return def.options.flatMap(candidates);
  return [schema];
}

function step(schema: z.ZodType, segment: string): z.ZodType[] {
  const isElement = segment.endsWith("[]");
  const name = isElement ? segment.slice(0, -2) : segment;
  const targets = candidates(schema).flatMap((node) => {
    const def = defOf(node);
    if (name === "*") return def.type === "record" && def.valueType ? [def.valueType] : [];
    if (def.type === "object" && def.shape && name in def.shape) return [def.shape[name]];
    return [];
  });
  if (!isElement) return targets;
  return targets.flatMap(candidates).flatMap((node) => {
    const def = defOf(node);
    return def.type === "array" && def.element ? [def.element] : [];
  });
}

const join = (prefix: string, segment: string): string => (prefix === "" ? segment : `${prefix}.${segment}`);

function collectLeaves(schema: z.ZodType, prefix: string, out: Set<string>): void {
  for (const node of candidates(schema)) {
    const def = defOf(node);
    if (def.type === "object" && def.shape) {
      for (const [name, child] of Object.entries(def.shape)) collectLeaves(child, join(prefix, name), out);
    } else if (def.type === "array" && def.element) {
      collectLeaves(def.element, `${prefix}[]`, out);
    } else if (def.type === "record" && def.valueType) {
      collectLeaves(def.valueType, join(prefix, "*"), out);
    } else {
      out.add(prefix);
    }
  }
}

/**
 * Every leaf of a document schema, in the path syntax above: the values an editor can actually type, pick or toggle.
 * A union contributes the leaves of each of its branches (a menu item targets `target.shape` or `target.option`).
 */
export function documentLeafPaths(schema: z.ZodType): string[] {
  const leaves = new Set<string>();
  collectLeaves(schema, "", leaves);
  return [...leaves];
}

/** True when `path` leads somewhere in `schema`. An empty path is the schema itself. */
export function schemaHasPath(schema: z.ZodType, path: string): boolean {
  let nodes: z.ZodType[] = [schema];
  for (const segment of path.split(".")) {
    nodes = nodes.flatMap((node) => step(node, segment));
    if (nodes.length === 0) return false;
  }
  return true;
}
