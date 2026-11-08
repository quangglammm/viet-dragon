import { eq } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import type { DbExecutor } from "@/lib/db/types";
import { DOCUMENT_SCHEMA, type SiteMessageDocument } from "../schemas";
import { i18nMap, type Composed } from "./shared";

/**
 * One UI-copy namespace for every language side by side. The rows are versioned per language; the document's version
 * is the highest of them (what the draft's base version is compared against).
 */
export async function composeSiteMessage(x: DbExecutor, namespace: string): Promise<Composed<SiteMessageDocument> | null> {
  const rows = await x.select().from(schema.siteMessage).where(eq(schema.siteMessage.namespace, namespace));
  if (rows.length === 0) return null;
  const data = i18nMap(rows, (row) => row.data as Record<string, unknown>);
  return { document: { schema: DOCUMENT_SCHEMA, key: namespace, data }, version: Math.max(...rows.map((row) => row.version)) };
}
