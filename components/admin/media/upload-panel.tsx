"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Clock, Loader2, UploadCloud, XCircle } from "lucide-react";
import { AdminCard, BUTTON_PRIMARY, BUTTON_SECONDARY } from "@/components/admin/page-parts";
import { ACCEPT_ATTRIBUTE, formatBytes, type UploadEntry } from "@/lib/content/editor/media-upload";
import { cn } from "@/lib/utils";

// Where an editor drops pictures: a button and a drop zone, then one line per file saying what became of it. The checks and the queue are
// lib/content/editor/media-upload.ts; what is stored is decided by the server (lib/media).

type UploadPanelProps = {
  entries: readonly UploadEntry[];
  busy: boolean;
  progress: { finished: number; total: number };
  /** The largest picture the server takes, once it has said. */
  maxBytes: number | undefined;
  onFiles: (files: File[]) => void;
  onClear: () => void;
};

function EntryLine({ entry }: Readonly<{ entry: UploadEntry }>) {
  const tone = entry.status === "failed" ? "text-rose-700" : entry.status === "done" ? "text-emerald-700" : "text-slate-500";
  return (
    <li className={cn("flex items-start gap-2 py-1.5 text-xs font-semibold", tone)}>
      {entry.status === "waiting" && <Clock size={14} className="mt-px shrink-0" aria-label="Đang chờ" />}
      {entry.status === "uploading" && <Loader2 size={14} className="mt-px shrink-0 animate-spin" aria-label="Đang tải lên" />}
      {entry.status === "done" && <CheckCircle2 size={14} className="mt-px shrink-0" aria-label="Xong" />}
      {entry.status === "failed" && <XCircle size={14} className="mt-px shrink-0" aria-label="Lỗi" />}
      <span className="min-w-0 flex-1 break-words">
        {entry.status === "failed" ? (
          entry.message
        ) : (
          <>
            <span className="text-slate-800">{entry.name}</span> <span className="font-normal text-slate-400">({formatBytes(entry.size)})</span>
            {entry.status === "done" && <span> — {entry.existing ? "ảnh này đã có trong thư viện, không lưu thêm bản nữa." : "đã thêm vào thư viện."}</span>}
          </>
        )}
      </span>
    </li>
  );
}

export function UploadPanel({ entries, busy, progress, maxBytes, onFiles, onClear }: Readonly<UploadPanelProps>) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const take = (list: FileList | null) => {
    if (list && list.length > 0) onFiles([...list]);
    if (input.current) input.current.value = "";
  };

  return (
    <AdminCard title="Tải ảnh lên" description={`JPG, PNG, WebP, AVIF hoặc GIF${maxBytes ? `, tối đa ${formatBytes(maxBytes)} mỗi ảnh` : ""}. Ảnh được chuyển sang WebP, thu nhỏ nếu cạnh dài quá 3000 px và xóa thông tin vị trí (GPS).`} className="mb-5">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          take(event.dataTransfer.files);
        }}
        className={cn("flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors", dragging ? "border-brand-primary bg-brand-primary/5" : "border-slate-200")}
      >
        <UploadCloud size={28} className="text-slate-300" aria-hidden />
        <p className="text-xs font-semibold text-slate-500">Kéo ảnh vào đây, hoặc</p>
        <input ref={input} type="file" multiple accept={ACCEPT_ATTRIBUTE} onChange={(event) => take(event.target.files)} className="hidden" aria-label="Chọn ảnh để tải lên" />
        <button type="button" onClick={() => input.current?.click()} className={BUTTON_PRIMARY}>
          Chọn ảnh từ máy
        </button>
      </div>

      {entries.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between gap-3">
            <p role="status" className="text-xs font-black text-slate-700">
              {busy ? `Đang tải ${Math.min(progress.finished + 1, progress.total)}/${progress.total}…` : `Đã xử lý ${progress.finished}/${progress.total} ảnh.`}
            </p>
            {!busy && (
              <button type="button" onClick={onClear} className={BUTTON_SECONDARY}>
                Xóa danh sách
              </button>
            )}
          </div>
          <ul className="mt-2 divide-y divide-slate-100">
            {entries.map((entry) => (
              <EntryLine key={entry.id} entry={entry} />
            ))}
          </ul>
        </div>
      )}
    </AdminCard>
  );
}
