import * as schema from "@/lib/db/schema";
import type { RevisionAction } from "@/lib/db/content/drafts";
import type { DbExecutor } from "@/lib/db/types";
import { DOCUMENT_SCHEMA, type DocumentIdentity } from "./schemas";

export interface NewRevision {
  entityType: string;
  identity: DocumentIdentity;
  /** The live version this revision records (the entity's `version` after the change). */
  version: number;
  action: RevisionAction;
  /** The document exactly as it stands after the change. The database checks it carries the identity it is filed under. */
  snapshot: object;
  comment?: string;
  /** Account id of the editor; null for the system (the seed). */
  author?: string | null;
}

/** One row per publish. Restoring a revision opens it as a new draft; nothing here is ever updated. */
export async function writeRevision(x: DbExecutor, revision: NewRevision): Promise<void> {
  await x.insert(schema.contentRevision).values({
    entityType: revision.entityType,
    entityUid: revision.identity.entityUid,
    entityKey: revision.identity.entityKey,
    version: revision.version,
    action: revision.action,
    snapshotSchema: DOCUMENT_SCHEMA,
    snapshot: revision.snapshot,
    comment: revision.comment ?? null,
    author: revision.author ?? null,
  });
}
