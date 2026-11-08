import { requireApiUser } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { draftChanges } from "@/lib/content/drafts";
import { entityFromParams, handle, json, type EntityContext } from "@/lib/content/http";

/** What publishing the draft would change: the live document → the draft, field by field. */
export async function GET(request: Request, { params }: EntityContext) {
  const auth = await requireApiUser(request, ["content", "edit"]);
  if (!auth.ok) return auth.response;

  return handle(async () => {
    const ref = await entityFromParams(params);
    return json({ changes: await draftChanges(getDb(), ref) });
  });
}
