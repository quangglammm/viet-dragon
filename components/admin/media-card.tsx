"use client";

import Image from "next/image";
import {
  Copy,
  Check,
  Play,
  ExternalLink,
  Trash2,
  CheckSquare,
  Square,
  AlertCircle,
} from "lucide-react";
import type { MediaAsset } from "@/lib/content-store";

interface MediaCardProps {
  asset: MediaAsset;
  isSelected: boolean;
  onToggleSelect: (url: string) => void;
  onPreview: (asset: MediaAsset) => void;
  onDelete: (asset: MediaAsset) => void;
  onCopy: (url: string) => void;
  isCopied: boolean;
  formatFileSize: (bytes: number) => string;
}

export function MediaCard({
  asset,
  isSelected,
  onToggleSelect,
  onPreview,
  onDelete,
  onCopy,
  isCopied,
  formatFileSize,
}: Readonly<MediaCardProps>) {
  const isVideo = asset.type === "video";
  const isUsed = Boolean(asset.usedIn && asset.usedIn.length > 0);

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white shadow-xs transition-all ${
        isSelected
          ? "border-brand-primary ring-2 ring-brand-primary/30 shadow-md scale-[0.99]"
          : "border-slate-200/80 hover:border-brand-primary/50 hover:shadow-lg"
      }`}
    >
      {/* Checkbox selector button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelect(asset.url);
        }}
        title={isSelected ? "Bỏ chọn tệp này" : "Chọn tệp này"}
        className={`absolute left-2.5 top-2.5 z-20 flex h-7 w-7 items-center justify-center rounded-xl backdrop-blur-md transition-all cursor-pointer shadow-md ${
          isSelected
            ? "bg-brand-primary text-white scale-105"
            : "bg-black/40 text-white hover:bg-black/60 opacity-0 group-hover:opacity-100"
        }`}
      >
        {isSelected ? (
          <CheckSquare size={16} strokeWidth={2.5} />
        ) : (
          <Square size={16} strokeWidth={2} />
        )}
      </button>

      {/* Media Preview Box */}
      <div
        onClick={() => onPreview(asset)}
        className="relative aspect-square w-full bg-slate-100 overflow-hidden cursor-pointer flex items-center justify-center"
      >
        {isVideo ? (
          <div className="relative h-full w-full bg-slate-900 flex flex-col items-center justify-center text-white">
            <video
              src={asset.url}
              muted
              playsInline
              className="h-full w-full object-cover opacity-75"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary text-white shadow-lg group-hover:scale-110 transition-transform">
                <Play size={18} className="ml-0.5" />
              </span>
            </div>
          </div>
        ) : (
          <Image
            src={asset.url}
            alt={asset.filename}
            fill
            sizes="(max-width: 768px) 50vw, 200px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}



        {/* Size Badge */}
        <span className="absolute right-2 top-2.5 rounded-md bg-white text-black px-1.5 py-0.5 text-[9px] font-mono font-extrabold shadow-xs border border-slate-200/80 z-10">
          {formatFileSize(asset.size)}
        </span>

        {/* In-Use pill indicator */}
        {isUsed && (
          <span
            title={`Đang dùng trên web: ${asset.usedIn?.join(", ")}`}
            className="absolute bottom-2 left-2 z-10 flex items-center gap-1 rounded-md bg-amber-500/90 text-white px-1.5 py-0.5 text-[9px] font-extrabold shadow-xs backdrop-blur-xs"
          >
            <AlertCircle size={10} />
            <span>Đang dùng ({asset.usedIn?.length})</span>
          </span>
        )}
      </div>

      {/* Info & Action Buttons */}
      <div className="p-3 bg-white">
        <p
          title={asset.filename}
          className="truncate text-xs font-bold text-slate-800 group-hover:text-brand-primary transition-colors"
        >
          {asset.filename}
        </p>


        <div className="mt-2.5 flex items-center gap-1.5">
          {/* Copy button */}
          <button
            type="button"
            onClick={() => onCopy(asset.url)}
            className={`flex-1 flex items-center justify-center gap-1 rounded-xl py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
              isCopied
                ? "bg-emerald-500 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-brand-primary hover:text-white"
            }`}
          >
            {isCopied ? (
              <>
                <Check size={12} strokeWidth={3} />
                <span>Đã chép</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>Sao chép</span>
              </>
            )}
          </button>

          {/* Full preview */}
          <button
            type="button"
            onClick={() => onPreview(asset)}
            title="Xem toàn màn hình"
            className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <ExternalLink size={13} />
          </button>

          {/* Delete single asset button */}
          <button
            type="button"
            onClick={() => onDelete(asset)}
            title="Xóa tệp tin này"
            className="p-1.5 rounded-xl bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
