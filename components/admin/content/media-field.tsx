"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageIcon, Loader2, Search, UploadCloud, Video } from "lucide-react";
import { Modal } from "@/components/admin/modal";
import { Notice } from "@/components/admin/notice";
import { useMediaPage, type MediaFilters } from "@/components/admin/media/use-media-page";
import { useMediaUpload } from "@/components/admin/media/use-media-upload";
import { BUTTON_PRIMARY, BUTTON_SECONDARY, INPUT_CLASS } from "@/components/admin/page-parts";
import type { MediaRow } from "@/lib/content/editor/api";
import { ACCEPT_ATTRIBUTE } from "@/lib/content/editor/media-upload";
import { MEDIA_PAGE_SIZE } from "@/lib/content/media-limits";
import { cn } from "@/lib/utils";
import { useEditor } from "./editor-context";
import { FieldShell, useFieldFrame, type FieldProps } from "./field-shell";

// Image fields. The value is the file's storage key (`images/hero/a.webp`, `uploads/2026/poster-1a2b3c4d.webp`); the file is served at `/<key>`.
// The picker chooses among the files the library holds, and — for a user who may upload — adds a new one and fills the slot with it.

export const mediaUrl = (key: string): string => `/${key}`;

export function Thumbnail({ mediaKey, kind, size }: Readonly<{ mediaKey: string; kind?: MediaRow["kind"]; size: number }>) {
  if (kind === "video" || /\.(mp4|webm|mov)$/i.test(mediaKey)) {
    return (
      <div style={{ width: size, height: size }} className="flex items-center justify-center rounded-xl bg-slate-100 text-slate-400">
        <Video size={size / 3} aria-hidden />
      </div>
    );
  }
  return <Image src={mediaUrl(mediaKey)} alt="" width={size} height={size} unoptimized className="rounded-xl bg-slate-100 object-cover" style={{ width: size, height: size }} />;
}

type MediaFieldProps = FieldProps & {
  /** The slot may be left empty (stored as null). */
  nullable?: boolean;
  /** Only photos: Open Graph images and option photos reject videos. */
  imageOnly?: boolean;
};

export function MediaField({ nullable = true, imageOnly = false, hint, className, ...frameProps }: Readonly<MediaFieldProps>) {
  const frame = useFieldFrame(frameProps);
  const { editor } = frame;
  const value = (editor.read(frameProps.path) as string | null | undefined) || null;
  const [picking, setPicking] = useState(false);

  return (
    <FieldShell frame={frame} hint={hint} className={className}>
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2.5">
        {value ? <Thumbnail mediaKey={value} size={64} /> : <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100 text-slate-300"><ImageIcon size={22} aria-hidden /></div>}
        <div className="min-w-0 flex-1">
          <p id={frame.id} className="truncate text-xs font-semibold text-slate-700">{value ?? "Chưa chọn"}</p>
          {!editor.readOnly && (
            <div className="mt-1.5 flex gap-2">
              <button type="button" onClick={() => setPicking(true)} className={BUTTON_SECONDARY}>{value ? "Đổi" : "Chọn"}</button>
              {value && nullable && (
                <button type="button" onClick={() => editor.change(frameProps.path, null)} className={BUTTON_SECONDARY}>
                  Bỏ chọn
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      {picking && (
        <MediaPickerDialog
          imageOnly={imageOnly}
          current={value}
          onPick={(key) => {
            editor.change(frameProps.path, key);
            setPicking(false);
          }}
          onClose={() => setPicking(false)}
        />
      )}
    </FieldShell>
  );
}

type PickerProps = { imageOnly: boolean; current: string | null; onPick: (key: string) => void; onClose: () => void };

export function MediaPickerDialog({ imageOnly, current, onPick, onClose }: Readonly<PickerProps>) {
  const { canUploadMedia } = useEditor();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<MediaFilters>({ q: "", folder: "", source: "", offset: 0, imageOnly });
  const { page, error, loading } = useMediaPage(filters);
  const fileInput = useRef<HTMLInputElement>(null);
  // A new picture fills the slot at once: the picker closes on it.
  const upload = useMediaUpload({ maxBytes: page?.maxUploadBytes, onUploaded: (item) => onPick(item.key) });
  const last = upload.entries.at(-1);

  const change = (next: Partial<MediaFilters>) => setFilters((previous) => ({ ...previous, offset: 0, ...next }));
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    change({ q: search.trim() });
  };
  const choose = (list: FileList | null) => {
    if (list?.[0]) {
      upload.clear();
      upload.add([list[0]]);
    }
    if (fileInput.current) fileInput.current.value = "";
  };

  return (
    <Modal title="Chọn ảnh" description={imageOnly ? "Chỉ ảnh (không nhận video)." : "Ảnh hoặc video trong thư viện."} size="lg" locked={upload.busy} onClose={onClose}>
      <form onSubmit={submit} className="mb-3 flex flex-wrap gap-2">
        <div className="relative min-w-52 flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo tên tệp…" aria-label="Tìm theo tên tệp" className={cn(INPUT_CLASS, "pl-9")} />
        </div>
        <select value={filters.source} onChange={(event) => change({ source: event.target.value as MediaFilters["source"] })} aria-label="Nguồn ảnh" className={cn(INPUT_CLASS, "w-auto")}>
          <option value="">Tất cả ảnh</option>
          <option value="upload">Đã tải lên</option>
          <option value="static">Có sẵn của website</option>
        </select>
        <select value={filters.folder} onChange={(event) => change({ folder: event.target.value })} aria-label="Thư mục" className={cn(INPUT_CLASS, "w-auto")}>
          <option value="">Tất cả thư mục</option>
          {(page?.folders ?? []).map((entry) => (
            <option key={entry.folder} value={entry.folder}>{entry.folder} ({entry.count})</option>
          ))}
        </select>
        <button type="submit" className={BUTTON_SECONDARY}>Tìm</button>
        {canUploadMedia && (
          <>
            <input ref={fileInput} type="file" accept={ACCEPT_ATTRIBUTE} onChange={(event) => choose(event.target.files)} className="hidden" aria-label="Chọn ảnh để tải lên" />
            <button type="button" disabled={upload.busy} onClick={() => fileInput.current?.click()} className={BUTTON_PRIMARY}>
              {upload.busy ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <UploadCloud size={14} aria-hidden />} Tải ảnh lên
            </button>
          </>
        )}
      </form>

      {last?.status === "failed" && <Notice tone="error" className="mb-3">{last.message}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}
      {loading && <div className="flex h-40 items-center justify-center text-slate-400"><Loader2 className="animate-spin" size={22} aria-label="Đang tải" /></div>}
      {!loading && page && page.items.length === 0 && !error && <p className="py-10 text-center text-xs font-semibold text-slate-400">Không có tệp nào khớp.</p>}
      {!loading && page && page.items.length > 0 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {page.items.map((item) => (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => onPick(item.key)}
                title={item.key}
                className={cn("group w-full cursor-pointer rounded-2xl border p-1.5 text-left transition-colors hover:border-brand-primary", item.key === current ? "border-brand-primary bg-brand-primary/5" : "border-slate-200")}
              >
                <Thumbnail mediaKey={item.key} kind={item.kind} size={96} />
                <p className="mt-1 truncate text-[10px] font-semibold text-slate-500">{item.key.split("/").pop()}</p>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex items-center justify-between">
        <button type="button" disabled={filters.offset === 0 || loading} onClick={() => setFilters((previous) => ({ ...previous, offset: Math.max(0, previous.offset - MEDIA_PAGE_SIZE) }))} className={BUTTON_SECONDARY}><ChevronLeft size={14} aria-hidden /> Trước</button>
        <span className="text-[11px] font-semibold text-slate-400">Từ {filters.offset + 1}</span>
        <button type="button" disabled={!page?.hasMore || loading} onClick={() => setFilters((previous) => ({ ...previous, offset: previous.offset + MEDIA_PAGE_SIZE }))} className={BUTTON_SECONDARY}>Sau <ChevronRight size={14} aria-hidden /></button>
      </div>
    </Modal>
  );
}
