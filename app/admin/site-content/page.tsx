"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  Save,
  Check,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Video,
  Phone,
  MessageSquare,
  HelpCircle,
  Award,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import type { TranslationBundle } from "@/lib/content-store";
import type { Locale } from "@/i18n/routing";

interface HeroSlide {
  tag?: string;
  titleLine1?: string;
  titleLine2?: string;
  desc?: string;
}

interface ServiceItem {
  title?: string;
  desc?: string;
}

interface PortfolioItem {
  label?: string;
  cat?: string;
}

interface TestimonialItem {
  name?: string;
  role?: string;
  quote?: string;
}

interface FaqItem {
  q?: string;
  a?: string;
}

interface SectionData {
  hero?: {
    slides?: HeroSlide[];
    cta?: string;
  };
  about?: {
    eyebrow?: string;
    statNumber?: string;
    title?: string;
    body?: string;
    checklist?: string[];
  };
  services?: {
    items?: ServiceItem[];
  };
  portfolio?: {
    items?: PortfolioItem[];
  };
  testimonials?: {
    items?: TestimonialItem[];
  };
  faq?: {
    items?: FaqItem[];
  };
  contact?: {
    phone1?: string;
    phone2?: string;
    email?: string;
    address?: string;
  };
  footer?: {
    tagline?: string;
  };
}

const LOCALES: { code: Locale; flag: string; label: string }[] = [
  { code: "vi", flag: "🇻🇳", label: "Tiếng Việt" },
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "zh", flag: "🇨🇳", label: "中文" },
  { code: "ja", flag: "🇯🇵", label: "日本語" },
  { code: "ko", flag: "🇰🇷", label: "한국어" },
];

const SECTIONS = [
  { id: "hero", label: "Banner Chính (Hero)", icon: Layers, desc: "3 slide quảng cáo, tiêu đề, mô tả và nút báo giá" },
  { id: "about", label: "Giới Thiệu Xưởng In", icon: Video, desc: "Video xưởng, ảnh đại diện, số năm kinh nghiệm, 4 cam kết" },
  { id: "services", label: "4 Dịch Vụ Miễn Phí", icon: Award, desc: "Tư vấn, thiết kế mẫu, in thử màu, giao hàng miễn phí" },
  { id: "portfolio", label: "Dự Án & Mẫu In Thực Tế", icon: ImageIcon, desc: "6 vị trí ảnh dự án tiêu biểu (card, hộp, catalogue...)" },
  { id: "testimonials", label: "Đánh Giá Khách Hàng", icon: MessageSquare, desc: "3 nhận xét của khách hàng kèm tên, chức vụ, avatar" },
  { id: "faq", label: "Câu Hỏi Thường Gặp", icon: HelpCircle, desc: "5 câu hỏi đáp quy trình in, số lượng tối thiểu, thanh toán" },
  { id: "contact", label: "Hotline, Zalo & Chân Trang", icon: Phone, desc: "Số điện thoại xưởng in, email, địa chỉ HCM - Bình Dương" },
];

export default function AdminSiteContentPage() {
  const [bundle, setBundle] = useState<TranslationBundle | null>(null);
  const [activeLocale, setActiveLocale] = useState<Locale>("vi");
  const [activeSection, setActiveSection] = useState<string>("hero");
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
        setLoading(false);
      })
      .catch(() => {
        setError("Không thể tải dữ liệu nội dung trang web");
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
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setError("Không thể tải dữ liệu nội dung");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const handleFieldChange = (namespace: string, fieldPath: string[], value: unknown) => {
    if (!bundle) return;
    const currentLocaleData = { ...((bundle[activeLocale] as Record<string, unknown>) || {}) };
    const currentNs = { ...((currentLocaleData[namespace] as Record<string, unknown>) || {}) };

    let curr: Record<string, unknown> = currentNs;
    for (let i = 0; i < fieldPath.length - 1; i++) {
      const p = fieldPath[i];
      if (!curr[p] || typeof curr[p] !== "object") {
        curr[p] = {};
      }
      curr = curr[p] as Record<string, unknown>;
    }
    curr[fieldPath[fieldPath.length - 1]] = value;

    currentLocaleData[namespace] = currentNs;
    setBundle({
      ...bundle,
      [activeLocale]: currentLocaleData,
    });
  };

  const handleSave = async () => {
    if (!bundle) return;
    setSaving(true);
    setError("");
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/admin/translations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bundle),
      });

      if (!res.ok) throw new Error("Save failed");

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setError("Lỗi khi lưu nội dung website");
    } finally {
      setSaving(false);
    }
  };

  const currentData: SectionData = (bundle?.[activeLocale] as unknown as SectionData) || {};

  return (
    <AdminShell>
      {/* Page Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-primary">
            <Sparkles size={15} /> Hệ Thống Quản Lý Toàn Bộ Giao Diện & Hình Ảnh Website
          </div>
          <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
            Quản Lý Toàn Bộ Nội Dung & Hình Ảnh Website
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Chỉnh sửa trực quan tất cả văn bản, hình ảnh, video, thông tin liên hệ và phản hồi khách hàng theo từng phân đoạn.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadData}
            title="Làm mới dữ liệu"
            className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
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
                <Check size={16} strokeWidth={3} /> Đã cập nhật thành công!
              </>
            ) : (
              <>
                <Save size={16} /> Lưu Thay Đổi Website
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

      {/* Language Selector Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-2">
            Ngôn Ngữ Chỉnh Sửa:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {LOCALES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setActiveLocale(lang.code)}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  activeLocale === lang.code
                    ? "bg-brand-primary text-white shadow-md shadow-brand-primary/25"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Link
          href={activeLocale === "vi" ? "/" : `/${activeLocale}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:underline pr-2"
        >
          <span>Xem trang live ({activeLocale.toUpperCase()})</span>
          <ExternalLink size={12} />
        </Link>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Left Column (1 col): Section Selector Sidebar */}
        <div className="space-y-2 lg:col-span-1">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-3 shadow-xs space-y-1">
            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Các Khối Giao Diện Website
            </p>
            {SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full flex items-center justify-between rounded-2xl p-3 text-left transition-all cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-brand-primary to-purple-600 text-white shadow-md shadow-brand-primary/20 font-bold"
                      : "text-slate-700 hover:bg-slate-100 font-semibold"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                        isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className="text-xs leading-tight">{sec.label}</p>
                    </div>
                  </div>
                  <ChevronRight
                    size={14}
                    className={isActive ? "text-white" : "text-slate-400"}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column (3 cols): Detailed Content & Media Editor Form */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex h-96 w-full items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-xs">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-primary border-t-transparent" />
                <p className="text-xs font-semibold text-slate-500">Đang nạp dữ liệu phân đoạn...</p>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
              {/* Section 1: Hero Banner */}
              {activeSection === "hero" && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Layers size={18} className="text-brand-primary" /> Banner Chính (Hero Carousel)
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Chỉnh sửa nội dung 3 slide chạy tự động trên đầu trang chủ và nút kêu gọi hành động (CTA).
                    </p>
                  </div>

                  {/* 3 Slides */}
                  <div className="space-y-6">
                    {currentData.hero?.slides?.map((slide: HeroSlide, sIdx: number) => (
                      <div
                        key={sIdx}
                        className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 space-y-4"
                      >
                        <span className="rounded-md bg-slate-900 text-white px-2.5 py-1 text-[10px] font-bold">
                          Slide #{sIdx + 1}
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">
                              Thẻ Tagline nổi bật (Tag)
                            </label>
                            <input
                              type="text"
                              value={slide.tag || ""}
                              onChange={(e) => {
                                const newSlides = [...(currentData.hero?.slides || [])];
                                newSlides[sIdx] = { ...newSlides[sIdx], tag: e.target.value };
                                handleFieldChange("hero", ["slides"], newSlides);
                              }}
                              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 focus:border-brand-primary focus:outline-hidden"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">
                              Tiêu đề dòng 1 (titleLine1)
                            </label>
                            <input
                              type="text"
                              value={slide.titleLine1 || ""}
                              onChange={(e) => {
                                const newSlides = [...(currentData.hero?.slides || [])];
                                newSlides[sIdx] = { ...newSlides[sIdx], titleLine1: e.target.value };
                                handleFieldChange("hero", ["slides"], newSlides);
                              }}
                              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 focus:border-brand-primary focus:outline-hidden"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            Tiêu đề dòng 2 (titleLine2)
                          </label>
                          <input
                            type="text"
                            value={slide.titleLine2 || ""}
                            onChange={(e) => {
                              const newSlides = [...(currentData.hero?.slides || [])];
                              newSlides[sIdx] = { ...newSlides[sIdx], titleLine2: e.target.value };
                              handleFieldChange("hero", ["slides"], newSlides);
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-brand-primary focus:border-brand-primary focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            Đoạn văn mô tả (desc)
                          </label>
                          <textarea
                            rows={2}
                            value={slide.desc || ""}
                            onChange={(e) => {
                              const newSlides = [...(currentData.hero?.slides || [])];
                              newSlides[sIdx] = { ...newSlides[sIdx], desc: e.target.value };
                              handleFieldChange("hero", ["slides"], newSlides);
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:border-brand-primary focus:outline-hidden"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Hero CTA Button Text */}
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Chữ trên nút CTA chính (cta)
                    </label>
                    <input
                      type="text"
                      value={currentData.hero?.cta || ""}
                      onChange={(e) => handleFieldChange("hero", ["cta"], e.target.value)}
                      className="w-full max-w-sm rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>
              )}

              {/* Section 2: About Section */}
              {activeSection === "about" && (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Video size={18} className="text-brand-primary" /> Giới Thiệu Xưởng In & Video
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Tùy chỉnh video xưởng, ảnh đại diện, số liệu kinh nghiệm và 4 tiêu chí cam kết chất lượng.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Nhãn phụ tiêu đề (eyebrow)
                      </label>
                      <input
                        type="text"
                        value={currentData.about?.eyebrow || ""}
                        onChange={(e) => handleFieldChange("about", ["eyebrow"], e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Con số kinh nghiệm nổi bật (statNumber)
                      </label>
                      <input
                        type="text"
                        value={currentData.about?.statNumber || ""}
                        onChange={(e) => handleFieldChange("about", ["statNumber"], e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-black text-brand-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Tiêu đề chính (title)
                    </label>
                    <input
                      type="text"
                      value={currentData.about?.title || ""}
                      onChange={(e) => handleFieldChange("about", ["title"], e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-extrabold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Nội dung giới thiệu chi tiết (body)
                    </label>
                    <textarea
                      rows={3}
                      value={currentData.about?.body || ""}
                      onChange={(e) => handleFieldChange("about", ["body"], e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800"
                    />
                  </div>

                  {/* 4 Checklist Items */}
                  <div className="rounded-2xl border border-purple-100 bg-purple-50/40 p-4">
                    <label className="text-xs font-bold text-slate-800 block mb-2">
                      4 Cam Kết Chất Lượng In Ấn (Checklist)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentData.about?.checklist?.map((item: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Check size={14} className="text-brand-primary shrink-0" />
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => {
                              const newChecklist = [...(currentData.about?.checklist || [])];
                              newChecklist[idx] = e.target.value;
                              handleFieldChange("about", ["checklist"], newChecklist);
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-medium text-slate-900"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Section 3: Services Section */}
              {activeSection === "services" && (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Award size={18} className="text-brand-primary" /> 4 Dịch Vụ Miễn Phí
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Chỉnh sửa tiêu đề và mô tả của 4 dịch vụ tặng kèm cho mỗi đơn in.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentData.services?.items?.map((item: ServiceItem, idx: number) => (
                      <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                        <span className="rounded-md bg-purple-100 text-brand-primary px-2 py-0.5 text-[10px] font-bold">
                          Dịch vụ #{idx + 1}
                        </span>
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">
                            Tên dịch vụ
                          </label>
                          <input
                            type="text"
                            value={item.title || ""}
                            onChange={(e) => {
                              const newItems = [...(currentData.services?.items || [])];
                              newItems[idx] = { ...newItems[idx], title: e.target.value };
                              handleFieldChange("services", ["items"], newItems);
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-bold text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">
                            Mô tả chi tiết
                          </label>
                          <textarea
                            rows={2}
                            value={item.desc || ""}
                            onChange={(e) => {
                              const newItems = [...(currentData.services?.items || [])];
                              newItems[idx] = { ...newItems[idx], desc: e.target.value };
                              handleFieldChange("services", ["items"], newItems);
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-800"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 4: Portfolio Section */}
              {activeSection === "portfolio" && (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <ImageIcon size={18} className="text-brand-primary" /> Dự Án & Mẫu In Thực Tế (Portfolio)
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Chỉnh sửa 6 vị trí dự án in ấn nổi bật hiển thị dạng Mosaic trên trang chủ.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentData.portfolio?.items?.map((item: PortfolioItem, idx: number) => (
                      <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                        <span className="rounded-md bg-slate-900 text-white px-2 py-0.5 text-[10px] font-bold">
                          Vị trí #{idx + 1}
                        </span>
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">
                            Tên dự án (label)
                          </label>
                          <input
                            type="text"
                            value={item.label || ""}
                            onChange={(e) => {
                              const newItems = [...(currentData.portfolio?.items || [])];
                              newItems[idx] = { ...newItems[idx], label: e.target.value };
                              handleFieldChange("portfolio", ["items"], newItems);
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-bold text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">
                            Tên danh mục (cat)
                          </label>
                          <input
                            type="text"
                            value={item.cat || ""}
                            onChange={(e) => {
                              const newItems = [...(currentData.portfolio?.items || [])];
                              newItems[idx] = { ...newItems[idx], cat: e.target.value };
                              handleFieldChange("portfolio", ["items"], newItems);
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-800"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 5: Testimonials Section */}
              {activeSection === "testimonials" && (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <MessageSquare size={18} className="text-brand-primary" /> Đánh Giá Của Khách Hàng
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Chỉnh sửa 3 đánh giá của đối tác và khách hàng doanh nghiệp trên trang chủ.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {currentData.testimonials?.items?.map((item: TestimonialItem, idx: number) => (
                      <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                        <span className="rounded-md bg-purple-100 text-brand-primary px-2 py-0.5 text-[10px] font-bold">
                          Đánh giá #{idx + 1}
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[11px] font-bold text-slate-600 block mb-1">
                              Tên khách hàng
                            </label>
                            <input
                              type="text"
                              value={item.name || ""}
                              onChange={(e) => {
                                const newItems = [...(currentData.testimonials?.items || [])];
                                newItems[idx] = { ...newItems[idx], name: e.target.value };
                                handleFieldChange("testimonials", ["items"], newItems);
                              }}
                              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-slate-600 block mb-1">
                              Chức vụ / Doanh nghiệp
                            </label>
                            <input
                              type="text"
                              value={item.role || ""}
                              onChange={(e) => {
                                const newItems = [...(currentData.testimonials?.items || [])];
                                newItems[idx] = { ...newItems[idx], role: e.target.value };
                                handleFieldChange("testimonials", ["items"], newItems);
                              }}
                              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-medium text-slate-700"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">
                            Lời nhận xét (quote)
                          </label>
                          <textarea
                            rows={3}
                            value={item.quote || ""}
                            onChange={(e) => {
                              const newItems = [...(currentData.testimonials?.items || [])];
                              newItems[idx] = { ...newItems[idx], quote: e.target.value };
                              handleFieldChange("testimonials", ["items"], newItems);
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 6: FAQ Section */}
              {activeSection === "faq" && (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <HelpCircle size={18} className="text-brand-primary" /> Câu Hỏi Thường Gặp (FAQ)
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Chỉnh sửa 5 cặp câu hỏi và câu trả lời trong bảng Accordion trang chủ.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {currentData.faq?.items?.map((item: FaqItem, idx: number) => (
                      <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                        <span className="rounded-md bg-slate-900 text-white px-2 py-0.5 text-[10px] font-bold">
                          Câu hỏi #{idx + 1}
                        </span>
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Câu hỏi (q)
                          </label>
                          <input
                            type="text"
                            value={item.q || ""}
                            onChange={(e) => {
                              const newItems = [...(currentData.faq?.items || [])];
                              newItems[idx] = { ...newItems[idx], q: e.target.value };
                              handleFieldChange("faq", ["items"], newItems);
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Câu trả lời (a)
                          </label>
                          <textarea
                            rows={2}
                            value={item.a || ""}
                            onChange={(e) => {
                              const newItems = [...(currentData.faq?.items || [])];
                              newItems[idx] = { ...newItems[idx], a: e.target.value };
                              handleFieldChange("faq", ["items"], newItems);
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 7: Contact & Footer Section */}
              {activeSection === "contact" && (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Phone size={18} className="text-brand-primary" /> Hotline, Zalo & Chân Trang
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Cập nhật số điện thoại kinh doanh, email, địa chỉ xưởng và thông tin bản quyền.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Hotline 1 (phone1)
                      </label>
                      <input
                        type="text"
                        value={currentData.contact?.phone1 || ""}
                        onChange={(e) => handleFieldChange("contact", ["phone1"], e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Hotline 2 (phone2)
                      </label>
                      <input
                        type="text"
                        value={currentData.contact?.phone2 || ""}
                        onChange={(e) => handleFieldChange("contact", ["phone2"], e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Email liên hệ (email)
                      </label>
                      <input
                        type="email"
                        value={currentData.contact?.email || ""}
                        onChange={(e) => handleFieldChange("contact", ["email"], e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Địa chỉ hiển thị (address)
                      </label>
                      <input
                        type="text"
                        value={currentData.contact?.address || ""}
                        onChange={(e) => handleFieldChange("contact", ["address"], e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Tagline chân trang (Footer Tagline)
                    </label>
                    <input
                      type="text"
                      value={currentData.footer?.tagline || ""}
                      onChange={(e) => handleFieldChange("footer", ["tagline"], e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
