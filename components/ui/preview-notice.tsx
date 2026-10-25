import { ENTITY_META, editorUrl } from "@/lib/content/editor/entity-meta";
import { encodeEntityId } from "@/lib/content/identity";
import type { AppliedDraft, SkippedDraft } from "@/lib/content/read/preview";
import { previewOverlay } from "@/lib/content/read/preview-session";
import { PreviewBanner, type PreviewItem } from "./preview-banner";

// Drawn by the locale layout on every page: nothing unless THIS request is a preview (Draft Mode on and an editor signed in), so the
// cached pages everyone else gets carry no trace of it.

const itemOf = (draft: AppliedDraft | SkippedDraft, note: string | null): PreviewItem => ({
  label: draft.label,
  kind: ENTITY_META[draft.ref.type].label,
  href: editorUrl(draft.ref.type, encodeURIComponent(encodeEntityId(draft.ref.type, draft.ref.id))),
  note,
});

export async function PreviewNotice() {
  const overlay = await previewOverlay();
  if (!overlay) return null;
  return (
    <PreviewBanner
      applied={overlay.applied.map((draft) => itemOf(draft, draft.isNew ? "chưa xuất bản" : null))}
      skipped={overlay.skipped.map((draft) => itemOf(draft, draft.issue))}
    />
  );
}
