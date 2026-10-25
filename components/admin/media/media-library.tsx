"use client";

import { useCallback, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Loader2, Search, Trash2 } from "lucide-react";
import { Thumbnail, mediaUrl } from "@/components/admin/content/media-field";
import { Notice } from "@/components/admin/notice";
import { AdminCard, BUTTON_SECONDARY, INPUT_CLASS } from "@/components/admin/page-parts";
import type { MediaRow } from "@/lib/content/editor/api";
import { formatBytes } from "@/lib/content/editor/media-upload";
import { MEDIA_PAGE_SIZE } from "@/lib/content/media-limits";
import { formatAdminDateTime } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import { DeleteMediaDialog } from "./delete-media-dialog";
import { UploadPanel } from "./upload-panel";
import { useMediaPage, type MediaFilters } from "./use-media-page";
import { useMediaUpload } from "./use-media-upload";

// The library page: upload pictures, find them again, take an unused upload away. A picture is USED by putting its key in a document, which the
// editors do through the picker; this page never edits a document.

type MediaLibraryProps = {
  /** `media:upload` — editors and admins. */
  canUpload: boolean;
  /** `media:delete` — admins. */
  canDelete: boolean;
};

const SOURCE_LABEL: Record<MediaRow["source"], string> = { upload: "Đã tải lên", static: "Có sẵn của website" };

function Tile({ item, canDelete, onDelete }: Readonly<{ item: MediaRow; canDelete: boolean; onDelete: (item: MediaRow) => void }>) {
  const isUpload = item.source === "upload";
  return (
    <li className="flex flex-col rounded-2xl border border-slate-200 bg-white p-2">
      <Thumbnail mediaKey={item.key} kind={item.kind} size={160} />
      <p className="mt-2 truncate text-[11px] font-black text-slate-800" title={item.key}>
        {item.key.split("/").pop()}
      </p>
      <p className="text-[10px] font-semibold text-slate-400">
        {item.width && item.height ? `${item.width}×${item.height} · ` : ""}
        {formatBytes(item.bytes)}
      </p>
      {isUpload && <p className="text-[10px] font-semibold text-slate-400">{formatAdminDateTime(item.createdAt)}</p>}
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-bold", isUpload ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-500")}>{SOURCE_LABEL[item.source]}</span>
        <a href={mediaUrl(item.key)} target="_blank" rel="noopener noreferrer" className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-brand-primary hover:underline">
          Mở ảnh <ExternalLink size={10} aria-hidden />
        </a>
      </div>
      {isUpload && canDelete && (
        <button type="button" onClick={() => onDelete(item)} className={cn(BUTTON_SECONDARY, "mt-2 w-full text-rose-600")}>
          <Trash2 size={12} aria-hidden /> Xóa
        </button>
      )}
    </li>
  );
}

export function MediaLibrary({ canUpload, canDelete }: Readonly<MediaLibraryProps>) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<MediaFilters>({ q: "", folder: "", source: "upload", offset: 0 });
  const [deleting, setDeleting] = useState<MediaRow | null>(null);
  const { page, error, loading, reload } = useMediaPage(filters);

  // Something just arrived: show the newest uploads from the top, whatever the filters were.
  const onUploaded = useCallback(() => {
    setFilters((current) => ({ ...current, q: "", folder: "", source: "upload", offset: 0 }));
    setSearch("");
    reload();
  }, [reload]);
  const upload = useMediaUpload({ maxBytes: page?.maxUploadBytes, onUploaded });

  const change = (next: Partial<MediaFilters>) => setFilters((current) => ({ ...current, offset: 0, ...next }));

  return (
    <>
      {canUpload && <UploadPanel entries={upload.entries} busy={upload.busy} progress={upload.progress} maxBytes={page?.maxUploadBytes} onFiles={upload.add} onClear={upload.clear} />}

      <AdminCard>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            change({ q: search.trim() });
          }}
          className="mb-4 flex flex-wrap gap-2"
        >
          <div className="relative min-w-52 flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo tên tệp…" aria-label="Tìm theo tên tệp" className={cn(INPUT_CLASS, "pl-9")} />
          </div>
          <select value={filters.source} onChange={(event) => change({ source: event.target.value as MediaFilters["source"] })} aria-label="Nguồn ảnh" className={cn(INPUT_CLASS, "w-auto")}>
            <option value="upload">Đã tải lên</option>
            <option value="">Tất cả ảnh</option>
            <option value="static">Có sẵn của website</option>
          </select>
          <select value={filters.folder} onChange={(event) => change({ folder: event.target.value })} aria-label="Thư mục" className={cn(INPUT_CLASS, "w-auto")}>
            <option value="">Tất cả thư mục</option>
            {(page?.folders ?? []).map((entry) => (
              <option key={entry.folder} value={entry.folder}>
                {entry.folder} ({entry.count})
              </option>
            ))}
          </select>
          <button type="submit" className={BUTTON_SECONDARY}>
            Tìm
          </button>
        </form>

        {error && <Notice tone="error">{error}</Notice>}
        {loading && (
          <div className="flex h-40 items-center justify-center text-slate-400">
            <Loader2 className="animate-spin" size={22} aria-label="Đang tải" />
          </div>
        )}
        {!loading && page && page.items.length === 0 && !error && (
          <p className="py-10 text-center text-xs font-semibold text-slate-400">
            {filters.source === "upload" && !filters.q && !filters.folder ? "Chưa có ảnh nào được tải lên. Bấm «Chọn ảnh từ máy» hoặc kéo ảnh vào khung phía trên." : "Không có ảnh nào khớp."}
          </p>
        )}
        {!loading && page && page.items.length > 0 && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {page.items.map((item) => (
              <Tile key={item.key} item={item} canDelete={canDelete} onDelete={setDeleting} />
            ))}
          </ul>
        )}

        <div className="mt-5 flex items-center justify-between">
          <button type="button" disabled={filters.offset === 0 || loading} onClick={() => setFilters((current) => ({ ...current, offset: Math.max(0, current.offset - MEDIA_PAGE_SIZE) }))} className={BUTTON_SECONDARY}>
            <ChevronLeft size={14} aria-hidden /> Trước
          </button>
          <span className="text-[11px] font-semibold text-slate-400">Từ {filters.offset + 1}</span>
          <button type="button" disabled={!page?.hasMore || loading} onClick={() => setFilters((current) => ({ ...current, offset: current.offset + MEDIA_PAGE_SIZE }))} className={BUTTON_SECONDARY}>
            Sau <ChevronRight size={14} aria-hidden />
          </button>
        </div>
      </AdminCard>

      {deleting && (
        <DeleteMediaDialog
          item={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={() => {
            setDeleting(null);
            reload();
          }}
        />
      )}
    </>
  );
}
