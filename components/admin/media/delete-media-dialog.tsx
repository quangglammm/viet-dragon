"use client";

import { useMemo, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Modal } from "@/components/admin/modal";
import { Notice } from "@/components/admin/notice";
import { BUTTON_DANGER, BUTTON_SECONDARY } from "@/components/admin/page-parts";
import { Thumbnail } from "@/components/admin/content/media-field";
import { createContentApi, type MediaRow } from "@/lib/content/editor/api";

// Asks before an upload is removed, and shows the server's refusal when something still uses it («đang được dùng (n mục đang hiển thị,
// m bản nháp)») — the dialog stays open then, so the editor reads it where they clicked.

type DeleteMediaDialogProps = {
  item: MediaRow;
  onClose: () => void;
  onDeleted: () => void;
};

export function DeleteMediaDialog({ item, onClose, onDeleted }: Readonly<DeleteMediaDialogProps>) {
  const api = useMemo(() => createContentApi(), []);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const remove = async () => {
    setBusy(true);
    setProblem(null);
    const result = await api.deleteMedia(item.key);
    setBusy(false);
    if (result.ok) onDeleted();
    else setProblem(result.problem.message);
  };

  return (
    <Modal title="Xóa ảnh khỏi thư viện?" description="Ảnh bị xóa khỏi máy chủ, không khôi phục được." locked={busy} onClose={onClose}>
      <div className="mb-4 flex items-center gap-3 rounded-2xl border border-slate-200 p-3">
        <Thumbnail mediaKey={item.key} size={64} />
        <p className="min-w-0 break-all text-xs font-semibold text-slate-700">{item.key}</p>
      </div>
      {problem && (
        <Notice tone="error" className="mb-4">
          {problem}
        </Notice>
      )}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} disabled={busy} className={BUTTON_SECONDARY}>
          Giữ lại
        </button>
        <button type="button" onClick={() => void remove()} disabled={busy} className={BUTTON_DANGER}>
          {busy ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <Trash2 size={14} aria-hidden />} Xóa ảnh
        </button>
      </div>
    </Modal>
  );
}
