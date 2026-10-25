import { draftMode } from "next/headers";
import { requireApiUser } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { getDraft } from "@/lib/content/drafts";
import { Invalid, NotFound } from "@/lib/content/errors";
import { handle, json, noContent, readJson } from "@/lib/content/http";
import { isEntityId } from "@/lib/content/identity";
import { loadBlog, loadCatalog } from "@/lib/content/read/load";
import { loadPreviewOverlay } from "@/lib/content/read/preview";
import { previewPathOf } from "@/lib/content/read/preview-target";
import { previewBody } from "@/lib/content/requests";
import { validateSnapshot } from "@/lib/content/validate";
import { publicPath } from "@/lib/routes";

// Preview: switches Draft Mode on for the editor's browser and answers the address of the page that shows the draft. The cookie is only
// a switch — every public request that carries it is checked again for an editor's session (lib/content/read/preview-session.ts).

/** Turns the preview on and answers `{ url }`: the draft's page in the chosen language, as it is written in the address bar. */
export async function POST(request: Request) {
  const auth = await requireApiUser(request, ["content", "edit"]);
  if (!auth.ok) return auth.response;

  return handle(async () => {
    const { type, id, locale } = await readJson(request, previewBody);
    if (!isEntityId(type, id)) throw new NotFound("Không tìm thấy nội dung.");
    const ref = { type, id };
    const db = getDb();

    // The page is built from the same overlay the site will use, so a draft that cannot be shown is refused here, with its reasons,
    // instead of opening a page that quietly shows the published version.
    const overlay = await loadPreviewOverlay(db);
    const isTarget = (draft: { ref: typeof ref }) => draft.ref.type === type && draft.ref.id === id;
    if (overlay.skipped.some(isTarget)) {
      const draft = await getDraft(db, ref);
      throw new Invalid(draft ? await validateSnapshot(db, type, draft.snapshot) : []);
    }
    if (!overlay.applied.some(isTarget)) throw new NotFound("Chưa có bản nháp để xem trước.");

    const [catalog, blog] = await Promise.all([loadCatalog(db, overlay), loadBlog(db, overlay)]);
    (await draftMode()).enable();
    return json({ url: publicPath(locale, previewPathOf(ref, locale, { catalog, blog })) });
  });
}

/** Turns the preview off (the banner's «Thoát xem trước»). */
export async function DELETE(request: Request) {
  const auth = await requireApiUser(request, ["content", "edit"]);
  if (!auth.ok) return auth.response;

  return handle(async () => {
    (await draftMode()).disable();
    return noContent();
  });
}
