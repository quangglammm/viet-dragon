"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageIcon, Loader2, Search, Video } from "lucide-react";
import { Modal } from "@/components/admin/modal";
import { Notice } from "@/components/admin/notice";
import { BUTTON_SECONDARY, INPUT_CLASS } from "@/components/admin/page-parts";
import { createContentApi, type MediaRow } from "@/lib/content/editor/api";
import { MEDIA_PAGE_SIZE } from "@/lib/content/media-limits";
import { cn } from "@/lib/utils";
import { FieldShell, useFieldFrame, type FieldProps } from "./field-shell";

// Image fields. The value is the file's storage key (`images/hero/a.webp`); the file is served at `/<key>`.
// Uploading new files is Phase 5, so the picker only chooses among the files the library already holds.

export const mediaUrl = (key: string): string => `/${key}`;

function Thumbnail({ mediaKey, kind, size }: Readonly<{ mediaKey: string; kind?: MediaRow["kind"]; size: number }>) {
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

type Loaded = { key: string; items: MediaRow[]; hasMore: boolean; folders: { folder: string; count: number }[]; error: string | null };

export function MediaPickerDialog({ imageOnly, current, onPick, onClose }: Readonly<PickerProps>) {
  const api = useMemo(() => createContentApi(), []);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState("");
  const [offset, setOffset] = useState(0);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const requestKey = `${query}|${folder}|${offset}|${imageOnly}`;

  useEffect(() => {
    let cancelled = false;
    void api.media({ q: query, folder, offset, limit: MEDIA_PAGE_SIZE, kind: imageOnly ? "image" : undefined }).then((result) => {
      if (cancelled) return;
      setLoaded(result.ok ? { key: requestKey, ...result.data, error: null } : { key: requestKey, items: [], hasMore: false, folders: [], error: result.problem.message });
    });
    return () => {
      cancelled = true;
    };
  }, [api, query, folder, offset, imageOnly, requestKey]);

  const loading = loaded?.key !== requestKey;
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setOffset(0);
    setQuery(search.trim());
  };

  return (
    <Modal title="Chọn ảnh" description={imageOnly ? "Chỉ ảnh (không nhận video)." : "Ảnh hoặc video trong thư viện."} size="lg" onClose={onClose}>
      <form onSubmit={submit} className="mb-3 flex flex-wrap gap-2">
        <div className="relative min-w-52 flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo tên tệp…" aria-label="Tìm theo tên tệp" className={cn(INPUT_CLASS, "pl-9")} />
        </div>
        <select value={folder} onChange={(event) => { setOffset(0); setFolder(event.target.value); }} aria-label="Thư mục" className={cn(INPUT_CLASS, "w-auto")}>
          <option value="">Tất cả thư mục</option>
          {(loaded?.folders ?? []).map((entry) => (
            <option key={entry.folder} value={entry.folder}>{entry.folder} ({entry.count})</option>
          ))}
        </select>
        <button type="submit" className={BUTTON_SECONDARY}>Tìm</button>
      </form>

      {loaded?.error && <Notice tone="error">{loaded.error}</Notice>}
      {loading && <div className="flex h-40 items-center justify-center text-slate-400"><Loader2 className="animate-spin" size={22} aria-label="Đang tải" /></div>}
      {!loading && loaded && loaded.items.length === 0 && !loaded.error && <p className="py-10 text-center text-xs font-semibold text-slate-400">Không có tệp nào khớp.</p>}
      {!loading && loaded && loaded.items.length > 0 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {loaded.items.map((item) => (
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
        <button type="button" disabled={offset === 0 || loading} onClick={() => setOffset(Math.max(0, offset - MEDIA_PAGE_SIZE))} className={BUTTON_SECONDARY}><ChevronLeft size={14} aria-hidden /> Trước</button>
        <span className="text-[11px] font-semibold text-slate-400">Từ {offset + 1}</span>
        <button type="button" disabled={!loaded?.hasMore || loading} onClick={() => setOffset(offset + MEDIA_PAGE_SIZE)} className={BUTTON_SECONDARY}>Sau <ChevronRight size={14} aria-hidden /></button>
      </div>
    </Modal>
  );
}
