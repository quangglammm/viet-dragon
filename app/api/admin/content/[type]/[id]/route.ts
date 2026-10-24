import { requireApiUser } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { composeEntity } from "@/lib/content/compose";
import { deleteEntity } from "@/lib/content/delete";
import { getDraft } from "@/lib/content/drafts";
import { auditContent, revalidateContent } from "@/lib/content/effects";
import { entityFromParams, handle, json, readJson, type EntityContext } from "@/lib/content/http";
import { NotFound } from "@/lib/content/errors";
import { commentBody } from "@/lib/content/requests";

/** The live document, and whether somebody has a draft of it open. */
export async function GET(request: Request, { params }: EntityContext) {
  const auth = await requireApiUser(request, ["content", "edit"]);
  if (!auth.ok) return auth.response;

  return handle(async () => {
    const ref = await entityFromParams(params);
    const live = await composeEntity(getDb(), ref.type, ref.id);
    if (!live) throw new NotFound("Không tìm thấy nội dung.");
    const draft = await getDraft(getDb(), ref);
    const openDraft = draft && { draftVersion: draft.draftVersion, baseVersion: draft.baseVersion, updatedAt: draft.updatedAt, updatedBy: draft.updatedBy };
    return json({ ref, version: live.version, document: live.document, draft: openDraft }, { etag: live.version });
  });
}

/** Deletes a record for good (admins only; see lib/content/delete.ts for what must hold first). */
export async function DELETE(request: Request, { params }: EntityContext) {
  const auth = await requireApiUser(request, ["content", "delete"]);
  if (!auth.ok) return auth.response;

  return handle(async () => {
    const ref = await entityFromParams(params);
    const { comment } = await readJson(request, commentBody, { optional: true });
    const result = await deleteEntity(getDb(), ref, { author: auth.user.id, comment });
    revalidateContent(result.affected);
    await auditContent(request, auth.user, "content.deleted", ref, { version: result.version });
    return json({ ref, version: result.version });
  });
}
