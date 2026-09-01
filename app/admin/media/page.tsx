"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  Upload,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  HardDrive,
  Search,
  Filter,
  Film,
  Image as ImageIcon,
  Play,
  X,
  ExternalLink,
  Layers,
} from "lucide-react";
import type { MediaAsset } from "@/lib/content-store";

const FOLDER_NAMES: Record<string, string> = {
  all: "Tất Cả Tệp",
  product: "Mẫu Sản Phẩm (product)",
  hero: "Banner Chính (hero)",
  portfolio: "Dự Án Đã In (portfolio)",
  blog: "Bài Viết In Ấn (blog)",
  category: "Bìa Danh Mục (category)",
  about: "Giới Thiệu Xưởng (about)",
  videos: "Video Xưởng (videos)",
  uploads: "Tải Lên Mới (uploads)",
  cta: "Banner CTA",
  faq: "Hình FAQ",
  services: "Dịch Vụ",
  quality: "Chất Lượng",
  root: "Tệp Gốc (root)",
};

export default function AdminMediaPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "image" | "video">("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = () => {
    setLoading(true);
    fetch("/api/admin/media")
      .then((res) => res.json())
      .then((data: MediaAsset[]) => {
        setAssets(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Không thể tải danh sách hình ảnh và video");
        setLoading(false);
      });
  };

  useEffect(() => {
    let active = true;
    fetch("/api/admin/media")
      .then((res) => res.json())
      .then((data: MediaAsset[]) => {
        if (active) {
          setAssets(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setError("Không thể tải danh sách media từ thư mục public");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      if (data.asset) {
        setAssets((prev) => [data.asset, ...prev]);
      }
    } catch {
      setError("Lỗi khi tải tệp lên máy chủ");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Extract unique folders dynamically
  const availableFolders = useMemo(() => {
    const folders = new Set<string>();
    assets.forEach((a) => {
      if (a.folder) folders.add(a.folder);
    });
    return Array.from(folders);
  }, [assets]);

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      // Type filter
      if (typeFilter !== "all" && asset.type !== typeFilter) return false;

      // Folder filter
      if (selectedFolder !== "all" && asset.folder !== selectedFolder) return false;

      // Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          asset.filename.toLowerCase().includes(q) ||
          asset.url.toLowerCase().includes(q) ||
          asset.folder.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [assets, selectedFolder, typeFilter, searchQuery]);

  const totalImages = useMemo(() => assets.filter((a) => a.type === "image").length, [assets]);
  const totalVideos = useMemo(() => assets.filter((a) => a.type === "video").length, [assets]);

  return (
    <AdminShell>
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-primary">
            <Sparkles size={15} /> Toàn Bộ Thư Viện Hình Ảnh & Video Xưởng In
          </div>
          <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
            Thư Viện Mẫu In, Hình Ảnh & Video Xưởng
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Tổng hợp toàn bộ <strong>{assets.length} tệp</strong> ({totalImages} hình ảnh, {totalVideos} video) từ tất cả các thư mục con trong <code>public/</code>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadData}
            title="Quét lại thư mục public"
            className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Quét lại thư mục</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 shadow-xs">
          {error}
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="mb-8 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-purple-200 bg-white p-8 text-center transition-all hover:border-brand-primary hover:bg-purple-50/40 cursor-pointer shadow-xs"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 text-brand-primary mb-3 shadow-inner">
          {uploading ? (
            <div className="h-7 w-7 animate-spin rounded-full border-3 border-brand-primary border-t-transparent" />
          ) : (
            <Upload size={28} />
          )}
        </div>

        <h3 className="text-base font-extrabold text-slate-900">
          {uploading ? "Đang tải tệp mẫu in / video lên máy chủ..." : "Nhấn hoặc Kéo Thả Hình Ảnh / Video Mẫu In Lên Đây"}
        </h3>
        <p className="mt-1.5 text-xs text-slate-500 max-w-md">
          Hỗ trợ tất cả định dạng ảnh (JPG, PNG, WebP, SVG, GIF) và Video (MP4, WebM, MOV). Tệp sẽ được lưu vào <code>public/uploads/</code> và sẵn sàng sử dụng.
        </p>
      </div>

      {/* Media Filter & Search Toolbar */}
      <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs">
        {/* Top bar: Search + Type Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên tệp hoặc đường dẫn url..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2.5 pl-11 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-brand-primary focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Media Type Toggle: All / Images / Videos */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setTypeFilter("all")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                typeFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers size={13} />
              <span>Tất cả ({assets.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("image")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                typeFilter === "image" ? "bg-white text-brand-primary shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ImageIcon size={13} />
              <span>Hình ảnh ({totalImages})</span>
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("video")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                typeFilter === "video" ? "bg-white text-purple-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Film size={13} />
              <span>Video ({totalVideos})</span>
            </button>
          </div>
        </div>

        {/* Folder Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1 text-slate-400 text-xs font-bold mr-1">
            <Filter size={13} /> Thư mục:
          </div>
          <button
            type="button"
            onClick={() => setSelectedFolder("all")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              selectedFolder === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Tất cả ({assets.length})
          </button>
          {availableFolders.map((folder) => {
            const countInFolder = assets.filter((a) => a.folder === folder).length;
            const displayName = FOLDER_NAMES[folder] || folder;

            return (
              <button
                key={folder}
                type="button"
                onClick={() => setSelectedFolder(folder)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  selectedFolder === folder
                    ? "bg-brand-primary text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {displayName} ({countInFolder})
              </button>
            );
          })}
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="flex h-64 w-full items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-xs">
          <div className="flex flex-col items-center gap-2">
            <div className="h-7 w-7 animate-spin rounded-full border-3 border-brand-primary border-t-transparent" />
            <p className="text-xs font-semibold text-slate-500">Đang quét toàn bộ hình ảnh và video trong public/...</p>
          </div>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="flex h-48 w-full flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white text-center shadow-xs">
          <HardDrive size={28} className="text-slate-300 mb-2" />
          <p className="text-sm font-bold text-slate-800">Không tìm thấy tệp media nào phù hợp</p>
          <p className="text-xs text-slate-400 mt-1">Hãy thử đổi từ khóa tìm kiếm hoặc chọn danh mục thư mục khác.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filteredAssets.map((asset, idx) => {
            const isCopied = copiedUrl === asset.url;
            const isVideo = asset.type === "video";

            return (
              <div
                key={idx}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-all hover:border-brand-primary/50 hover:shadow-lg"
              >
                {/* Media Preview Box */}
                <div
                  onClick={() => setPreviewAsset(asset)}
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

                  {/* Folder / Type Badge */}
                  <span className="absolute left-2 top-2 rounded-md bg-black/70 text-white px-2 py-0.5 text-[9px] font-bold backdrop-blur-xs flex items-center gap-1">
                    {isVideo && <Film size={10} className="text-purple-400" />}
                    <span>{asset.folder}</span>
                  </span>

                  <span className="absolute right-2 top-2 rounded-md bg-white/90 text-slate-800 px-1.5 py-0.5 text-[9px] font-mono font-bold shadow-xs">
                    {formatFileSize(asset.size)}
                  </span>
                </div>

                {/* Info & Copy Button */}
                <div className="p-3 bg-white">
                  <p
                    title={asset.filename}
                    className="truncate text-xs font-bold text-slate-800 group-hover:text-brand-primary transition-colors"
                  >
                    {asset.filename}
                  </p>
                  <p className="truncate text-[10px] font-mono text-slate-400 mt-0.5">
                    {asset.url}
                  </p>

                  <div className="mt-2.5 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopy(asset.url)}
                      className={`flex-1 flex items-center justify-center gap-1 rounded-xl py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                        isCopied
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-brand-primary hover:text-white"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check size={12} strokeWidth={3} />
                          <span>Đã sao chép</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Sao chép link</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreviewAsset(asset)}
                      title="Xem toàn màn hình"
                      className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      <ExternalLink size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {previewAsset && (
        <div
          onClick={() => setPreviewAsset(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] max-w-4xl w-full rounded-3xl bg-slate-900 p-4 sm:p-6 text-white shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div>
                <span className="text-xs font-mono font-bold text-pink-400">
                  {previewAsset.url}
                </span>
                <h3 className="text-base font-extrabold truncate max-w-lg">
                  {previewAsset.filename}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewAsset(null)}
                className="rounded-xl p-2 bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Media Content */}
            <div className="relative flex-1 min-h-[300px] max-h-[60vh] flex items-center justify-center bg-black/50 rounded-2xl overflow-hidden">
              {previewAsset.type === "video" ? (
                <video
                  src={previewAsset.url}
                  controls
                  autoPlay
                  className="max-h-full max-w-full rounded-xl"
                />
              ) : (
                <div className="relative h-full w-full min-h-[350px]">
                  <Image
                    src={previewAsset.url}
                    alt={previewAsset.filename}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
            </div>

            {/* Bottom bar */}
            <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/10 text-xs">
              <span className="text-slate-400">
                Thư mục: <strong className="text-white">{previewAsset.folder}</strong> · Dung lượng:{" "}
                <strong className="text-white">{formatFileSize(previewAsset.size)}</strong>
              </span>

              <button
                type="button"
                onClick={() => handleCopy(previewAsset.url)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2 text-xs font-bold text-white shadow-md hover:opacity-90 cursor-pointer"
              >
                <Copy size={13} />
                <span>Sao chép đường dẫn</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
