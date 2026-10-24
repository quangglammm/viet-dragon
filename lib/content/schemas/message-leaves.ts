// The texts of a UI-copy tree (one namespace of `messages/<language>.json`): every string at the end of a path of property names and list
// positions. Pure and import-free, shared by the document schema (which checks them) and the editor (which draws one control per text).

export type MessageSegment = string | number;

export interface MessageLeaf {
  segments: MessageSegment[];
  text: string;
}

export function messageLeaves(tree: unknown, prefix: MessageSegment[] = []): MessageLeaf[] {
  if (typeof tree === "string") return [{ segments: prefix, text: tree }];
  if (Array.isArray(tree)) return tree.flatMap((item, index) => messageLeaves(item, [...prefix, index]));
  if (typeof tree === "object" && tree !== null) return Object.entries(tree).flatMap(([key, item]) => messageLeaves(item, [...prefix, key]));
  return [];
}
