"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, FilePen, Loader2, Rocket, Trash2 } from "lucide-react";
import { Modal } from "@/components/admin/modal";
import { Notice } from "@/components/admin/notice";
import { BUTTON_PRIMARY, BUTTON_SECONDARY, PageHeader } from "@/components/admin/page-parts";
import { completeness } from "@/lib/content/editor/completeness";
import { createContentApi, type Document, type DraftPayload, type Ref } from "@/lib/content/editor/api";
import { isWithin } from "@/lib/content/editor/paths";
import { ENTITY_META, listUrl } from "@/lib/content/editor/entity-meta";
import { canPublish as isPublishable, describeSave } from "@/lib/content/editor/session";
import type { Vocabulary } from "@/lib/content/editor/vocabulary";
import type { Issue } from "@/lib/content/errors";
import type { LocaleCode } from "@/lib/content/schemas";
import { formatAdminTime } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import { DangerCard } from "./danger-card";
import { EditorProvider, type FocusRequest, type ReleasableAlias } from "./editor-context";
import { FORMS } from "./forms";
import { HistoryPanel } from "./history-panel";
import { IssueList, languageOfPath } from "./issue-list";
import { LanguageTabs } from "./language-tabs";
import { PublishDialog } from "./publish-dialog";
import { useDraftSession } from "./use-draft-session";

const UUID_VALUE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
/** One named tab for every preview, so the next one replaces the page instead of piling up tabs. */
const PREVIEW_TAB = "vd-preview";

type EntityEditorProps = {
  entity: Ref;
  label: string;
  /** null = never published: the entity exists only as this draft. */
  live: { version: number; document: Document } | null;
  initialDraft: DraftPayload | null;
  vocab: Vocabulary;
  /** Account id → name, for the history. */
  authors: Record<string, string>;
  canPublish: boolean;
  canDelete: boolean;
};

export function EntityEditor({ entity, label, live, initialDraft, vocab, authors, canPublish, canDelete }: Readonly<EntityEditorProps>) {
  const router = useRouter();
  const api = useMemo(() => createContentApi(), []);
  const { session, problem, edit, adopt, closeDraft, startEditing, reload, overwrite } = useDraftSession({ entity, live: live?.document ?? null, initialDraft });
  const [language, setLanguage] = useState<LocaleCode>("vi");
  const [focus, setFocus] = useState<FocusRequest | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [releasing, setReleasing] = useState<{ language: LocaleCode; alias: ReleasableAlias } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const meta = ENTITY_META[entity.type];
  const Form = FORMS[entity.type];
  const coverage = useMemo(() => completeness(session.document), [session.document]);
  // Records the editor already knows by id (a menu's products, shapes and options), so a diff can say «Tờ rơi» instead of «#4f9729d5».
  const names = useMemo(() => new Map(Object.values(vocab).flatMap((options) => options.filter((option) => UUID_VALUE.test(option.value)).map((option) => [option.value, option.label] as const))), [vocab]);

  if (!Form) return null;

  const goToIssue = (issue: Issue) => {
    const issueLanguage = languageOfPath(issue.path);
    if (issueLanguage) setLanguage(issueLanguage);
    setFocus((previous) => ({ path: issue.path, nonce: (previous?.nonce ?? 0) + 1 }));
    // The field of another language, or in another tab of the form, is drawn after the change.
    setTimeout(() => {
      // An issue about a whole language row (`i18n.en`) lands on that row's first field; `shapes[1]` does not match `shapes[10]`.
      const target = [...document.querySelectorAll<HTMLElement>("[data-path]")].find((node) => node.dataset.path !== undefined && isWithin(node.dataset.path, issue.path));
      target?.scrollIntoView({ block: "center", behavior: "smooth" });
      target?.querySelector<HTMLElement>("input, textarea, select, button")?.focus({ preventScroll: true });
    }, 80);
  };

  const finish = (outcome: "published" | "discarded") => {
    setPublishing(false);
    setDiscarding(false);
    // A draft that was never published leaves nothing behind once discarded: back to the list.
    if (outcome === "discarded" && !live) router.push(listUrl(entity.type));
    else {
      // A discard changes nothing the page's server data shows when the draft was opened here, so the session is reset locally;
      // a publish moves the version, which remounts the editor with fresh data.
      if (outcome === "discarded" && live) closeDraft(live.document);
      router.refresh();
    }
  };

  const discard = async () => {
    setBusy(true);
    const result = await api.discardDraft(entity);
    setBusy(false);
    if (result.ok) finish("discarded");
    else setMessage(result.problem.message);
  };

  const release = async () => {
    if (!releasing) return;
    setBusy(true);
    const result = await api.releaseAlias(entity, { locale: releasing.language, slug: releasing.alias.slug, ...(releasing.alias.category ? { category: releasing.alias.category } : {}) });
    setBusy(false);
    setReleasing(null);
    if (result.ok) router.refresh();
    else setMessage(result.problem.message);
  };

  // The tab is opened here, inside the click: after the request it would be a pop-up and the browser would block it.
  const preview = async () => {
    const tab = window.open("about:blank", PREVIEW_TAB);
    if (!tab) return setMessage("Trình duyệt đã chặn cửa sổ mới. Hãy cho phép cửa sổ bật lên cho trang này rồi thử lại.");
    setMessage(null);
    setPreviewing(true);
    const result = await api.previewDraft(entity, language);
    setPreviewing(false);
    if (result.ok) {
      tab.location.href = result.data.url;
      tab.focus();
    } else {
      tab.close();
      // The issues themselves are already listed below the header, so the notice says what to do about them.
      setMessage(result.problem.code === "INVALID" ? "Bản nháp chưa hợp lệ nên chưa xem trước được. Hãy sửa các lỗi trong danh sách bên dưới." : result.problem.message);
    }
  };

  const status = (session.document.status as string | undefined) ?? "published";
  // Letting an old URL go is its own publish: only from the live view (no open draft to go stale), and only for those who may publish.
  const canRelease = entity.type === "product" && !session.editing && canPublish;
  const publishable = canPublish && isPublishable(session);
  // The preview shows what is SAVED, so it waits for the autosave (about a second after the last keystroke).
  const savedForPreview = session.draftVersion !== null && (session.save === "clean" || session.save === "saved");
  const saveText = describeSave(session, formatAdminTime);

  return (
    <>
      <PageHeader
        icon={<FilePen size={15} />}
        eyebrow={meta.label}
        title={label}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {!session.editing && (
              <button type="button" onClick={() => void startEditing()} className={BUTTON_PRIMARY}>
                <FilePen size={14} aria-hidden /> Chỉnh sửa
              </button>
            )}
            {session.editing && (
              <>
                <button
                  type="button"
                  disabled={!savedForPreview || previewing}
                  title={savedForPreview ? "Mở website với bản nháp này (ngôn ngữ đang chọn)." : "Đang chờ lưu bản nháp…"}
                  onClick={() => void preview()}
                  className={BUTTON_SECONDARY}
                >
                  {previewing ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <Eye size={14} aria-hidden />} Xem trước
                </button>
                <button type="button" onClick={() => setDiscarding(true)} className={BUTTON_SECONDARY}>
                  <Trash2 size={14} aria-hidden /> Hủy bản nháp
                </button>
                <button
                  type="button"
                  disabled={!publishable}
                  title={canPublish ? (publishable ? undefined : "Cần lưu xong và bổ sung đủ nội dung trước khi xuất bản.") : "Bạn không có quyền xuất bản."}
                  onClick={() => setPublishing(true)}
                  className={BUTTON_PRIMARY}
                >
                  <Rocket size={14} aria-hidden /> Xuất bản…
                </button>
              </>
            )}
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px] font-bold">
        <span className={cn("rounded-lg px-2 py-1", live ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800")}>{live ? `Đã xuất bản · phiên bản ${live.version}` : "Chưa xuất bản"}</span>
        {session.editing && <span className="rounded-lg bg-purple-100 px-2 py-1 text-purple-700">Đang có bản nháp</span>}
        {status === "archived" && <span className="rounded-lg bg-slate-200 px-2 py-1 text-slate-700">Đã lưu trữ</span>}
        {session.restoredFrom !== null && <span className="rounded-lg bg-sky-100 px-2 py-1 text-sky-700">Khôi phục từ phiên bản {session.restoredFrom}</span>}
        <span role="status" aria-live="polite" className="text-slate-500">{saveText}</span>
        {session.save === "saving" && <Loader2 size={12} className="animate-spin text-slate-400" aria-hidden />}
      </div>

      {!session.editing && !problem && <Notice tone="info" className="mb-4">Đang xem nội dung đã xuất bản. Bấm «Chỉnh sửa» để tạo bản nháp; website không đổi cho đến khi bạn xuất bản.</Notice>}
      {(problem || message) && <Notice tone="error" className="mb-4">{problem?.message ?? message}</Notice>}
      {session.save === "error" && session.problem && <Notice tone="error" className="mb-4">{session.problem.message}</Notice>}
      {session.save === "conflict" && (
        <Notice tone="warning" className="mb-4">
          <p className="font-black">Người khác vừa lưu bản nháp này, hoặc bản nháp không còn nữa.</p>
          <p className="mt-1 font-normal">Các thay đổi của bạn chưa được lưu. Hãy tải bản nháp mới nhất (bạn sẽ mất phần vừa gõ), hoặc giữ bản của bạn và ghi đè lên bản kia.</p>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => void reload()} className={BUTTON_SECONDARY}>Tải bản nháp mới nhất</button>
            <button type="button" onClick={() => void overwrite()} className={BUTTON_SECONDARY}>Giữ bản của tôi, ghi đè</button>
          </div>
        </Notice>
      )}

      <div className="sticky top-0 z-10 -mx-1 mb-4 bg-[#f4f6fb]/95 px-1 py-2 backdrop-blur-xs dark:bg-[#080526]/95">
        <LanguageTabs active={language} completeness={meta.noCoverage ? undefined : coverage} onChange={setLanguage} />
      </div>

      <EditorProvider type={entity.type} document={session.document} baseline={live?.document ?? null} focus={focus} onReleaseAlias={canRelease ? (aliasLanguage, alias) => setReleasing({ language: aliasLanguage, alias }) : undefined} language={language} readOnly={!session.editing} issues={session.issues} vocab={vocab} onChange={edit}>
        <div className="space-y-5">
          {session.editing && <IssueList type={entity.type} issues={session.issues} onGo={goToIssue} />}
          <Form />
          <HistoryPanel entity={entity} authors={authors} current={session.document} hasOpenDraft={session.editing} onRestored={adopt} names={names} />
          {live && meta.deletable && <DangerCard entity={entity} label={label} canDelete={canDelete} />}
        </div>
      </EditorProvider>

      {publishing && session.draftVersion !== null && (
        <PublishDialog entity={entity} draftVersion={session.draftVersion} issueCount={session.issues.length} onClose={() => setPublishing(false)} onDone={finish} onReload={() => { setPublishing(false); void reload(); }} names={names} />
      )}
      {releasing && (
        <Modal title="Gỡ đường dẫn cũ?" description="Địa chỉ này sẽ không còn mở được nữa: các liên kết đã chia sẻ hoặc đã được Google lưu sẽ báo lỗi 404." locked={busy} onClose={() => setReleasing(null)}>
          <p className="mb-4 break-all rounded-xl bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700">
            ({releasing.language}) {releasing.alias.category ? `${releasing.alias.category}/` : ""}{releasing.alias.slug}
          </p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setReleasing(null)} disabled={busy} className={BUTTON_SECONDARY}>Giữ lại</button>
            <button type="button" onClick={() => void release()} disabled={busy} className={BUTTON_PRIMARY}>
              {busy && <Loader2 size={14} className="animate-spin" aria-hidden />} Gỡ đường dẫn
            </button>
          </div>
        </Modal>
      )}
      {discarding && (
        <Modal title="Hủy bản nháp?" description="Mọi thay đổi chưa xuất bản trong bản nháp sẽ mất. Nội dung đang hiển thị trên website không bị ảnh hưởng." locked={busy} onClose={() => setDiscarding(false)}>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setDiscarding(false)} disabled={busy} className={BUTTON_SECONDARY}>Giữ bản nháp</button>
            <button type="button" onClick={() => void discard()} disabled={busy} className={BUTTON_PRIMARY}>
              {busy && <Loader2 size={14} className="animate-spin" aria-hidden />} Hủy bản nháp
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
