import { requireApiUser } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { entityFromParams, handle, json, type EntityContext } from "@/lib/content/http";
import { listRevisions } from "@/lib/content/restore";

/** The history of an entity, newest first (without the documents; fetch one revision to read it). */
export async function GET(request: Request, { params }: EntityContext) {
  const auth = await requireApiUser(request, ["content", "edit"]);
  if (!auth.ok) return auth.response;

  return handle(async () => {
    const ref = await entityFromParams(params);
    return json({ revisions: await listRevisions(getDb(), ref) });
  });
}
