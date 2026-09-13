"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import {
  X,
  Upload,
  Search,
  Check,
  Loader2,
  Image as ImageIcon,
  FolderOpen,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { MediaAsset } from "@/lib/content-store";
import { MediaDeleteModal } from "@/components/admin/media-delete-modal";

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  title?: string;
  currentValue?: string;
}

const FOLDER_NAMES: Record<string, string> = {
  all: "Tất Cả Tệp",
  product: "Mẫu Sản Phẩm (product)",
  uploads: "Tải Lên Mới (uploads)",
  category: "Bìa Danh Mục (category)",
  hero: "Banner Chính (hero)",
  portfolio: "Dự Án Đã In (portfolio)",
  blog: "Bài Viết (blog)",
};

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  title = "Chọn Hình Ảnh",
  currentValue = "",
}: Readonly<MediaPickerModalProps>) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [selectedUrl, setSelectedUrl] = useState<string>(currentValue);
  const [prevCurrentValue, setPrevCurrentValue] = useState<string>(currentValue);
  const [uploadError, setUploadError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<MediaAsset | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (prevCurrentValue !== currentValue) {
    setPrevCurrentValue(currentValue);
    setSelectedUrl(currentValue);
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDeleteSelected = () => {
    const target = assets.find((a) => a.url === selectedUrl);
    if (target) {
      setDeleteTarget(target);
    }
  };

  const handleConfirmDelete = async (targets: MediaAsset[]) => {
    const urlsToDelete = targets.map((t) => t.url);
    const res = await fetch("/api/admin/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls: urlsToDelete }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Xóa tệp thất bại");
    }

    const data = await res.json();
    const deletedSet = new Set<string>(data.deleted || urlsToDelete);

    setAssets((prev) => prev.filter((a) => !deletedSet.has(a.url)));
    if (deletedSet.has(selectedUrl)) {
      setSelectedUrl("");
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    fetch("/api/admin/media")
      .then((res) => res.json())
      .then((data: MediaAsset[]) => {
        if (!active) return;
        const imageAssets = Array.isArray(data)
          ? data.filter((a) => a.type === "image")
          : [];
        setAssets(imageAssets);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setUploadError("Không thể tải danh sách media");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen]);

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch =
        !searchQuery ||
        asset.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.url.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFolder =
        selectedFolder === "all" || asset.folder === selectedFolder;
      return matchesSearch && matchesFolder;
    });
  }, [assets, searchQuery, selectedFolder]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Tải lên thất bại");
      }

      if (result.asset) {
        setAssets((prev) => [result.asset, ...prev]);
        setSelectedUrl(result.asset.url);
        onSelect(result.asset.url);
        onClose();
      }
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Lỗi khi tải tệp lên");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleConfirmSelect = () => {
    if (selectedUrl) {
      onSelect(selectedUrl);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-4xl h-[85vh] max-h-[800px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary">
              <ImageIcon size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">{title}</h2>
              <p className="text-xs text-slate-500">
                Chọn từ thư viện hình ảnh có sẵn hoặc tải ảnh mới từ thiết bị
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* Toolbar: Upload Button + Search + Folder filter */}
        <div className="p-4 border-b border-slate-100 bg-white space-y-3">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            {/* Direct Upload Button */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer active:scale-95"
              >
                {uploading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Đang tải lên...</span>
                  </>
                ) : (
                  <>
                    <Upload size={15} />
                    <span>Tải ảnh mới từ máy</span>
                  </>
                )}
              </button>
            </div>

            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên file..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:border-brand-primary focus:outline-hidden transition-all"
              />
            </div>
          </div>

          {/* Folder tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1 shrink-0 pr-1">
              <FolderOpen size={13} /> Thư mục:
            </span>
            {Object.entries(FOLDER_NAMES).map(([key, label]) => {
              const isSelected = selectedFolder === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedFolder(key)}
                  className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-brand-primary text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {label.split(" (")[0]}
                </button>
              );
            })}
          </div>

          {uploadError && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {uploadError}
            </div>
          )}
        </div>

        {/* Gallery Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-2 text-slate-400">
              <Loader2 size={24} className="animate-spin text-brand-primary" />
              <span className="text-xs font-semibold">Đang tải kho ảnh...</span>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-2 text-slate-400">
              <ImageIcon size={36} className="text-slate-300" />
              <span className="text-xs font-semibold">Không tìm thấy ảnh nào</span>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {filteredAssets.map((asset) => {
                const isSelected = selectedUrl === asset.url;
                return (
                  <button
                    key={asset.url}
                    type="button"
                    onClick={() => setSelectedUrl(asset.url)}
                    onDoubleClick={() => {
                      onSelect(asset.url);
                      onClose();
                    }}
                    className={`group relative flex flex-col rounded-xl overflow-hidden border-2 transition-all cursor-pointer text-left bg-white aspect-square ${
                      isSelected
                        ? "border-brand-primary ring-2 ring-brand-primary/20 shadow-md scale-98"
                        : "border-slate-200 hover:border-slate-300 hover:shadow-xs"
                    }`}
                  >
                    <div className="relative w-full h-full bg-slate-100">
                      <Image
                        src={asset.url}
                        alt={asset.filename}
                        fill
                        sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 15vw"
                        className="object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-brand-primary/30 flex items-center justify-center">
                          <div className="p-1 rounded-full bg-brand-primary text-white shadow-md">
                            <Check size={16} strokeWidth={3} />
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Filename overlay on hover */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[10px] text-white font-medium truncate leading-tight">
                        {asset.filename}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with Selected Image & Action Buttons */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-white">
          <div className="flex items-center gap-2 min-w-0 max-w-md">
            {selectedUrl ? (
              <>
                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
                  <Image
                    src={selectedUrl}
                    alt="Selected preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="truncate">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Đã chọn:
                  </span>
                  <span className="text-xs font-mono text-slate-700 font-semibold truncate block">
                    {selectedUrl}
                  </span>
                </div>
              </>
            ) : (
              <span className="text-xs text-slate-400 italic">
                Chưa chọn ảnh nào
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {selectedUrl && (
              <button
                type="button"
                onClick={handleDeleteSelected}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Xóa ảnh này khỏi thư viện"
              >
                <Trash2 size={13} />
                <span>Xóa ảnh</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirmSelect}
              disabled={!selectedUrl}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Sparkles size={14} />
              <span>Xác nhận chọn</span>
            </button>
          </div>
        </div>
      </div>

      <MediaDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        targets={deleteTarget ? [deleteTarget] : []}
        onConfirmDelete={handleConfirmDelete}
        formatFileSize={formatFileSize}
      />
    </div>
  );
}
