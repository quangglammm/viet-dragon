import * as schema from "@/lib/db/schema";
import type { SeedContext } from "../context";

// The original source records, verbatim, so authored detail the model normalizes (raw option names, translation
// precedence, menu structure…) is never lost. Nothing reads this table; it is the archive.

const plain = (value: unknown): unknown => JSON.parse(JSON.stringify(value));

export async function seedLegacy({ tx, src, stats }: SeedContext): Promise<void> {
  const rows: (typeof schema.legacyImport.$inferInsert)[] = [
    ...src.subgroups.map((s) => ({ entityType: "subgroup", entityKey: `${s.categoryId}/${s.id}`, payload: plain(s) })),
    ...Object.entries(src.menus).map(([category, columns]) => ({ entityType: "menu", entityKey: category, payload: plain(columns) })),
    ...src.posts.map((p) => ({ entityType: "post", entityKey: p.slug, payload: plain(p) })),
    ...src.fastPrint.map((p) => ({ entityType: "fast_print", entityKey: p.id, payload: plain(p) })),
  ];
  await tx.insert(schema.legacyImport).values(rows);
  stats.legacyRows = rows.length;
}
