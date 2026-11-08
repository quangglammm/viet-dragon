import { z } from "zod";
import { DRAFT_ENTITY_TYPES } from "./entity-types";
import { localeSchema, slugSchema } from "./schemas";

// The bodies the content API accepts. Strict: an unknown field is a mistake worth reporting, not something to ignore.

const MAX_COMMENT_LENGTH = 500;

/** A document (possibly incomplete): its content is judged by the document schema, at save time as advice and at publish as law. */
const snapshot = z.record(z.string(), z.unknown());

const comment = z.string().trim().min(1).max(MAX_COMMENT_LENGTH);

export const createDraftBody = z.strictObject({ key: z.string().optional(), snapshot });
export const saveDraftBody = z.strictObject({ snapshot });
export const emptyBody = z.strictObject({});
/** Publishing and deleting may carry a note that is kept in the revision. */
export const commentBody = z.strictObject({ comment: comment.optional() });
export const restoreBody = z.strictObject({ version: z.int().positive() });
export const releaseAliasBody = z.strictObject({ locale: localeSchema, slug: slugSchema, category: slugSchema.optional() });
/** Preview of an entity's draft in a language: `type` is the entity type as stored (`spec_item`), `id` its uid or key (`technique/offset`). */
export const previewBody = z.strictObject({ type: z.enum(DRAFT_ENTITY_TYPES), id: z.string().min(1), locale: localeSchema });
