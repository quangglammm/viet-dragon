import { requireApiUser } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { auditContent, revalidateContent } from "@/lib/content/effects";
import { entityFromParams, handle, json, readJson, requireIfMatch, type EntityContext } from "@/lib/content/http";
import { publishDraft } from "@/lib/content/publish";
import { commentBody } from "@/lib/content/requests";

/** Publishes exactly the draft the editor previewed: `If-Match` = its `draftVersion`. */
export async function POST(request: Request, { params }: EntityContext) {
  const auth = await requireApiUser(request, ["content", "publish"]);
  if (!auth.ok) return auth.response;

  return handle(async () => {
    const ref = await entityFromParams(params);
    const expectDraftVersion = requireIfMatch(request);
    const { comment } = await readJson(request, commentBody, { optional: true });
    const result = await publishDraft(getDb(), ref, { expectDraftVersion, author: auth.user.id, comment });
    revalidateContent(result.affected);
    await auditContent(request, auth.user, result.action === "restore" ? "content.restored" : "content.published", ref, { version: result.version, action: result.action });
    return json({ ref, version: result.version, action: result.action }, { etag: result.version });
  });
}
