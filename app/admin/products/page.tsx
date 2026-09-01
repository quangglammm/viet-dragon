"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  Save,
  Check,
  Edit2,
  X,
  Sparkles,
  Search,
  Plus,
  Trash2,
  ImageIcon,
  Tag,
  ListChecks,
  Target,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  type ProductCategory,
  type ProductItem,
  type ProductOption,
  getStartingPrice,
  isFastPrint,
} from "@/data/categories";

export default function AdminProductsPage() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState<{ catId: string; item: ProductItem } | null>(null);
  const [expandedOptIdx, setExpandedOptIdx] = useState<number | null>(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((data: ProductCategory[]) => {
        if (active) {
          setCategories(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setError("Không thể tải danh sách sản phẩm");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSaveCategories = async (updatedCategories: ProductCategory[]) => {
    setSaving(true);
    setError("");
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCategories),
      });

      if (!res.ok) throw new Error("Save failed");

      setCategories(updatedCategories);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      setEditingItem(null);
    } catch {
      setError("Lỗi khi lưu sản phẩm");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateItem = (catId: string, updatedItem: ProductItem) => {
    const nextCats = categories.map((cat) => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        items: cat.items.map((i) => (i.id === updatedItem.id ? updatedItem : i)),
      };
    });
    handleSaveCategories(nextCats);
  };

  // Option / Material Handlers inside editing modal
  const handleUpdateOption = (optIdx: number, field: keyof ProductOption, value: unknown) => {
    if (!editingItem) return;
    const currentOptions = editingItem.item.optionGroups?.[0]?.options || [];
    const newOptions = currentOptions.map((opt, i) => (i === optIdx ? { ...opt, [field]: value } : opt));

    setEditingItem({
      ...editingItem,
      item: { ...editingItem.item, optionGroups: [{ options: newOptions }] },
    });
  };

  // Description bullet point helpers
  const handleAddDescBullet = (optIdx: number, lang: "vi" | "en") => {
    if (!editingItem) return;
    const currentOptions = editingItem.item.optionGroups?.[0]?.options || [];
    const targetOpt = currentOptions[optIdx];
    if (!targetOpt) return;

    if (lang === "vi") {
      const updatedBullets = [...(targetOpt.descriptionVi || []), "Đặc tính vật liệu mới"];
      handleUpdateOption(optIdx, "descriptionVi", updatedBullets);
    } else {
      const updatedBullets = [...(targetOpt.description || []), "New material characteristic"];
      handleUpdateOption(optIdx, "description", updatedBullets);
    }
  };

  const handleUpdateDescBullet = (optIdx: number, bulletIdx: number, value: string, lang: "vi" | "en") => {
    if (!editingItem) return;
    const currentOptions = editingItem.item.optionGroups?.[0]?.options || [];
    const targetOpt = currentOptions[optIdx];
    if (!targetOpt) return;

    if (lang === "vi") {
      const updatedBullets = (targetOpt.descriptionVi || []).map((b, i) => (i === bulletIdx ? value : b));
      handleUpdateOption(optIdx, "descriptionVi", updatedBullets);
    } else {
      const updatedBullets = (targetOpt.description || []).map((b, i) => (i === bulletIdx ? value : b));
      handleUpdateOption(optIdx, "description", updatedBullets);
    }
  };

  const handleRemoveDescBullet = (optIdx: number, bulletIdx: number, lang: "vi" | "en") => {
    if (!editingItem) return;
    const currentOptions = editingItem.item.optionGroups?.[0]?.options || [];
    const targetOpt = currentOptions[optIdx];
    if (!targetOpt) return;

    if (lang === "vi") {
      const updatedBullets = (targetOpt.descriptionVi || []).filter((_, i) => i !== bulletIdx);
      handleUpdateOption(optIdx, "descriptionVi", updatedBullets);
    } else {
      const updatedBullets = (targetOpt.description || []).filter((_, i) => i !== bulletIdx);
      handleUpdateOption(optIdx, "description", updatedBullets);
    }
  };

  // BestFor bullet point helpers
  const handleAddBestForBullet = (optIdx: number, lang: "vi" | "en") => {
    if (!editingItem) return;
    const currentOptions = editingItem.item.optionGroups?.[0]?.options || [];
    const targetOpt = currentOptions[optIdx];
    if (!targetOpt) return;

    if (lang === "vi") {
      const updatedBullets = [...(targetOpt.bestForVi || []), "Phù hợp cho ấn phẩm doanh nghiệp"];
      handleUpdateOption(optIdx, "bestForVi", updatedBullets);
    } else {
      const updatedBullets = [...(targetOpt.bestFor || []), "Best for corporate branding"];
      handleUpdateOption(optIdx, "bestFor", updatedBullets);
    }
  };

  const handleUpdateBestForBullet = (optIdx: number, bulletIdx: number, value: string, lang: "vi" | "en") => {
    if (!editingItem) return;
    const currentOptions = editingItem.item.optionGroups?.[0]?.options || [];
    const targetOpt = currentOptions[optIdx];
    if (!targetOpt) return;

    if (lang === "vi") {
      const updatedBullets = (targetOpt.bestForVi || []).map((b, i) => (i === bulletIdx ? value : b));
      handleUpdateOption(optIdx, "bestForVi", updatedBullets);
    } else {
      const updatedBullets = (targetOpt.bestFor || []).map((b, i) => (i === bulletIdx ? value : b));
      handleUpdateOption(optIdx, "bestFor", updatedBullets);
    }
  };

  const handleRemoveBestForBullet = (optIdx: number, bulletIdx: number, lang: "vi" | "en") => {
    if (!editingItem) return;
    const currentOptions = editingItem.item.optionGroups?.[0]?.options || [];
    const targetOpt = currentOptions[optIdx];
    if (!targetOpt) return;

    if (lang === "vi") {
      const updatedBullets = (targetOpt.bestForVi || []).filter((_, i) => i !== bulletIdx);
      handleUpdateOption(optIdx, "bestForVi", updatedBullets);
    } else {
      const updatedBullets = (targetOpt.bestFor || []).filter((_, i) => i !== bulletIdx);
      handleUpdateOption(optIdx, "bestFor", updatedBullets);
    }
  };

  const handleAddOption = () => {
    if (!editingItem) return;
    const currentOptions = editingItem.item.optionGroups?.[0]?.options || [];
    const newOpt: ProductOption = {
      name: "Tùy chọn chất liệu mới",
      nameVi: "Chất liệu cao cấp mới",
      tagline: "Quy cách in tiêu chuẩn sắc nét",
      taglineVi: "Quy cách in tiêu chuẩn sắc nét",
      description: ["Định lượng dày dặn", "Tái hiện màu sắc chuẩn xác"],
      descriptionVi: ["Định lượng dày dặn", "Tái hiện màu sắc chuẩn xác"],
      descriptionTraits: ["smooth-base", "foil-accent"],
      bestFor: ["Ấn phẩm cao cấp", "Doanh nghiệp & sự kiện"],
      bestForVi: ["Ấn phẩm cao cấp", "Doanh nghiệp & sự kiện"],
      image: editingItem.item.image || "/images/product/vd-card-standard.png",
      basePrice: 100000,
      doubleSidedPrice: 20000,
      foilPrice: 150000,
      unitEn: "Pcs",
      unitVi: "Cái",
    };

    setEditingItem({
      ...editingItem,
      item: { ...editingItem.item, optionGroups: [{ options: [...currentOptions, newOpt] }] },
    });
    setExpandedOptIdx(currentOptions.length);
  };

  const handleRemoveOption = (optIdx: number) => {
    if (!editingItem) return;
    const currentOptions = editingItem.item.optionGroups?.[0]?.options || [];
    const newOptions = currentOptions.filter((_, i) => i !== optIdx);

    setEditingItem({
      ...editingItem,
      item: { ...editingItem.item, optionGroups: [{ options: newOptions }] },
    });
  };

  const filteredItems = categories.flatMap((cat) => {
    if (selectedCatId !== "all" && cat.id !== selectedCatId) return [];
    return cat.items
      .filter((item) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          item.nameVi.toLowerCase().includes(q) ||
          item.nameEn.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q)
        );
      })
      .map((item) => ({ cat, item }));
  });

  return (
    <AdminShell>
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-primary">
            <Sparkles size={15} /> Danh Mục Sản Phẩm & Quy Cách In Ấn
          </div>
          <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
            Sản Phẩm, Bảng Giá & Chi Tiết Chất Liệu
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Chỉnh sửa tên, tagline, mô tả description, đối tượng phù hợp bestFor, hình ảnh và bảng giá in cho từng sản phẩm.
          </p>
        </div>

        {saveSuccess && (
          <div className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-2 text-xs font-bold text-emerald-700 shadow-xs">
            <Check size={14} strokeWidth={3} /> Đã cập nhật thành công!
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 shadow-xs">
          {error}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs">
        {/* Search */}
        <div className="relative w-full">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm hoặc mã ID (vd: danh thiếp, hộp giấy, brochure...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-11 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-brand-primary focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-primary/15 transition-all"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setSelectedCatId("all")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              selectedCatId === "all"
                ? "bg-brand-primary text-white shadow-md shadow-brand-primary/25"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            Tất cả danh mục ({categories.reduce((acc, c) => acc + c.items.length, 0)})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCatId(cat.id)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                selectedCatId === cat.id
                  ? "bg-brand-primary text-white shadow-md shadow-brand-primary/25"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {cat.nameVi} ({cat.items.length})
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="flex h-64 w-full items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-xs">
          <div className="flex flex-col items-center gap-2">
            <div className="h-7 w-7 animate-spin rounded-full border-3 border-brand-primary border-t-transparent" />
            <p className="text-xs font-semibold text-slate-500">Đang tải danh mục sản phẩm...</p>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex h-48 w-full flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white text-center shadow-xs">
          <p className="text-sm font-bold text-slate-800">Không tìm thấy sản phẩm nào</p>
          <p className="text-xs text-slate-400 mt-1">Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map(({ cat, item }) => {
            const startPrice = getStartingPrice(item.id, "vi");
            const fastPrint = isFastPrint(item.id);
            const optionsCount = item.optionGroups?.[0]?.options?.length || 0;

            return (
              <div
                key={item.id}
                className="group flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xs transition-all hover:border-brand-primary/40 hover:shadow-lg"
              >
                <div>
                  {/* Image Preview Box */}
                  <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-100">
                    <Image
                      src={item.image}
                      alt={item.nameVi}
                      fill
                      sizes="(max-width: 768px) 100vw, 300px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {fastPrint && (
                      <span className="absolute left-2.5 top-2.5 rounded-md bg-amber-500 text-white px-2 py-0.5 text-[10px] font-black shadow-xs">
                        ⚡ In Nhanh 2H
                      </span>
                    )}
                    <span className="absolute right-2.5 top-2.5 rounded-md bg-black/60 text-white px-2 py-0.5 text-[10px] font-bold backdrop-blur-xs">
                      {cat.nameVi}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="mt-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-400">/{item.id}</span>
                      <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                        {optionsCount} chất liệu
                      </span>
                    </div>

                    <h3 className="mt-1.5 font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-brand-primary transition-colors">
                      {item.nameVi}
                    </h3>
                    <p className="text-xs font-medium text-slate-400 line-clamp-1">{item.nameEn}</p>
                    <p className="mt-1.5 line-clamp-2 text-xs text-slate-500 leading-relaxed">
                      {item.descriptionVi}
                    </p>
                  </div>
                </div>

                {/* Pricing & Edit CTA */}
                <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Bảng giá:</span>
                    <span className="text-xs font-black text-brand-primary font-mono">
                      {startPrice}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingItem({ catId: cat.id, item });
                      setExpandedOptIdx(0);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-brand-primary transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <Edit2 size={12} /> Sửa Chi Tiết
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Product Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative my-8 max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl">
            {/* Modal Header */}
            <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-brand-primary/10 text-brand-primary px-2.5 py-0.5 text-xs font-bold">
                    Danh mục: {categories.find((c) => c.id === editingItem.catId)?.nameVi}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">/{editingItem.item.id}</span>
                </div>
                <h2 className="mt-1 text-xl font-black text-slate-900">
                  Chỉnh Sửa Tagline, Mô Tả (Description), Ứng Dụng (BestFor) & Hình Ảnh
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateItem(editingItem.catId, editingItem.item);
              }}
              className="space-y-6"
            >
              {/* BLOCK 1: PRODUCT GENERAL INFO */}
              <div className="rounded-3xl border border-slate-200/80 bg-slate-50/50 p-5 space-y-4">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Tag size={16} className="text-brand-primary" /> Thông Tin Chung Của Sản Phẩm
                </h3>

                {/* Product Basic Names */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      Tên sản phẩm tiếng Việt (nameVi)
                    </label>
                    <input
                      type="text"
                      value={editingItem.item.nameVi}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          item: { ...editingItem.item, nameVi: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 focus:border-brand-primary focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      Tên sản phẩm tiếng Anh (nameEn)
                    </label>
                    <input
                      type="text"
                      value={editingItem.item.nameEn}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          item: { ...editingItem.item, nameEn: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 focus:border-brand-primary focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Product Image & Thumbnail Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-brand-primary" /> Đường dẫn ảnh sản phẩm (Image URL)
                    </label>
                    <input
                      type="text"
                      value={editingItem.item.image}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          item: { ...editingItem.item, image: e.target.value },
                        })
                      }
                      placeholder="/images/product/vd-card-standard.png"
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-mono text-slate-800 focus:border-brand-primary focus:outline-hidden"
                    />
                    <p className="mt-1 text-[11px] text-slate-400">
                      Đường dẫn ảnh cục bộ từ thư mục public hoặc link ảnh tải lên từ Thư Viện Media.
                    </p>
                  </div>

                  {/* Live Thumbnail Preview */}
                  <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-100">
                      {editingItem.item.image ? (
                        <Image
                          src={editingItem.item.image}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-300">
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Xem Trước Ảnh
                      </span>
                      <span className="text-[11px] font-semibold text-slate-700 line-clamp-1">
                        {editingItem.item.image.split("/").pop()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Descriptions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      Mô tả giới thiệu (Tiếng Việt)
                    </label>
                    <textarea
                      rows={2}
                      value={editingItem.item.descriptionVi}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          item: { ...editingItem.item, descriptionVi: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-brand-primary focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      Mô tả giới thiệu (English)
                    </label>
                    <textarea
                      rows={2}
                      value={editingItem.item.description}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          item: { ...editingItem.item, description: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-brand-primary focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* BLOCK 2: OPTIONS & FLASHCARDS (TAGLINE, DESCRIPTION BULLETS, BESTFOR BULLETS, IMAGES) */}
              <div className="rounded-3xl border border-purple-200 bg-purple-50/40 p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-100 pb-3">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                      <Sparkles size={17} className="text-brand-primary" />
                      Tùy Chọn Chất Liệu Flashcard (Tagline, Description, BestFor & Image)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Chỉnh sửa thẻ Flashcard lật 3D chi tiết: câu hook Tagline, các gạch đầu dòng đặc tính Description, ứng dụng BestFor, ảnh mẫu và bảng giá.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary text-white px-3.5 py-2 text-xs font-bold hover:opacity-95 shadow-md shadow-brand-primary/25 cursor-pointer self-start sm:self-auto"
                  >
                    <Plus size={14} /> Thêm chất liệu mới
                  </button>
                </div>

                {/* Options List */}
                <div className="space-y-4">
                  {editingItem.item.optionGroups?.[0]?.options?.map((opt, optIdx) => {
                    const isExpanded = expandedOptIdx === optIdx;

                    return (
                      <div
                        key={optIdx}
                        className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden"
                      >
                        {/* Option Card Accordion Header */}
                        <div
                          onClick={() => setExpandedOptIdx(isExpanded ? null : optIdx)}
                          className="flex items-center justify-between p-4 bg-slate-50/80 hover:bg-purple-50/50 cursor-pointer border-b border-slate-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="rounded-lg bg-slate-900 text-white px-2.5 py-1 text-xs font-bold">
                              #{optIdx + 1}
                            </span>
                            <div>
                              <span className="font-bold text-sm text-slate-900">{opt.nameVi}</span>
                              <span className="text-xs text-slate-400 ml-2">({opt.name})</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono font-bold text-brand-primary">
                              {opt.basePrice?.toLocaleString()} đ / {opt.unitVi || "đv"}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveOption(optIdx);
                              }}
                              className="text-rose-500 hover:text-rose-700 p-1 text-xs font-bold cursor-pointer"
                              title="Xóa chất liệu này"
                            >
                              <Trash2 size={15} />
                            </button>
                            {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                          </div>
                        </div>

                        {/* Option Expanded Body */}
                        {isExpanded && (
                          <div className="p-5 space-y-5">
                            {/* 1. Name & Tagline */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">
                                  Tên chất liệu (Tiếng Việt)
                                </label>
                                <input
                                  type="text"
                                  value={opt.nameVi}
                                  onChange={(e) => handleUpdateOption(optIdx, "nameVi", e.target.value)}
                                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">
                                  Tên chất liệu (English)
                                </label>
                                <input
                                  type="text"
                                  value={opt.name}
                                  onChange={(e) => handleUpdateOption(optIdx, "name", e.target.value)}
                                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900"
                                />
                              </div>
                            </div>

                            {/* Tagline */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-purple-50/50 p-3.5 rounded-2xl border border-purple-100">
                              <div>
                                <label className="text-xs font-bold text-purple-950 block mb-1 flex items-center gap-1">
                                  <Tag size={13} className="text-brand-primary" /> Câu Tagline ngắn (Tiếng Việt)
                                </label>
                                <input
                                  type="text"
                                  value={opt.taglineVi || ""}
                                  onChange={(e) => handleUpdateOption(optIdx, "taglineVi", e.target.value)}
                                  placeholder="vd: Cần mẫu card sang trọng gây ấn tượng mạnh?"
                                  className="w-full rounded-xl border border-purple-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-brand-primary"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-bold text-purple-950 block mb-1 flex items-center gap-1">
                                  <Tag size={13} className="text-brand-primary" /> Câu Tagline ngắn (English)
                                </label>
                                <input
                                  type="text"
                                  value={opt.tagline || ""}
                                  onChange={(e) => handleUpdateOption(optIdx, "tagline", e.target.value)}
                                  placeholder="vd: Looking for a high-end premium card?"
                                  className="w-full rounded-xl border border-purple-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-brand-primary"
                                />
                              </div>
                            </div>

                            {/* 2. Image and PureImage (No foil) with Preview */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                                  <ImageIcon size={14} className="text-brand-primary" /> Đường dẫn ảnh Flashcard (Image)
                                </label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={opt.image || ""}
                                    onChange={(e) => handleUpdateOption(optIdx, "image", e.target.value)}
                                    placeholder="/images/product/..."
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-mono text-slate-800"
                                  />
                                  {opt.image && (
                                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
                                      <Image src={opt.image} alt="Preview" fill className="object-cover" />
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                                  <ImageIcon size={14} className="text-slate-400" /> Ảnh khi không ép kim (PureImage)
                                </label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={opt.pureImage || ""}
                                    onChange={(e) => handleUpdateOption(optIdx, "pureImage", e.target.value)}
                                    placeholder="/images/product/... (Tùy chọn)"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-mono text-slate-800"
                                  />
                                  {opt.pureImage && (
                                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
                                      <Image src={opt.pureImage} alt="Pure Preview" fill className="object-cover" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* 3. Description Bullets (Đặc tính chất liệu) */}
                            <div className="space-y-3 pt-2 border-t border-slate-100">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                  <ListChecks size={15} className="text-brand-primary" />
                                  Các Gạch Đầu Dòng Đặc Tính (Description Bullets)
                                </label>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleAddDescBullet(optIdx, "vi")}
                                    className="text-[11px] font-bold text-brand-primary hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <Plus size={12} /> Thêm dòng (VI)
                                  </button>
                                  <span className="text-slate-300">|</span>
                                  <button
                                    type="button"
                                    onClick={() => handleAddDescBullet(optIdx, "en")}
                                    className="text-[11px] font-bold text-brand-primary hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <Plus size={12} /> Thêm dòng (EN)
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* VI Bullets */}
                                <div className="space-y-2">
                                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                    Đặc tính tiếng Việt (descriptionVi)
                                  </span>
                                  {opt.descriptionVi?.map((bullet, bIdx) => (
                                    <div key={bIdx} className="flex items-center gap-1.5">
                                      <span className="text-xs text-brand-primary font-bold">•</span>
                                      <input
                                        type="text"
                                        value={bullet}
                                        onChange={(e) => handleUpdateDescBullet(optIdx, bIdx, e.target.value, "vi")}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-xs text-slate-900"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveDescBullet(optIdx, bIdx, "vi")}
                                        className="text-rose-400 hover:text-rose-600 p-1 cursor-pointer"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  ))}
                                </div>

                                {/* EN Bullets */}
                                <div className="space-y-2">
                                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                    Đặc tính tiếng Anh (description)
                                  </span>
                                  {opt.description?.map((bullet, bIdx) => (
                                    <div key={bIdx} className="flex items-center gap-1.5">
                                      <span className="text-xs text-brand-primary font-bold">•</span>
                                      <input
                                        type="text"
                                        value={bullet}
                                        onChange={(e) => handleUpdateDescBullet(optIdx, bIdx, e.target.value, "en")}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-xs text-slate-900"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveDescBullet(optIdx, bIdx, "en")}
                                        className="text-rose-400 hover:text-rose-600 p-1 cursor-pointer"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* 4. BestFor Bullets (Ứng dụng phù hợp nhất) */}
                            <div className="space-y-3 pt-2 border-t border-slate-100">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                  <Target size={15} className="text-emerald-600" />
                                  Ứng Dụng Phù Hợp Nhất (BestFor Bullets)
                                </label>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleAddBestForBullet(optIdx, "vi")}
                                    className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <Plus size={12} /> Thêm mục (VI)
                                  </button>
                                  <span className="text-slate-300">|</span>
                                  <button
                                    type="button"
                                    onClick={() => handleAddBestForBullet(optIdx, "en")}
                                    className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <Plus size={12} /> Thêm mục (EN)
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* VI BestFor */}
                                <div className="space-y-2">
                                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                    Mục đích sử dụng tiếng Việt (bestForVi)
                                  </span>
                                  {opt.bestForVi?.map((bullet, bIdx) => (
                                    <div key={bIdx} className="flex items-center gap-1.5">
                                      <Check size={12} className="text-emerald-600 shrink-0" />
                                      <input
                                        type="text"
                                        value={bullet}
                                        onChange={(e) => handleUpdateBestForBullet(optIdx, bIdx, e.target.value, "vi")}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-xs text-slate-900"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveBestForBullet(optIdx, bIdx, "vi")}
                                        className="text-rose-400 hover:text-rose-600 p-1 cursor-pointer"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  ))}
                                </div>

                                {/* EN BestFor */}
                                <div className="space-y-2">
                                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                    Mục đích sử dụng tiếng Anh (bestFor)
                                  </span>
                                  {opt.bestFor?.map((bullet, bIdx) => (
                                    <div key={bIdx} className="flex items-center gap-1.5">
                                      <Check size={12} className="text-emerald-600 shrink-0" />
                                      <input
                                        type="text"
                                        value={bullet}
                                        onChange={(e) => handleUpdateBestForBullet(optIdx, bIdx, e.target.value, "en")}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-xs text-slate-900"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveBestForBullet(optIdx, bIdx, "en")}
                                        className="text-rose-400 hover:text-rose-600 p-1 cursor-pointer"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* 5. Pricing & Unit */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
                              <div>
                                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                                  Giá cơ bản (VNĐ)
                                </label>
                                <input
                                  type="number"
                                  value={opt.basePrice || 0}
                                  onChange={(e) =>
                                    handleUpdateOption(optIdx, "basePrice", Number(e.target.value))
                                  }
                                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-mono font-bold text-brand-primary"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                                  Phí in 2 mặt (VNĐ)
                                </label>
                                <input
                                  type="number"
                                  value={opt.doubleSidedPrice || 0}
                                  onChange={(e) =>
                                    handleUpdateOption(optIdx, "doubleSidedPrice", Number(e.target.value))
                                  }
                                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-mono font-bold text-slate-700"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                                  Phí ép kim (VNĐ)
                                </label>
                                <input
                                  type="number"
                                  value={opt.foilPrice || 0}
                                  onChange={(e) =>
                                    handleUpdateOption(optIdx, "foilPrice", Number(e.target.value))
                                  }
                                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-mono font-bold text-amber-600"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                                  Đơn vị tính (VI / EN)
                                </label>
                                <div className="grid grid-cols-2 gap-1">
                                  <input
                                    type="text"
                                    value={opt.unitVi || "Hộp"}
                                    onChange={(e) => handleUpdateOption(optIdx, "unitVi", e.target.value)}
                                    placeholder="Hộp"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold text-slate-700"
                                  />
                                  <input
                                    type="text"
                                    value={opt.unitEn || "Boxes"}
                                    onChange={(e) => handleUpdateOption(optIdx, "unitEn", e.target.value)}
                                    placeholder="Boxes"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold text-slate-700"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="rounded-2xl px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-2xl bg-brand-primary px-7 py-3 text-xs font-extrabold text-white shadow-lg shadow-brand-primary/25 hover:opacity-95 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {saving ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Save size={15} /> Lưu Toàn Bộ Tagline, Mô Tả, BestFor & Ảnh
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
