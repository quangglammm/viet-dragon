import type { DraftEntityType } from "@/lib/db/content/drafts";
import type { DbExecutor } from "@/lib/db/types";
import { zodIssues, type Issue } from "./errors";
import { checkReferences, collectReferences } from "./references";
import { parseDocument } from "./schemas";

/** The problems of a document that is not valid yet, as `Issue`s. Empty = valid. */
function documentIssues(type: DraftEntityType, snapshot: unknown): Issue[] {
  const parsed = parseDocument(type, snapshot);
  return parsed.success ? [] : zodIssues(parsed.error);
}

/**
 * Everything publish would refuse: the document's own rules plus references that point at nothing. A draft may be saved
 * incomplete; this is what the editor is shown as advice while editing, and what publish enforces.
 */
export async function validateSnapshot(x: DbExecutor, type: DraftEntityType, snapshot: unknown): Promise<Issue[]> {
  return [...documentIssues(type, snapshot), ...(await checkReferences(x, collectReferences(type, snapshot)))];
}
