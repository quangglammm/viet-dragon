import { notFound } from "next/navigation";
import { EntityEditor } from "@/components/admin/content/entity-editor";
import type { Document, DraftPayload } from "@/lib/content/editor/api";
import { ENTITY_META } from "@/lib/content/editor/entity-meta";
import { siteMessageLabel } from "@/lib/content/editor/site-message-labels";
import { listAuthorNames } from "@/lib/content/authors";
import { composeEntity } from "@/lib/content/compose";
import { getDraft } from "@/lib/content/drafts";
import { restoredVersionOf } from "@/lib/content/restore";
import { decodeEntityId, entityTypeFromUrl } from "@/lib/content/identity";
import { listSummaries } from "@/lib/content/summaries";
import { validateSnapshot } from "@/lib/content/validate";
import { loadVocabulary } from "@/lib/content/vocabulary";
import { requireUser } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";

type EditorPageProps = { params: Promise<{ type: string; id: string }> };

/** Server data reaches the client component as plain JSON (dates as ISO strings), the same shape the API answers with. */
const toWire = <T,>(value: unknown): T => JSON.parse(JSON.stringify(value)) as T;

export default async function ContentEditorPage({ params }: Readonly<EditorPageProps>) {
  const user = await requireUser({ permission: ["content", "edit"] });
  const { type: rawType, id: rawId } = await params;
  const type = entityTypeFromUrl(rawType);
  const id = type ? decodeEntityId(type, decodeURIComponent(rawId)) : null;
  if (!type || !id || !ENTITY_META[type].editable) notFound();

  const db = getDb();
  const entity = { type, id };
  const [live, draft] = await Promise.all([composeEntity(db, type, id), getDraft(db, entity)]);
  if (!live && !draft) notFound();

  const initialDraft = draft ? toWire<DraftPayload>({ draft: { ...draft, restoredFrom: restoredVersionOf(draft.note) }, issues: await validateSnapshot(db, type, draft.snapshot) }) : null;
  const label = type === "site_message" ? siteMessageLabel(id) : ((await listSummaries(db, type)).find((row) => row.ref.id === id)?.label ?? id);

  return (
    <EntityEditor
      // A publish, a discard or a restore changes these on the server; the new key makes the editor start again from fresh data.
      key={`${live?.version ?? "new"}:${draft ? "draft" : "live"}`}
      entity={entity}
      label={label}
      live={live ? toWire<{ version: number; document: Document }>({ version: live.version, document: live.document }) : null}
      initialDraft={initialDraft}
      // A menu belongs to one category (its id): it picks among that category's products, shapes and options.
      vocab={await loadVocabulary(db, ENTITY_META[type].vocab, type === "menu" ? { category: id } : {})}
      authors={await listAuthorNames(db)}
      canPublish={hasPermission(user.role, ["content", "publish"])}
      canDelete={hasPermission(user.role, ["content", "delete"])}
      canUploadMedia={hasPermission(user.role, ["media", "upload"])}
    />
  );
}
