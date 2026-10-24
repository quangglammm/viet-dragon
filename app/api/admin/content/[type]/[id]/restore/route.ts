import { requireApiUser } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { draftBody, entityFromParams, handle, json, readJson, type EntityContext } from "@/lib/content/http";
import { restoreBody } from "@/lib/content/requests";
import { startRestore } from "@/lib/content/restore";
import { validateSnapshot } from "@/lib/content/validate";

/** Opens a revision as a draft. Nothing is applied until that draft is published (which needs `content:publish`). */
export async function POST(request: Request, { params }: EntityContext) {
  const auth = await requireApiUser(request, ["content", "edit"]);
  if (!auth.ok) return auth.response;

  return handle(async () => {
    const ref = await entityFromParams(params);
    const { version } = await readJson(request, restoreBody);
    const draft = await startRestore(getDb(), ref, version, auth.user.id);
    return json(draftBody(draft, await validateSnapshot(getDb(), ref.type, draft.snapshot)), { status: 201, etag: draft.draftVersion });
  });
}
