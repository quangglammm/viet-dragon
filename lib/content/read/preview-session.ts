import { draftMode } from "next/headers";
import { cache } from "react";
import { getSessionUser } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import { loadPreviewOverlay, type PreviewOverlay } from "./preview";

// Who sees the drafts. Draft Mode's cookie (`__prerender_bypass`) is only a switch: it carries no identity and anyone who was ever handed
// one could replay it, so every request that has it is checked again — a signed-in editor, past the forced password change — and
// anything short of that reads the published site. Once per request (`cache`), because the layout, the page and its metadata all ask.

export const PREVIEW_PERMISSION = ["content", "edit"] as const;

/** The drafts to lay over the published site for THIS request, or null: not in Draft Mode, not signed in, or not allowed to edit. */
export const previewOverlay = cache(async (): Promise<PreviewOverlay | null> => {
  if (!(await draftMode()).isEnabled) return null;
  const user = await getSessionUser();
  if (!user || user.mustChangePassword || !hasPermission(user.role, PREVIEW_PERMISSION)) return null;
  return loadPreviewOverlay(getDb());
});
