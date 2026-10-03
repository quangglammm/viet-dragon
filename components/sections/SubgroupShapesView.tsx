"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowRight, Layers, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { pickLocale } from "@/lib/locale";
import type { Locale } from "@/i18n/routing";
import type { SubgroupCategory } from "@/data/subgroups-catalog";

const SHAPE_ALIASES: Record<string, string> = {
  // poster-bangron-standee
  "hanging-board": "bang-treo",
  "bang-treo": "bang-treo",
  "pp-format-board": "pp-boi-format",
  "pp-boi-format": "pp-boi-format",
  "hashtag-handheld": "hashtag-cam-tay",
  "hashtag-cam-tay": "hashtag-cam-tay",
  "hashtag-detachable": "hashtag-tay-cam-roi",
  "hashtag-tay-cam-roi": "hashtag-tay-cam-roi",
  "decal-large-format": "decal-kho-lon",
  "decal-kho-lon": "decal-kho-lon",
  // to-roi
  "flyer-budget": "to-roi-gia-re",
  "to-roi-gia-re": "to-roi-gia-re",
  "flyer-short-run": "to-roi-so-luong-it",
  "to-roi-so-luong-it": "to-roi-so-luong-it",
  "flyer-bulk": "to-roi-so-luong-lon",
  "to-roi-so-luong-lon": "to-roi-so-luong-lon",
  "flyer-premium": "to-roi-cao-cap",
  "to-roi-cao-cap": "to-roi-cao-cap",
  // to-gap
  "brochure-short-run": "to-gap-so-luong-it",
  "to-gap-so-luong-it": "to-gap-so-luong-it",
  "brochure-tri-fold": "to-gap-ba",
  "to-gap-ba": "to-gap-ba",
  "brochure-bi-fold-a4": "to-gap-doi-a4",
  "to-gap-doi-a4": "to-gap-doi-a4",
  "brochure-premium": "to-gap-cao-cap",
  "to-gap-cao-cap": "to-gap-cao-cap",
  // ve-tickets
  "ticket-invitation": "ve-moi-su-kien",
  "ve-moi-su-kien": "ve-moi-su-kien",
  "ticket-wristband": "vong-tay-su-kien",
  "vong-tay-su-kien": "vong-tay-su-kien",
  // vouchers
  "voucher-standard": "phieu-qua-tang-pho-thong",
  "phieu-qua-tang-pho-thong": "phieu-qua-tang-pho-thong",
  "voucher-gift": "gift-vouchers",
  "gift-vouchers": "gift-vouchers",
  "card-loyalty": "the-tich-diem",
  "the-tich-diem": "the-tich-diem",
  "card-scratch": "the-cao-khuyen-mai",
  "the-cao-khuyen-mai": "the-cao-khuyen-mai",
  // catalogues
  "catalogue-standard": "catalogue-tieu-chuan",
  "catalogue-tieu-chuan": "catalogue-tieu-chuan",
  "catalogue-budget": "catalogue-gia-re",
  "catalogue-gia-re": "catalogue-gia-re",
  "catalogue-premium": "catalogue-cao-cap",
  "catalogue-cao-cap": "catalogue-cao-cap",
  "profile-company": "ho-so-nang-luc",
  "ho-so-nang-luc": "ho-so-nang-luc",
  "handbook-pocket": "cam-nang-cam-tay",
  "cam-nang-cam-tay": "cam-nang-cam-tay",
  // bao-thu
  "envelope-express": "bao-thu-lay-ngay",
  "bao-thu-lay-ngay": "bao-thu-lay-ngay",
  "envelope-small": "bao-thu-nho",
  "bao-thu-nho": "bao-thu-nho",
  "envelope-medium": "bao-thu-trung",
  "bao-thu-trung": "bao-thu-trung",
  "envelope-large": "bao-thu-lon",
  "bao-thu-lon": "bao-thu-lon",
  "envelope-window": "bao-thu-cua-so",
  "bao-thu-cua-so": "bao-thu-cua-so",
  // mac-san-pham
  "tag-common": "mac-pho-thong",
  "mac-pho-thong": "mac-pho-thong",
  "tag-premium": "mac-cao-cap",
  "mac-cao-cap": "mac-cao-cap",
  "tag-fashion": "tag-thoi-trang",
  "tag-thoi-trang": "tag-thoi-trang",
  "tag-jewelry": "tag-trang-suc",
  "tag-trang-suc": "tag-trang-suc",
  "tag-thank-you": "tag-cam-on",
  "tag-cam-on": "tag-cam-on",
  // lich-tet
  "calendar-desk-standard": "lich-de-ban",
  "lich-de-ban": "lich-de-ban",
  "calendar-desk-2026": "lich-ban-2026",
  "lich-ban-2026": "lich-ban-2026",
  "calendar-magnetic-flexible": "lich-nam-cham",
  "lich-nam-cham": "lich-nam-cham",
  // tet submenu shapes
  "tag-product": "tag-san-pham",
  "tag-san-pham": "tag-san-pham",
  "label-paper": "nhan-decal-giay",
  "nhan-decal-giay": "nhan-decal-giay",
  "label-plastic": "nhan-decal-nhua",
  "nhan-decal-nhua": "nhan-decal-nhua",
  "hashtag-paper": "hashtag-giay",
  "hashtag-giay": "hashtag-giay",
  "certificate-award": "bang-khen",
  "bang-khen": "bang-khen",
  "banner-hiflex": "bang-ron-hiflex",
  "bang-ron-hiflex": "bang-ron-hiflex",
  "poster-pp": "bang-ron-hiflex",
  "poster-chat-lieu-pp": "bang-ron-hiflex",
  "lixi-standard": "bao-li-xi-chuan",
  "bao-li-xi-chuan": "bao-li-xi-chuan",
  "lixi-2026": "bao-li-xi-2026",
  "bao-li-xi-2026": "bao-li-xi-2026",
  "lixi-foil-premium": "bao-li-xi-ep-kim",
  "bao-li-xi-ep-kim": "bao-li-xi-ep-kim",
  "invitation-event": "thiep-su-kien",
  "thiep-su-kien": "thiep-su-kien",
};

export function SubgroupShapesView({
  locale,
  subgroup,
  categoryName,
}: Readonly<{
  locale: Locale;
  subgroup: SubgroupCategory;
  categoryName: string;
}>) {
  const isVi = locale === "vi";
  const [highlightedShapeId, setHighlightedShapeId] = useState<string | null>(null);

  const title = pickLocale(
    locale,
    subgroup.titleVi,
    subgroup.titleEn,
    subgroup.titleZh,
    subgroup.titleJa,
    subgroup.titleKo
  );
  const description = pickLocale(
    locale,
    subgroup.descriptionVi,
    subgroup.descriptionEn
  );

  useEffect(() => {
    function detectAndHighlight() {
      if (typeof window === "undefined") return;
      const hash = window.location.hash.replace(/^#/, "").trim();
      const params = new URLSearchParams(window.location.search);
      const queryTarget = params.get("shape") || params.get("highlight") || params.get("item");
      const target = hash || queryTarget;
      if (!target) return;

      const targetId = SHAPE_ALIASES[target] || target;
      const matched = subgroup.shapes.find(
        (s) => s.id === targetId || s.id === target
      );

      if (matched) {
        setHighlightedShapeId(matched.id);
        const timer = setTimeout(() => {
          const el = document.getElementById(matched.id);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 250);
        return () => clearTimeout(timer);
      }
    }

    detectAndHighlight();
    window.addEventListener("hashchange", detectAndHighlight);
    window.addEventListener("popstate", detectAndHighlight);
    return () => {
      window.removeEventListener("hashchange", detectAndHighlight);
      window.removeEventListener("popstate", detectAndHighlight);
    };
  }, [subgroup.shapes]);

  return (
    <div className="bg-white">
      {/* ── Hero image matching /products/marketing ── */}
      <div className="relative h-[420px] lg:h-[500px] w-full overflow-hidden">
        <Image
          src={subgroup.coverImage}
          alt={title}
          fill
          sizes="100vw"
          className="object-cover"
          preload
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-zinc-950/20" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-6 pb-12 w-full">
            {/* Breadcrumb */}
            <nav
              aria-label="breadcrumb"
              className="flex items-center gap-2 text-sm text-white/60 mb-5 flex-wrap"
            >
              <Link href="/" className="hover:text-white transition-colors">
                {isVi ? "Trang Chủ" : "Home"}
              </Link>
              <span>/</span>
              <Link
                href="/products"
                className="hover:text-white transition-colors"
              >
                {isVi ? "Sản Phẩm" : "Products"}
              </Link>
              <span>/</span>
              <Link
                href={`/products/${subgroup.categoryId}`}
                className="hover:text-white transition-colors"
              >
                {categoryName}
              </Link>
              <span>/</span>
              <span className="text-white font-medium">{title}</span>
            </nav>

            <div className="flex items-end gap-5">
              <span className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shrink-0 shadow-lg">
                <Layers size={28} strokeWidth={1.5} />
              </span>
              <div>
                <p className="text-white/70 text-xs font-bold tracking-widest uppercase mb-1.5 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-400" />
                  {isVi ? "Hình Thức Sản Phẩm" : "Product Formats & Shapes"}
                </p>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                  {title}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Subgroup description bar ── */}
      <div className="border-b border-zinc-100 bg-zinc-50/50">
        <div className="max-w-7xl mx-auto px-6 py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <p className="text-zinc-600 leading-relaxed max-w-3xl text-[15px]">
            {description}
          </p>
          <Link
            href="/#cta"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white text-xs font-bold uppercase tracking-wider btn-wipe whitespace-nowrap rounded-xl shadow-md"
          >
            {isVi ? "Nhận Báo Giá Nhanh" : "Get a Fast Quote"}{" "}
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* ── Shape Cards Grid ── */}
      <div className="max-w-7xl mx-auto px-6 py-14 lg:py-16">
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-zinc-100">
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">
              {isVi ? "Danh Sách Quy Cách" : "Available Shapes"}
            </p>
            <h2 className="text-xl lg:text-2xl font-black text-zinc-900">
              {isVi
                ? `Lựa Chọn Hình Thức Cho ${title}`
                : `Select a Shape for ${title}`}
            </h2>
          </div>
          <span className="px-3 py-1 bg-zinc-100 text-zinc-600 text-xs font-semibold rounded-full">
            {subgroup.shapes.length}{" "}
            {isVi ? "hình thức" : "shapes"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {subgroup.shapes.map((shape) => {
            const isHighlighted = highlightedShapeId === shape.id;
            const shapeName = pickLocale(
              locale,
              shape.nameVi,
              shape.nameEn,
              shape.nameZh,
              shape.nameJa,
              shape.nameKo
            );
            const shapeDesc = pickLocale(
              locale,
              shape.descriptionVi,
              shape.descriptionEn
            );
            const detailHref = `/products/${subgroup.categoryId}/${subgroup.id}/${shape.id}`;

            return (
              <div
                key={shape.id}
                id={shape.id}
                onClick={() => {
                  setHighlightedShapeId(shape.id);
                  if (typeof window !== "undefined") {
                    window.history.replaceState(null, "", `#${shape.id}`);
                  }
                }}
                className={cn(
                  "group flex flex-col rounded-2xl bg-white overflow-hidden transition-all duration-300 relative scroll-mt-28 lg:scroll-mt-32 cursor-pointer",
                  isHighlighted
                    ? "border-2 border-brand-primary ring-4 ring-brand-primary/25 shadow-2xl shadow-brand-primary/15 -translate-y-1.5"
                    : "border border-zinc-200/80 hover:border-brand-primary/40 hover:shadow-xl hover:-translate-y-0.5"
                )}
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden bg-zinc-100 block">
                  <Image
                    src={shape.image}
                    alt={shapeName}
                    fill
                    sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Body */}
                <div className="flex flex-col gap-2.5 p-5 flex-1 bg-white">
                  <p
                    className={cn(
                      "font-black text-base lg:text-lg transition-colors leading-snug",
                      isHighlighted ? "text-brand-primary" : "text-zinc-900 group-hover:text-brand-primary"
                    )}
                  >
                    {shapeName}
                  </p>

                  <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed flex-1">
                    {shapeDesc}
                  </p>

                  <div className="pt-2 border-t border-zinc-100 mt-2 flex items-center justify-between">
                    <Link
                      href={detailHref}
                      onClick={(e) => e.stopPropagation()}
                      className={cn(
                        "inline-flex items-center gap-1.5 text-xs font-bold transition-all",
                        isHighlighted
                          ? "px-3.5 py-1.5 bg-brand-primary text-white rounded-xl shadow-sm hover:bg-brand-primary/90"
                          : "text-brand-primary group-hover:text-brand-primary/80"
                      )}
                    >
                      {isVi ? "Xem chất liệu & báo giá" : "View Materials & Price"}{" "}
                      <ArrowRight
                        size={13}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Bottom Quote Banner ── */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="relative rounded-3xl overflow-hidden shadow-xl">
          <Image
            src="/images/cta/vd-cta-banner.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-brand-dark/85" />
          <div className="relative px-8 sm:px-12 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-brand-primary font-bold text-xs uppercase tracking-widest mb-1">
                {isVi ? "Tư Vấn Miễn Phí" : "Free Consultation"}
              </p>
              <h3 className="font-black text-white text-2xl lg:text-3xl leading-snug">
                {isVi ? "Cần báo giá in ấn cho" : "Need a custom quote for"}{" "}
                <span className="text-brand-primary">{title}</span>?
              </h3>
              <p className="text-white/60 text-sm mt-1 max-w-xl">
                {isVi
                  ? "Đội ngũ kỹ thuật viên Viet Dragon hỗ trợ tính giá tối ưu, tư vấn kích thước và chất liệu trong 30 phút."
                  : "Viet Dragon specialists assist with size, material choice, and prompt quotation within 30 minutes."}
              </p>
            </div>
            <Link
              href="/#cta"
              className="shrink-0 inline-flex items-center gap-2 px-7 py-3.5 bg-brand-primary text-white font-bold uppercase tracking-wide btn-wipe whitespace-nowrap text-sm rounded-xl shadow-lg"
            >
              {isVi ? "Nhận Báo Giá Ngay" : "Get a Quote Now"}{" "}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
