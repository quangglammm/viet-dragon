"use client";

import { useMemo, useState } from "react";
import { History, Loader2 } from "lucide-react";
import { AdminCard, BUTTON_SECONDARY } from "@/components/admin/page-parts";
import { Modal } from "@/components/admin/modal";
import { Notice } from "@/components/admin/notice";
import { diffDocuments } from "@/lib/content/diff";
import { createContentApi, type Document, type DraftPayload, type Ref, type RevisionRow } from "@/lib/content/editor/api";
import { formatAdminDateTime } from "@/lib/format-date";
import { DiffView } from "./diff-view";

// Every publish is a revision. Any of them can be compared with what is open now, or opened as a new draft (restore): it is only
// applied when that draft is published.

const ACTION_LABEL: Record<RevisionRow["action"], string> = {
  import: "Nhập dữ liệu gốc",
  create: "Tạo mới",
  update: "Cập nhật",
  archive: "Lưu trữ",
  restore: "Khôi phục",
  delete: "Xóa",
};

type HistoryPanelProps = {
  entity: Ref;
  /** Account id → name, for «bởi …». */
  authors: Record<string, string>;
  /** What the comparison is made against: the draft being edited, or the live document. */
  current: Document;
  /** A draft is open, so another cannot be started from a revision. */
  hasOpenDraft: boolean;
  onRestored: (payload: DraftPayload) => void;
  /** Names for the ids in the comparison's paths. */
  names?: ReadonlyMap<string, string>;
};

export function HistoryPanel({ entity, authors, current, hasOpenDraft, onRestored, names }: Readonly<HistoryPanelProps>) {
  const api = useMemo(() => createContentApi(), []);
  const [rows, setRows] = useState<RevisionRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [comparing, setComparing] = useState<{ version: number; document: Document } | null>(null);
  const [busyVersion, setBusyVersion] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setMessage(null);
    const result = await api.revisions(entity);
    setLoading(false);
    if (result.ok) setRows(result.data.revisions);
    else setMessage(result.problem.message);
  };

  const compare = async (version: number) => {
    setBusyVersion(version);
    const result = await api.revision(entity, version);
    setBusyVersion(null);
    if (result.ok) setComparing({ version, document: result.data.revision.snapshot });
    else setMessage(result.problem.message);
  };

  const restore = async (version: number) => {
    setBusyVersion(version);
    const result = await api.restore(entity, version);
    setBusyVersion(null);
    if (result.ok) onRestored(result.data);
    else setMessage(result.problem.message);
  };

  return (
    <AdminCard
      title="Lịch sử"
      description="Mỗi lần xuất bản là một phiên bản. Khôi phục mở phiên bản cũ thành bản nháp mới; chỉ áp dụng khi bạn xuất bản."
      action={
        rows === null ? (
          <button type="button" onClick={() => void load()} disabled={loading} className={BUTTON_SECONDARY}>
            {loading ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <History size={14} aria-hidden />} Xem lịch sử
          </button>
        ) : undefined
      }
    >
      {message && <Notice tone="error">{message}</Notice>}
      {rows !== null && (
        <ul className="divide-y divide-slate-100">
          {rows.map((row) => (
            <li key={row.version} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800">
                  Phiên bản {row.version} · {ACTION_LABEL[row.action]}
                </p>
                <p className="text-[11px] text-slate-500">
                  {formatAdminDateTime(row.createdAt)}
                  {row.author ? ` · ${authors[row.author] ?? "Tài khoản đã xóa"}` : " · Hệ thống"}
                  {row.comment ? ` · ${row.comment}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => void compare(row.version)} disabled={busyVersion !== null} className={BUTTON_SECONDARY}>So sánh</button>
                <button
                  type="button"
                  onClick={() => void restore(row.version)}
                  disabled={busyVersion !== null || hasOpenDraft}
                  title={hasOpenDraft ? "Hãy xuất bản hoặc hủy bản nháp đang mở trước." : undefined}
                  className={BUTTON_SECONDARY}
                >
                  Khôi phục
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {comparing && (
        <Modal title={`So sánh với phiên bản ${comparing.version}`} description="Từ phiên bản cũ sang nội dung đang mở." size="lg" onClose={() => setComparing(null)}>
          <DiffView type={entity.type} changes={diffDocuments(comparing.document, current)} empty="Giống hệt nội dung đang mở." names={names} />
        </Modal>
      )}
    </AdminCard>
  );
}
