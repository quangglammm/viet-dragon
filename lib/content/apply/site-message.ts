import { eq } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import { Invalid } from "../errors";
import type { SiteMessageDocument } from "../schemas";
import { localeEntries, versionAfter } from "./shared";
import type { Applier } from "./types";

// One UI-copy namespace in every language side by side. The rows are versioned per language, but the DOCUMENT is one thing: its
// version is the highest row version, and a publish moves every language it contains to the same new version. A language the
// document no longer contains is removed (the site then falls back to messages/<locale>.json for it).

export const siteMessageApplier: Applier<SiteMessageDocument> = {
  async lock(tx, namespace) {
    const rows = await tx.select({ version: schema.siteMessage.version }).from(schema.siteMessage).where(eq(schema.siteMessage.namespace, namespace)).for("no key update");
    return rows.length === 0 ? null : Math.max(...rows.map((row) => row.version));
  },
  async apply(tx, doc, context) {
    const entries = localeEntries(doc.data);
    if (entries.length === 0) throw new Invalid([{ path: "data", message: "Cần có nội dung của ít nhất một ngôn ngữ." }]);
    const version = versionAfter(context);
    await tx.delete(schema.siteMessage).where(eq(schema.siteMessage.namespace, doc.key));
    await tx.insert(schema.siteMessage).values(entries.map(([locale, data]) => ({ locale, namespace: doc.key, data, version, updatedBy: context.author })));
    return version;
  },
};
