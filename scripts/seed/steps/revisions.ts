import { composeEntity, listEntities } from "@/lib/content/compose";
import { writeRevision } from "@/lib/content/revision";
import { documentIdentity, parseDocument } from "@/lib/content/schemas";
import type { SeedContext } from "../context";

export const IMPORT_COMMENT = "Dữ liệu gốc của website";

/**
 * Revision 1 of every entity: its document composed back out of the rows just written. Every document must also
 * pass its zod schema — so this step is the first check of the schemas against the real catalog, and a failure
 * means the schema or the seed is wrong, never that the data should be skipped.
 */
export async function seedRevisions(ctx: SeedContext): Promise<number> {
  const { tx } = ctx;
  let written = 0;
  for (const { type, id } of await listEntities(tx)) {
    const composed = await composeEntity(tx, type, id);
    if (!composed) throw new Error(`${type} ${id} was written but cannot be composed`);
    const parsed = parseDocument(type, composed.document);
    if (!parsed.success) {
      const first = parsed.error.issues.slice(0, 3).map((issue) => `${issue.path.join(".")}: ${issue.message}`);
      throw new Error(`The ${type} ${id} does not satisfy its document schema — ${first.join(" | ")}`);
    }
    await writeRevision(tx, {
      entityType: type,
      identity: documentIdentity(type, parsed.data as { uid?: string; key?: string }),
      version: composed.version,
      action: "import",
      snapshot: parsed.data,
      comment: IMPORT_COMMENT,
    });
    written += 1;
  }
  return written;
}
