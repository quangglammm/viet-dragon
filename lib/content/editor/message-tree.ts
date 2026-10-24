import { LOCALES, type LocaleCode } from "../schemas";
import { messageLeaves } from "../schemas/message-leaves";
import { formatPath, getIn, parsePath, setIn } from "./paths";

// A UI-copy namespace is a tree of texts per language (`data.vi.faq.items[2].a`). The editor draws one control per text and never adds or
// removes one: the structure is the site's, only the wording is the editor's. These are the pure parts of that.

export type MessageData = Partial<Record<LocaleCode, unknown>>;

/** The text lines of a namespace: the union of the lines the languages have, in the order of the Vietnamese tree (then English's…). */
export function leafPaths(data: MessageData): string[] {
  const seen = new Set<string>();
  for (const locale of LOCALES) for (const leaf of messageLeaves(data[locale])) seen.add(formatPath(leaf.segments));
  return [...seen];
}

/** The group a line is drawn under: the list or object it sits in (`items[2].a` → `items`); a top-level line has none. */
export function groupOf(path: string): string {
  const [first, second] = parsePath(path);
  return second === undefined ? "" : String(first);
}

/** The text of a line in a language, "" when that language has none. */
export function textOf(data: MessageData, language: LocaleCode, path: string): string {
  const value = getIn(data[language], path);
  return typeof value === "string" ? value : "";
}

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);

/** `tree` plus whatever `reference` has and it lacks, as empty texts — so writing one line never creates a list with holes. */
export function completeLike(tree: unknown, reference: unknown): unknown {
  if (typeof reference === "string") return typeof tree === "string" ? tree : "";
  if (Array.isArray(reference)) {
    const own = Array.isArray(tree) ? tree : [];
    const length = Math.max(own.length, reference.length);
    return Array.from({ length }, (_, index) => (index < reference.length ? completeLike(own[index], reference[index]) : own[index]));
  }
  if (isObject(reference)) {
    const own = isObject(tree) ? tree : {};
    return { ...own, ...Object.fromEntries(Object.entries(reference).map(([key, value]) => [key, completeLike(own[key], value)])) };
  }
  return tree;
}

const REFERENCE_ORDER: readonly LocaleCode[] = ["vi", "en", ...LOCALES.filter((locale) => locale !== "vi" && locale !== "en")];

/**
 * Sets one text of one language. Blank is stored as "" and never removes the key: 18 of the site's lines are plain list items, and
 * removing one would shift the rest. "" means "not translated" (zh/ja/ko then show the English text).
 */
export function setMessageText<D extends { data?: MessageData }>(document: D, language: LocaleCode, path: string, text: string): D {
  const reference = REFERENCE_ORDER.map((locale) => document.data?.[locale]).find((tree) => tree !== undefined);
  const own = document.data?.[language];
  const completed = reference === undefined ? own : completeLike(own, reference);
  return setIn(setIn(document, `data.${language}`, completed ?? {}), `data.${language}.${path}`, text);
}

/** A long line (a paragraph, an answer) gets a taller box than a label or a button. */
export const isLongText = (text: string): boolean => text.length > 80 || text.includes("\n");

/** The lines in the order they are drawn, gathered under their group (a top-level line first, with an empty group name). */
export function groupLines(paths: readonly string[]): { group: string; paths: string[] }[] {
  const groups = new Map<string, string[]>();
  for (const path of paths) groups.set(groupOf(path), [...(groups.get(groupOf(path)) ?? []), path]);
  return [...groups].map(([group, grouped]) => ({ group, paths: grouped })).sort((a, b) => Number(b.group === "") - Number(a.group === ""));
}

/** `items[2].a` → «items › 3 › a»: where a line is, in words an editor can follow (positions count from 1). */
export function lineLabel(path: string): string {
  return parsePath(path).map((segment) => (typeof segment === "number" ? String(segment + 1) : segment)).join(" › ");
}
