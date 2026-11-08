import * as schema from "@/lib/db/schema";
import type { SeedContext } from "../context";
import { LOCALES } from "../localized";

// UI copy: one JSON tree per (language, namespace), read later as deepMerge(messages/<locale>.json, database).
// messages/*.json is healthy (identical keys in all five languages), so it is carried over as it is.

const NAMESPACE = /^[A-Za-z][A-Za-z0-9]*$/;

export async function seedMessages({ tx, src, notes, stats }: SeedContext): Promise<void> {
  const rows: (typeof schema.siteMessage.$inferInsert)[] = [];
  for (const locale of LOCALES) {
    for (const [namespace, data] of Object.entries(src.messages[locale])) {
      if (typeof data !== "object" || data === null || Array.isArray(data) || !NAMESPACE.test(namespace)) {
        notes.add("message-namespace-not-object", `${locale}.${namespace}`);
        continue;
      }
      rows.push({ locale, namespace, data });
    }
  }
  await tx.insert(schema.siteMessage).values(rows);
  stats.messageRows = rows.length;
}
