import { requireApiUser } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { releaseAlias } from "@/lib/content/aliases";
import { auditContent, revalidateContent } from "@/lib/content/effects";
import { NotFound } from "@/lib/content/errors";
import { entityFromParams, handle, json, readJson, type EntityContext } from "@/lib/content/http";
import { releaseAliasBody } from "@/lib/content/requests";

/** Lets one old URL of a product go, in one language. Publishing never does this; a canonical URL can never be released. */
export async function POST(request: Request, { params }: EntityContext) {
  const auth = await requireApiUser(request, ["content", "publish"]);
  if (!auth.ok) return auth.response;

  return handle(async () => {
    const ref = await entityFromParams(params);
    if (ref.type !== "product") throw new NotFound("Chỉ sản phẩm mới có đường dẫn cũ để gỡ.");
    const body = await readJson(request, releaseAliasBody);
    const { version } = await releaseAlias(getDb(), { productUid: ref.id, ...body, author: auth.user.id });
    revalidateContent([ref]);
    await auditContent(request, auth.user, "content.alias_released", ref, { version, ...body });
    return json({ ref, version }, { etag: version });
  });
}
