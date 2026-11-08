import { requireApiUser } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { createDraft } from "@/lib/content/drafts";
import { draftBody, handle, json, readJson, typeFromParams, type TypeContext } from "@/lib/content/http";
import { createDraftBody } from "@/lib/content/requests";
import { listSummaries } from "@/lib/content/summaries";
import { validateSnapshot } from "@/lib/content/validate";

/** The rows of the admin list for one entity type: live entities plus entities that exist only as a draft. */
export async function GET(request: Request, { params }: TypeContext) {
  const auth = await requireApiUser(request, ["content", "edit"]);
  if (!auth.ok) return auth.response;

  return handle(async () => {
    const type = await typeFromParams(params);
    return json({ items: await listSummaries(getDb(), type) });
  });
}

/** Starts a draft of an entity that does not exist yet. */
export async function POST(request: Request, { params }: TypeContext) {
  const auth = await requireApiUser(request, ["content", "edit"]);
  if (!auth.ok) return auth.response;

  return handle(async () => {
    const type = await typeFromParams(params);
    const body = await readJson(request, createDraftBody);
    const draft = await createDraft(getDb(), type, body, auth.user.id);
    return json(draftBody(draft, await validateSnapshot(getDb(), type, draft.snapshot)), { status: 201, etag: draft.draftVersion });
  });
}
