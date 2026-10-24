"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/admin/modal";
import { Notice } from "@/components/admin/notice";
import { BUTTON_PRIMARY, BUTTON_SECONDARY, INPUT_CLASS } from "@/components/admin/page-parts";
import type { Change } from "@/lib/content/diff";
import { createContentApi, type ApiProblem, type Ref } from "@/lib/content/editor/api";
import { DiffView } from "./diff-view";

// "Xuất bản": what will change, what is still wrong, and — when somebody else published first — a choice instead of a silent
// merge. Nothing here edits the document; it only publishes the draft the server holds (bound to its `draftVersion`).

type PublishDialogProps = {
  entity: Ref;
  draftVersion: number;
  /** The document's own complaints; publishing is blocked while there are any. */
  issueCount: number;
  onClose: () => void;
  /** The draft was published, or (keeping the live version) discarded: the page must reload. */
  onDone: (outcome: "published" | "discarded") => void;
  /** The server's draft is not the one on screen: reload it. */
  onReload: () => void;
  /** Names for the ids in the diff's paths. */
  names?: ReadonlyMap<string, string>;
};

type Diff = { state: "loading" } | { state: "ready"; changes: Change[] } | { state: "failed"; message: string };

export function PublishDialog({ entity, draftVersion, issueCount, onClose, onDone, onReload, names }: Readonly<PublishDialogProps>) {
  const api = useMemo(() => createContentApi(), []);
  const [diff, setDiff] = useState<Diff>({ state: "loading" });
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<ApiProblem | null>(null);

  useEffect(() => {
    let cancelled = false;
    void api.diff(entity).then((result) => {
      if (!cancelled) setDiff(result.ok ? { state: "ready", changes: result.data.changes } : { state: "failed", message: result.problem.message });
    });
    return () => {
      cancelled = true;
    };
  }, [api, entity]);

  const publish = async (version: number) => {
    setBusy(true);
    setProblem(null);
    const result = await api.publish(entity, version, comment.trim() || undefined);
    setBusy(false);
    if (result.ok) onDone("published");
    else setProblem(result.problem);
  };

  /** "Keep my draft": start it from the live version as it is now, then publish that. */
  const overwrite = async () => {
    setBusy(true);
    const rebased = await api.rebase(entity);
    if (!rebased.ok) {
      setBusy(false);
      setProblem(rebased.problem);
      return;
    }
    await publish(rebased.data.draft.draftVersion);
  };

  const discard = async () => {
    setBusy(true);
    const result = await api.discardDraft(entity);
    setBusy(false);
    if (result.ok) onDone("discarded");
    else setProblem(result.problem);
  };

  const stale = problem?.code === "STALE_BASE";
  const changed = problem?.code === "DRAFT_CHANGED" || problem?.code === "GONE";
  const blocked = issueCount > 0 || diff.state !== "ready" || busy || stale || changed;

  return (
    <Modal title="Xuất bản" description="Các thay đổi dưới đây sẽ hiển thị công khai sau khi xuất bản." size="lg" locked={busy} onClose={onClose}>
      <div className="space-y-4">
        {issueCount > 0 && <Notice tone="warning">Còn {issueCount} chỗ cần bổ sung hoặc sửa trước khi xuất bản. Hãy đóng cửa sổ này và xem danh sách «Cần bổ sung».</Notice>}

        {stale && problem && (
          <Notice tone="warning">
            <p className="font-bold">{problem.message}</p>
            <p className="mt-1">Bên dưới là những gì khác nhau giữa bản đang hiển thị và bản nháp của bạn. Giữ bản nháp sẽ ghi đè lên các thay đổi của người kia.</p>
          </Notice>
        )}
        {changed && problem && <Notice tone="warning">{problem.message}</Notice>}
        {problem && !stale && !changed && (
          <Notice tone="error">
            {problem.message}
            {problem.issues && (
              <ul className="mt-1 list-disc pl-4 font-normal">
                {problem.issues.map((issue) => (
                  <li key={`${issue.path}:${issue.message}`}>{issue.message}</li>
                ))}
              </ul>
            )}
          </Notice>
        )}

        <div>
          <p className="mb-2 text-xs font-black text-slate-700">{stale ? "Khác biệt với bản đang hiển thị" : "Thay đổi sẽ được xuất bản"}</p>
          {diff.state === "loading" && <Loader2 className="animate-spin text-slate-400" size={18} aria-label="Đang tải" />}
          {diff.state === "failed" && <Notice tone="error">{diff.message}</Notice>}
          {diff.state === "ready" && <DiffView type={entity.type} changes={stale && problem?.changes ? problem.changes : diff.changes} names={names} />}
        </div>

        {!stale && !changed && (
          <label className="block text-xs font-bold text-slate-700">
            Ghi chú cho lịch sử (không bắt buộc)
            <input value={comment} maxLength={500} onChange={(event) => setComment(event.target.value)} className={`${INPUT_CLASS} mt-1.5`} placeholder="Ví dụ: đổi giá in một mặt" />
          </label>
        )}

        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
          <button type="button" onClick={onClose} disabled={busy} className={BUTTON_SECONDARY}>Đóng</button>
          {stale && (
            <>
              <button type="button" onClick={() => void discard()} disabled={busy} className={BUTTON_SECONDARY}>Bỏ bản nháp, lấy bản mới</button>
              <button type="button" onClick={() => void overwrite()} disabled={busy} className={BUTTON_PRIMARY}>Giữ bản nháp của tôi và ghi đè</button>
            </>
          )}
          {changed && <button type="button" onClick={onReload} className={BUTTON_PRIMARY}>Tải lại bản nháp</button>}
          {!stale && !changed && (
            <button type="button" onClick={() => void publish(draftVersion)} disabled={blocked} className={BUTTON_PRIMARY}>
              {busy && <Loader2 size={14} className="animate-spin" aria-hidden />} Xuất bản
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
