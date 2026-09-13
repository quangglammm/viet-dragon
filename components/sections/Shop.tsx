"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Eye, MessageSquareText } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SectionHeading } from "@/components/ui/section-heading";
import { pickLocale } from "@/lib/locale";
import type { Locale } from "@/i18n/routing";
import { productCategories } from "@/data/categories";
import { cn } from "@/lib/utils";

const CATEGORY_NAMES: Record<string, { zh: string; ja: string; ko: string }> = {
  marketing: { zh: "营销物料", ja: "マーケティング", ko: "마케팅" },
  office: { zh: "办公文具", ja: "オフィス用品", ko: "오피스/사무" },
  packaging: { zh: "包装制品", ja: "パッケージ包装", ko: "패키지/포장" },
  tet: { zh: "新年年品", ja: "テト・新年", ko: "새해 인쇄물" },
  other: { zh: "其他印刷品", ja: "その他印刷", ko: "기타 인쇄물" },
};

const ITEM_NAMES: Record<string, { zh: string; ja: string; ko: string }> = {
  card: { zh: "商务名片 / 会员卡", ja: "名刺 / カード", ko: "명함 / 카드" },
  catalogue: { zh: "企业画册 / 目录", ja: "カタログ / 会社案内", ko: "카탈로그 / 브로슈어" },
  flyer: { zh: "宣传单页 / 折页", ja: "チラシ / リーフレット", ko: "전단지 / 리플렛" },
  voucher: { zh: "优惠券 / 代金券", ja: "クーポン / 引換券", ko: "쿠폰 / 바우처" },
  envelope: { zh: "商务信封", ja: "封筒印刷", ko: "봉투" },
  letterhead: { zh: "信纸便笺", ja: "便箋 / レターヘッド", ko: "레터헤드" },
  folder: { zh: "文件夹 / 封套", ja: "フォルダ / ポケットファイル", ko: "홀더 / 파일" },
  decal: { zh: "不干胶标签 / 贴纸", ja: "シール / ラベル印刷", ko: "라벨 / 스티커" },
  "paper-bag": { zh: "精品纸袋 / 手提袋", ja: "紙袋 / 手提げ袋", ko: "종이 쇼핑백" },
  box: { zh: "定制包装盒", ja: "オリジナル化粧箱", ko: "맞춤 박스" },
  "paper-box": { zh: "精品礼品盒", ja: "ギフトボックス", ko: "선물 상자" },
  "li-xi": { zh: "新年红包袋", ja: "お年玉・ポチ袋", ko: "세뱃돈 봉투" },
  calendar: { zh: "企业挂历 / 台历", ja: "カレンダー", ko: "달력 / 캘린더" },
};

export default function Shop() {
  const [active, setActive] = useState(0);
  const cat = productCategories[active];
  const t = useTranslations("shop");
  const locale = useLocale() as Locale;

  return (
    <section id="products" className="relative w-full bg-white py-14 lg:py-20">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          className="text-center mb-10"
        />

        {/* Tab nav */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {productCategories.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setActive(i)}
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-semibold transition-colors",
                active === i
                  ? "bg-brand-primary text-white"
                  : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
              )}
            >
              {pickLocale(locale, c.nameVi, c.nameEn, CATEGORY_NAMES[c.id]?.zh, CATEGORY_NAMES[c.id]?.ja, CATEGORY_NAMES[c.id]?.ko)}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={cat.id}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            {cat.items.map((item) => {
              const itemName = pickLocale(locale, item.nameVi, item.nameEn, ITEM_NAMES[item.id]?.zh, ITEM_NAMES[item.id]?.ja, ITEM_NAMES[item.id]?.ko);
              return (
                <div key={item.id} className="group flex flex-col">
                  <div className="relative h-56 rounded-2xl overflow-hidden bg-zinc-100">
                    <Image
                      src={item.image}
                      alt={itemName}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Hover overlay actions */}
                    <div className="absolute inset-0 bg-zinc-900/0 group-hover:bg-zinc-900/30 transition-colors duration-300" />
                    <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      <Link
                        href={`/products/${cat.id}/${item.id}`}
                        aria-label={t("viewDetail")}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-zinc-700 hover:bg-brand-primary hover:text-white transition-colors"
                      >
                        <Eye size={16} />
                      </Link>
                      <Link
                        href="/#cta"
                        aria-label={t("requestQuote")}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-zinc-700 hover:bg-brand-primary hover:text-white transition-colors"
                      >
                        <MessageSquareText size={16} />
                      </Link>
                    </div>
                  </div>
                  <div className="pt-4">
                    <h3 className="font-black text-zinc-900 text-sm">
                      <Link href={`/products/${cat.id}/${item.id}`} className="hover:text-brand-primary transition-colors">
                        {itemName}
                      </Link>
                    </h3>
                    <Link href="/#cta" className="inline-block mt-2 text-brand-primary text-xs font-semibold">
                      {t("requestQuoteArrow")}
                    </Link>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
