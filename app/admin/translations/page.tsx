"use client";

import { useState, useEffect, useMemo } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  Save,
  Search,
  Check,
  AlertCircle,
  RefreshCw,
  Layers,
  Copy,
  Globe2,
} from "lucide-react";
import type { TranslationBundle } from "@/lib/content-store";
import type { Locale } from "@/i18n/routing";

const LOCALES: { code: Locale; flag: string; label: string }[] = [
  { code: "vi", flag: "🇻🇳", label: "Tiếng Việt (Gốc)" },
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "zh", flag: "🇨🇳", label: "中文" },
  { code: "ja", flag: "🇯🇵", label: "日本語" },
  { code: "ko", flag: "🇰🇷", label: "한국어" },
];

const NAMESPACE_LABELS: Record<string, string> = {
  nav: "Thanh Điều Hướng & Menu",
  hero: "Banner Chính (Hero)",
  about: "Giới Thiệu Xưởng In",
  services: "4 Dịch Vụ Miễn Phí",
  shop: "Sản Phẩm Trang Chủ",
  shopCategories: "Danh Mục Sản Phẩm",
  shopBanner: "Banner Khuyến Mãi",
  ctaBanner: "Banner Kêu Gọi Báo Giá",
  portfolio: "Dự Án Đã Thực Hiện",
  testimonials: "Đánh Giá Khách Hàng",
  faq: "Câu Hỏi Thường Gặp",
  quality: "Cam Kết Chất Lượng",
  process: "Quy Trình 3 Bước",
  blogPreview: "Tin Tức Trang Chủ",
  brands: "Khách Hàng & Đối Tác",
  cta: "Khối Báo Giá Cuối Trang",
  footer: "Chân Trang (Footer)",
  productsPage: "Trang Danh Mục Sản Phẩm",
  categoryPage: "Trang Chi Tiết Danh Mục",
  productDetailPage: "Trang Chi Tiết Sản Phẩm & Flashcard",
  blogPage: "Trang Danh Sách Bài Viết",
  blogPostPage: "Trang Chi Tiết Bài Viết",
  contact: "Thông Tin Liên Hệ",
  floatingContact: "Nút Liên Hệ Nổi Zalo & Phone",
  materialGlossary: "Bảng Tra Cứu Chất Liệu In",
};

function flattenKeys(obj: Record<string, unknown>, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const nextKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flattenKeys(value as Record<string, unknown>, nextKey));
    } else if (typeof value === "string") {
      result[nextKey] = value;
    }
  }
  return result;
}

function unflattenKeys(flat: Record<string, string>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split(".");
    let curr = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      if (!curr[p] || typeof curr[p] !== "object") {
        curr[p] = {};
      }
      curr = curr[p] as Record<string, unknown>;
    }
    curr[parts[parts.length - 1]] = value;
  }
  return result;
}

export default function AdminTranslationsPage() {
  const [bundle, setBundle] = useState<TranslationBundle | null>(null);
  const [flatByLocale, setFlatByLocale] = useState<Record<Locale, Record<string, string>>>({
    vi: {},
    en: {},
    zh: {},
    ja: {},
    ko: {},
  });
  const [activeNamespace, setActiveNamespace] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");

  const loadData = () => {
    setLoading(true);
    fetch("/api/admin/translations")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data: TranslationBundle) => {
        setBundle(data);
        const flats: Record<Locale, Record<string, string>> = {
          vi: flattenKeys(data.vi || {}),
          en: flattenKeys(data.en || {}),
          zh: flattenKeys(data.zh || {}),
          ja: flattenKeys(data.ja || {}),
          ko: flattenKeys(data.ko || {}),
        };
        setFlatByLocale(flats);
        setLoading(false);
      })
      .catch(() => {
        setError("Không thể tải dữ liệu bản dịch");
        setLoading(false);
      });
  };

  useEffect(() => {
    let active = true;
    fetch("/api/admin/translations")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data: TranslationBundle) => {
        if (active) {
          setBundle(data);
          const flats: Record<Locale, Record<string, string>> = {
            vi: flattenKeys(data.vi || {}),
            en: flattenKeys(data.en || {}),
            zh: flattenKeys(data.zh || {}),
            ja: flattenKeys(data.ja || {}),
            ko: flattenKeys(data.ko || {}),
          };
          setFlatByLocale(flats);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setError("Không thể tải dữ liệu bản dịch");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const allKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const locale of Object.keys(flatByLocale) as Locale[]) {
      for (const k of Object.keys(flatByLocale[locale])) {
        keys.add(k);
      }
    }
    return Array.from(keys).sort();
  }, [flatByLocale]);

  const namespaces = useMemo(() => {
    const ns = new Set<string>();
    for (const k of allKeys) {
      const top = k.split(".")[0];
      if (top) ns.add(top);
    }
    return Array.from(ns).sort();
  }, [allKeys]);

  const filteredKeys = useMemo(() => {
    return allKeys.filter((key) => {
      if (activeNamespace !== "all" && !key.startsWith(`${activeNamespace}.`)) {
        return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchKey = key.toLowerCase().includes(q);
        const matchValues = LOCALES.some((l) =>
          (flatByLocale[l.code]?.[key] || "").toLowerCase().includes(q)
        );
        return matchKey || matchValues;
      }
      return true;
    });
  }, [allKeys, activeNamespace, searchQuery, flatByLocale]);

  const handleCellChange = (locale: Locale, key: string, newValue: string) => {
    setFlatByLocale((prev) => ({
      ...prev,
      [locale]: {
        ...prev[locale],
        [key]: newValue,
      },
    }));
  };

  const handleCopyFromVi = (key: string) => {
    const viText = flatByLocale.vi[key] || "";
    if (!viText) return;

    setFlatByLocale((prev) => ({
      ...prev,
      en: prev.en[key] ? prev.en : { ...prev.en, [key]: viText },
      zh: prev.zh[key] ? prev.zh : { ...prev.zh, [key]: viText },
      ja: prev.ja[key] ? prev.ja : { ...prev.ja, [key]: viText },
      ko: prev.ko[key] ? prev.ko : { ...prev.ko, [key]: viText },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaveSuccess(false);

    try {
      const newBundle: TranslationBundle = {
        vi: { ...bundle?.vi, ...unflattenKeys(flatByLocale.vi) },
        en: { ...bundle?.en, ...unflattenKeys(flatByLocale.en) },
        zh: { ...bundle?.zh, ...unflattenKeys(flatByLocale.zh) },
        ja: { ...bundle?.ja, ...unflattenKeys(flatByLocale.ja) },
        ko: { ...bundle?.ko, ...unflattenKeys(flatByLocale.ko) },
      };

      const res = await fetch("/api/admin/translations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBundle),
      });

      if (!res.ok) throw new Error("Save failed");

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setError("Lỗi khi lưu bản dịch");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell>
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-primary">
            <Globe2 size={15} /> Hệ Thống Bản Dịch Đa Ngôn Ngữ
          </div>
          <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
            Biên Tập Bản Dịch 5 Ngôn Ngữ
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Chỉnh sửa song song nội dung giao diện giữa 🇻🇳 Tiếng Việt, 🇬🇧 English, 🇨🇳 中文, 🇯🇵 日本語, 🇰🇷 한국어.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadData}
            title="Tải lại dữ liệu"
            className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Làm mới</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 rounded-2xl bg-brand-primary px-6 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-brand-primary/25 hover:opacity-95 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            {saving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : saveSuccess ? (
              <>
                <Check size={16} strokeWidth={3} /> Đã lưu thành công!
              </>
            ) : (
              <>
                <Save size={16} /> Lưu Tất Cả Thay Đổi
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 shadow-xs">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs">
        {/* Search Input */}
        <div className="relative w-full">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo từ khóa hoặc chuỗi bản dịch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-11 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-brand-primary focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-primary/15 transition-all"
          />
        </div>

        {/* Namespace Pills Filter */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setActiveNamespace("all")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeNamespace === "all"
                ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            Tất cả ({allKeys.length})
          </button>
          {namespaces.map((ns) => (
            <button
              key={ns}
              type="button"
              onClick={() => setActiveNamespace(ns)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeNamespace === ns
                  ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {NAMESPACE_LABELS[ns] || ns}
            </button>
          ))}
        </div>
      </div>

      {/* Translations Content Matrix */}
      {loading ? (
        <div className="flex h-64 w-full items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-xs">
          <div className="flex flex-col items-center gap-2">
            <div className="h-7 w-7 animate-spin rounded-full border-3 border-brand-primary border-t-transparent" />
            <p className="text-xs font-semibold text-slate-500">Đang nạp từ điển 5 ngôn ngữ...</p>
          </div>
        </div>
      ) : filteredKeys.length === 0 ? (
        <div className="flex h-48 w-full flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white text-center shadow-xs">
          <Layers size={28} className="text-slate-300 mb-2" />
          <p className="text-sm font-bold text-slate-800">Không tìm thấy từ khóa nào</p>
          <p className="text-xs text-slate-400 mt-1">Thử chọn nhóm khác hoặc xóa từ khóa tìm kiếm.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredKeys.map((key) => {
            const keyParts = key.split(".");
            const ns = keyParts[0];
            const subKey = keyParts.slice(1).join(".");

            return (
              <div
                key={key}
                className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md hover:border-slate-300"
              >
                {/* Key Path & Action Header */}
                <div className="mb-3.5 flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-purple-50 border border-purple-100 px-2.5 py-0.5 text-[11px] font-bold text-brand-primary">
                      {NAMESPACE_LABELS[ns] || ns}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-700">
                      {subKey}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyFromVi(key)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-brand-primary transition-colors cursor-pointer"
                    title="Sao chép văn bản tiếng Việt sang các ô còn trống"
                  >
                    <Copy size={12} />
                    <span>Điền nhanh từ Tiếng Việt</span>
                  </button>
                </div>

                {/* 5 Language Inputs Grid */}
                <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-5">
                  {LOCALES.map((lang) => {
                    const val = flatByLocale[lang.code]?.[key] || "";
                    const isLong = val.length > 50 || val.includes("\n");

                    return (
                      <div key={lang.code} className="flex flex-col gap-1.5">
                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                          <span className="text-sm leading-none">{lang.flag}</span>
                          <span>{lang.label}</span>
                        </label>
                        {isLong ? (
                          <textarea
                            rows={3}
                            value={val}
                            onChange={(e) => handleCellChange(lang.code, key, e.target.value)}
                            placeholder={`Nhập ${lang.label}...`}
                            className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-900 placeholder-slate-400 transition-colors focus:border-brand-primary focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-brand-primary"
                          />
                        ) : (
                          <input
                            type="text"
                            value={val}
                            onChange={(e) => handleCellChange(lang.code, key, e.target.value)}
                            placeholder={`Nhập ${lang.label}...`}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 transition-colors focus:border-brand-primary focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-brand-primary"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}
