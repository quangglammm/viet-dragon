import { requireApiUser } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { rebaseDraft } from "@/lib/content/drafts";
import { draftBody, entityFromParams, handle, json, readJson, type EntityContext } from "@/lib/content/http";
import { emptyBody } from "@/lib/content/requests";
import { validateSnapshot } from "@/lib/content/validate";

/** Keeps the draft and starts it from the live version as it is now — a knowing overwrite of whatever changed live meanwhile. */
export async function POST(request: Request, { params }: EntityContext) {
  const auth = await requireApiUser(request, ["content", "edit"]);
  if (!auth.ok) return auth.response;

  return handle(async () => {
    const ref = await entityFromParams(params);
    await readJson(request, emptyBody, { optional: true });
    const draft = await rebaseDraft(getDb(), ref, auth.user.id);
    return json(draftBody(draft, await validateSnapshot(getDb(), ref.type, draft.snapshot)), { etag: draft.draftVersion });
  });
}
