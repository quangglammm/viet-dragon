"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Trash2, AlertTriangle, CheckCircle2, Loader2, Film } from "lucide-react";
import type { MediaAsset } from "@/lib/content-store";

interface MediaDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  targets: MediaAsset[];
  onConfirmDelete: (targets: MediaAsset[]) => Promise<void>;
  formatFileSize: (bytes: number) => string;
}

export function MediaDeleteModal({
  isOpen,
  onClose,
  targets,
  onConfirmDelete,
  formatFileSize,
}: Readonly<MediaDeleteModalProps>) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || targets.length === 0) return null;

  const inUseTargets = targets.filter((t) => t.usedIn && t.usedIn.length > 0);
  const hasInUse = inUseTargets.length > 0;

  const handleConfirm = async () => {
    setDeleting(true);
    setError("");
    try {
      await onConfirmDelete(targets);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi xóa tệp");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 shadow-inner">
              <Trash2 size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                {targets.length === 1
                  ? "Xác nhận xóa 1 tệp tin"
                  : `Xác nhận xóa ${targets.length} tệp tin đã chọn`}
              </h2>
              <p className="text-xs text-slate-500">
                Tệp tin bị xóa sẽ không thể phục hồi từ thư mục lưu trữ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            title="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          {/* Usage warning banner */}
          {hasInUse ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-amber-900">
              <div className="flex items-start gap-2.5">
                <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-amber-900">
                    Cảnh báo quan trọng: Có {inUseTargets.length} tệp đang được sử dụng trên website!
                  </h4>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Nếu bạn xóa, khách hàng truy cập website có thể bị lỗi hình ảnh hoặc vỡ giao diện sản phẩm/bài viết liên quan.
                  </p>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-amber-200/80 bg-white/70 p-2.5 text-[11px] space-y-1 max-h-36 overflow-y-auto">
                {inUseTargets.map((t, idx) => (
                  <div key={idx} className="border-b border-amber-100 pb-1 last:border-0 last:pb-0">
                    <span className="font-mono font-bold text-amber-900">{t.filename}</span>
                    <span className="text-slate-500"> → </span>
                    <span className="text-amber-800 font-semibold">{t.usedIn?.join(", ")}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3 text-xs font-semibold text-emerald-800">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>Các tệp này không liên kết với sản phẩm hay bài viết nào. Bạn có thể an tâm xóa.</span>
            </div>
          )}

          {/* List of files to delete */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 block">
              Danh sách tệp chuẩn bị xóa ({targets.length}):
            </span>
            <div className="max-h-60 overflow-y-auto space-y-1.5 rounded-2xl border border-slate-200 bg-slate-50/50 p-2">
              {targets.map((item, idx) => {
                const isVideo = item.type === "video";
                const isItemInUse = Boolean(item.usedIn && item.usedIn.length > 0);

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-2 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
                        {isVideo ? (
                          <div className="flex h-full w-full items-center justify-center bg-slate-900 text-purple-400">
                            <Film size={16} />
                          </div>
                        ) : (
                          <Image
                            src={item.url}
                            alt={item.filename}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-slate-800" title={item.filename}>
                          {item.filename}
                        </p>
                        <p className="truncate font-mono text-[10px] text-slate-400">
                          {item.url}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isItemInUse && (
                        <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-[9px] font-extrabold text-rose-700">
                          Đang dùng
                        </span>
                      )}
                      <span className="font-mono text-[10px] font-bold text-black">
                        {formatFileSize(item.size)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Đang xóa vĩnh viễn...</span>
              </>
            ) : (
              <>
                <Trash2 size={14} />
                <span>Xác nhận xóa vĩnh viễn</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
