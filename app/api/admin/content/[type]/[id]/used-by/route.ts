import { requireApiUser } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { NotFound } from "@/lib/content/errors";
import { entityFromParams, handle, json, type EntityContext } from "@/lib/content/http";
import { USED_BY_TYPES, usedBy, type UsedByType } from "@/lib/content/used-by";

const isUsedByType = (type: string): type is UsedByType => (USED_BY_TYPES as readonly string[]).includes(type);

/** How many live records and open drafts use a library record (material, unit, trait, spec item, blog category). */
export async function GET(request: Request, { params }: EntityContext) {
  const auth = await requireApiUser(request, ["content", "edit"]);
  if (!auth.ok) return auth.response;

  return handle(async () => {
    const ref = await entityFromParams(params);
    if (!isUsedByType(ref.type)) throw new NotFound("Loại nội dung này không có thống kê sử dụng.");
    return json(await usedBy(getDb(), ref.type, ref.id));
  });
}
