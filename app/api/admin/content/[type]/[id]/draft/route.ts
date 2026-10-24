import { requireApiUser } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { discardDraft, getDraft, openDraft, saveDraft } from "@/lib/content/drafts";
import { auditContent } from "@/lib/content/effects";
import { NotFound } from "@/lib/content/errors";
import { draftBody, entityFromParams, handle, json, noContent, optionalIfMatch, readJson, requireIfMatch, type EntityContext } from "@/lib/content/http";
import { emptyBody, saveDraftBody } from "@/lib/content/requests";
import { validateSnapshot } from "@/lib/content/validate";

/** The open draft with advice on what is still missing; its `ETag` is the `draftVersion` to send back as `If-Match`. */
export async function GET(request: Request, { params }: EntityContext) {
  const auth = await requireApiUser(request, ["content", "edit"]);
  if (!auth.ok) return auth.response;

  return handle(async () => {
    const ref = await entityFromParams(params);
    const draft = await getDraft(getDb(), ref);
    if (!draft) throw new NotFound("Chưa có bản nháp.");
    return json(draftBody(draft, await validateSnapshot(getDb(), ref.type, draft.snapshot)), { etag: draft.draftVersion });
  });
}

/** Opens the draft of a live entity (or resumes the one that is open). */
export async function POST(request: Request, { params }: EntityContext) {
  const auth = await requireApiUser(request, ["content", "edit"]);
  if (!auth.ok) return auth.response;

  return handle(async () => {
    const ref = await entityFromParams(params);
    await readJson(request, emptyBody, { optional: true });
    const draft = await openDraft(getDb(), ref, auth.user.id);
    return json(draftBody(draft, await validateSnapshot(getDb(), ref.type, draft.snapshot)), { etag: draft.draftVersion });
  });
}

/** Autosave. `If-Match` = the `draftVersion` the editor loaded; somebody else saving in between is a 409. */
export async function PUT(request: Request, { params }: EntityContext) {
  const auth = await requireApiUser(request, ["content", "edit"]);
  if (!auth.ok) return auth.response;

  return handle(async () => {
    const ref = await entityFromParams(params);
    const expectDraftVersion = requireIfMatch(request);
    const { snapshot } = await readJson(request, saveDraftBody);
    const draft = await saveDraft(getDb(), ref, { snapshot, expectDraftVersion, author: auth.user.id });
    return json(draftBody(draft, await validateSnapshot(getDb(), ref.type, draft.snapshot)), { etag: draft.draftVersion });
  });
}

/** Throws the draft away. With `If-Match`, only if nobody saved after the editor last looked. */
export async function DELETE(request: Request, { params }: EntityContext) {
  const auth = await requireApiUser(request, ["content", "edit"]);
  if (!auth.ok) return auth.response;

  return handle(async () => {
    const ref = await entityFromParams(params);
    await discardDraft(getDb(), ref, optionalIfMatch(request));
    await auditContent(request, auth.user, "content.discarded", ref);
    return noContent();
  });
}
