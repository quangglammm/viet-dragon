import { requireApiUser } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { NotFound } from "@/lib/content/errors";
import { entityFromParams, handle, json, versionFromParam, type RevisionContext } from "@/lib/content/http";
import { getRevision } from "@/lib/content/restore";

export async function GET(request: Request, { params }: RevisionContext) {
  const auth = await requireApiUser(request, ["content", "edit"]);
  if (!auth.ok) return auth.response;

  return handle(async () => {
    const ref = await entityFromParams(params);
    const revision = await getRevision(getDb(), ref, versionFromParam((await params).version));
    if (!revision) throw new NotFound("Không tìm thấy phiên bản.");
    return json({ revision });
  });
}
