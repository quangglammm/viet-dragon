import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Briefcase, Package, Calendar, Gift, User, Layers, Zap, Sparkles,
  ArrowLeft, ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pickLocale } from "@/lib/locale";
import type { Locale } from "@/i18n/routing";
import { productCategories } from "@/data/categories";
import { MaterialFlashcard } from "@/components/ui/material-flashcard";
import { MaterialGlossaryFab } from "@/components/ui/material-glossary-fab";

const iconMap: Record<string, LucideIcon> = { Briefcase, Package, Calendar, Gift, User, Layers, Zap, Sparkles };

const CATEGORY_NAMES: Record<string, { zh: string; ja: string; ko: string }> = {
  marketing: { zh: "营销物料", ja: "マーケティング", ko: "마케팅" },
  office: { zh: "办公文具", ja: "オフィス用品", ko: "오피스/사무" },
  packaging: { zh: "包装制品", ja: "パッケージ包装", ko: "패키지/포장" },
  tet: { zh: "新年年品", ja: "テト・新年", ko: "새해 인쇄물" },
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

const ITEM_DESCS: Record<string, { zh: string; ja: string; ko: string }> = {
  card: {
    zh: "商务名片、会员卡及积分卡制作。",
    ja: "名刺、会員カード、ポイントカード印刷。",
    ko: "비즈니스 명함, 멤버십 카드 및 포인트 카드 제작.",
  },
  catalogue: {
    zh: "产品目录、企业画册及宣传画册。",
    ja: "製品カタログ、会社案内、パンフレット。",
    ko: "제품 카탈로그, 기업 소개서 및 브로슈어.",
  },
  flyer: {
    zh: "适用于活动与营销推广的单页及折页宣传单。",
    ja: "イベントやキャンペーン向けのチラシ・リーフレット。",
    ko: "이벤트 및 마케팅 캠페인을 위한 전단지 및 리플렛.",
  },
  voucher: {
    zh: "优惠券、礼品卡及活动门票。",
    ja: "割引クーポン、ギフトカード、各種チケット。",
    ko: "할인 쿠폰, 기프트 카드 및 이벤트 티켓.",
  },
  envelope: {
    zh: "包含小号、中号及大号的标准商务信封。",
    ja: "長形・角形など各種サイズの標準ビジネス封筒。",
    ko: "소형, 중형, 대형 규격의 표준 비즈니스 봉투.",
  },
  letterhead: {
    zh: "印有公司官方品牌标识的标准信纸便笺。",
    ja: "公式ブランドロゴ入りの標準レターヘッド・便箋。",
    ko: "공식 브랜드 로고가 인쇄된 표준 레터헤드 및 서식지.",
  },
  folder: {
    zh: "用于存放合同、提案书及资料的商务文件夹封套。",
    ja: "契約書や企画書、資料をまとめるポケットファイル・フォルダ。",
    ko: "계약서, 제안서 및 서류 보관을 위한 맞춤형 홀더/파일.",
  },
  decal: {
    zh: "纸质、塑料或透明材质的不干胶产品标签及模切贴纸。",
    ja: "紙・フィルム・透明素材の製品ラベルおよびダイカットシール。",
    ko: "종이, 유포지, 투명 재질의 제품 라벨 및 다이컷 스티커.",
  },
  "paper-bag": {
    zh: "牛皮纸或铜版纸材质的品牌购物纸袋及精美礼品袋。",
    ja: "クラフト紙やコート紙を使用したブランドショッパー・ギフト紙袋。",
    ko: "크라프트지 및 코팅지 소재의 브랜드 쇼핑백 및 선물용 종이백.",
  },
  box: {
    zh: "印有品牌标识的定制纸箱及快递发货包装盒。",
    ja: "ブランドロゴ入り段ボール箱および配送用パッケージ。",
    ko: "브랜드 로고가 인쇄된 맞춤형 골판지 상자 및 배송용 택배 박스.",
  },
  "paper-box": {
    zh: "用于零售产品的高端精装硬盒与精美纸盒包装。",
    ja: "小売製品向けの高級貼箱・化粧箱パッケージ。",
    ko: "리테일 상품을 위한 고급 싸바리 하드 박스 및 종이 단상자.",
  },
  "li-xi": {
    zh: "传统与现代风格的农历新年红包袋。",
    ja: "伝統的・モダンなデザインの旧正月・お年玉袋。",
    ko: "전통 및 현대적 디자인의 설날 세뱃돈 봉투.",
  },
  calendar: {
    zh: "企业台历、挂历及新年商务日程礼品。",
    ja: "卓上カレンダー、壁掛けカレンダー、新年ギフト。",
    ko: "탁상 달력, 벽걸이 캘린더 및 신년 비즈니스 선물.",
  },
};

export function generateStaticParams() {
  return productCategories.flatMap((cat) =>
    cat.items.map((item) => ({ categoryId: cat.id, productId: item.id }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; categoryId: string; productId: string }>;
}): Promise<Metadata> {
  const { locale, categoryId, productId } = await params;
  const cat = productCategories.find((c) => c.id === categoryId);
  const item = cat?.items.find((i) => i.id === productId);
  if (!cat || !item) return {};
  return {
    title: `${pickLocale(locale, item.nameVi, item.nameEn, ITEM_NAMES[item.id]?.zh, ITEM_NAMES[item.id]?.ja, ITEM_NAMES[item.id]?.ko)} | Viet Dragon`,
    description: pickLocale(locale, item.descriptionVi, item.description, ITEM_DESCS[item.id]?.zh, ITEM_DESCS[item.id]?.ja, ITEM_DESCS[item.id]?.ko),
  };
}

export default async function ProductDetailPage({
  params,
}: Readonly<{
  params: Promise<{ locale: Locale; categoryId: string; productId: string }>;
}>) {
  const { locale, categoryId, productId } = await params;
  const t = await getTranslations({ locale, namespace: "productDetailPage" });
  const cat = productCategories.find((c) => c.id === categoryId);
  const item = cat?.items.find((i) => i.id === productId);
  if (!cat || !item) notFound();

  const name = pickLocale(locale, item.nameVi, item.nameEn, ITEM_NAMES[item.id]?.zh, ITEM_NAMES[item.id]?.ja, ITEM_NAMES[item.id]?.ko);
  const catName = pickLocale(locale, cat.nameVi, cat.nameEn, CATEGORY_NAMES[cat.id]?.zh, CATEGORY_NAMES[cat.id]?.ja, CATEGORY_NAMES[cat.id]?.ko);
  const Icon = iconMap[cat.icon] ?? Briefcase;

  const idx = cat.items.findIndex((i) => i.id === productId);
  const prev = idx > 0 ? cat.items[idx - 1] : null;
  const next = idx < cat.items.length - 1 ? cat.items[idx + 1] : null;

  return (
    <div className="bg-white">
      {/* ── Breadcrumb ── */}
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-6">
        <nav aria-label="breadcrumb" className="flex items-center gap-2 text-sm text-zinc-400 flex-wrap">
          <Link href="/" className="hover:text-zinc-700 transition-colors">{t("breadcrumbHome")}</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-zinc-700 transition-colors">{t("breadcrumbProducts")}</Link>
          <span>/</span>
          <Link href={`/products/${cat.id}`} className="hover:text-zinc-700 transition-colors">{catName}</Link>
          <span>/</span>
          <span className="text-zinc-700 font-medium">{name}</span>
        </nav>
      </div>

      {/* ── Product panel ── */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          <div className="aspect-square rounded-2xl border border-zinc-100 overflow-hidden bg-zinc-100 lg:sticky lg:top-28">
            <div className="relative w-full h-full">
              <Image
                src={item.image}
                alt={name}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
                preload
              />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <Link
              href={`/products/${cat.id}`}
              className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full bg-zinc-50 border border-zinc-200 text-zinc-600 text-xs font-semibold hover:border-zinc-300 hover:text-zinc-900 transition-colors"
            >
              <Icon size={13} strokeWidth={1.5} /> {catName}
            </Link>

            <h1 className="text-3xl lg:text-4xl font-black text-zinc-900 leading-tight">{name}</h1>

            <p className="text-zinc-500 leading-relaxed">
              {pickLocale(locale, item.descriptionVi, item.description, ITEM_DESCS[item.id]?.zh, ITEM_DESCS[item.id]?.ja, ITEM_DESCS[item.id]?.ko)}
            </p>

            {item.optionGroups && item.optionGroups.length > 0 && (
              <div className="flex flex-col gap-8 mt-2">
                {item.optionGroups.map((group) => (
                  <div
                    key={group.options.map((opt) => opt.name).join("-")}
                    className="flex flex-col gap-6"
                  >
                    {group.options.map((opt) => (
                      <div key={opt.name}>
                        <p className="font-black text-zinc-900 text-[15px] leading-snug mb-2.5">
                          {pickLocale(locale, opt.taglineVi, opt.tagline)}
                        </p>
                        <MaterialFlashcard
                          option={opt}
                          locale={locale}
                          productName={name}
                          fallbackImage={item.image}
                          descriptionLabel={t("optionDescriptionLabel")}
                          bestForLabel={t("optionBestForLabel")}
                          viewImageHint={t("optionViewImageHint")}
                          backToDetailsHint={t("optionBackToDetailsHint")}
                          foilCheckboxLabel={t("optionFoilCheckboxLabel")}
                          doubleSidedCheckboxLabel={t("optionDoubleSidedCheckboxLabel")}
                          hideFoilCheckbox={opt.hideFoilCheckbox ?? item.hideFoilCheckbox}
                          hideDoubleSidedCheckbox={opt.hideDoubleSidedCheckbox ?? item.hideDoubleSidedCheckbox}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {item.optionGroups && item.optionGroups.length > 0 && <MaterialGlossaryFab />}

      {/* ── Quote CTA ── */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="relative rounded-2xl overflow-hidden">
          <Image
            src="/images/cta/vd-cta-banner.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-brand-dark/85" />
          <div className="relative px-10 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-black text-white text-2xl">
                {t("ctaTitleLine1")}{" "}
                <span className="text-brand-primary">{name}</span>?
              </h3>
              <p className="text-white/50 text-sm mt-1">
                {t("ctaSubtitle")}
              </p>
            </div>
            <Link
              href="/#cta"
              className="shrink-0 inline-flex items-center gap-2 px-7 py-3.5 bg-brand-primary text-white font-bold uppercase tracking-wide btn-wipe whitespace-nowrap text-sm"
            >
              {t("ctaButton")} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Product pagination ── */}
      <div className="border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between gap-4">
          {prev ? (
            <Link
              href={`/products/${cat.id}/${prev.id}`}
              className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">{pickLocale(locale, prev.nameVi, prev.nameEn, ITEM_NAMES[prev.id]?.zh, ITEM_NAMES[prev.id]?.ja, ITEM_NAMES[prev.id]?.ko)}</span>
              <span className="sm:hidden">{t("prevShort")}</span>
            </Link>
          ) : (
            <Link
              href={`/products/${cat.id}`}
              className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>{t("backToCategory")}</span>
            </Link>
          )}

          <Link href={`/products/${cat.id}`} className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors">
            {t("viewAllInCategory")}
          </Link>

          {next ? (
            <Link
              href={`/products/${cat.id}/${next.id}`}
              className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors group"
            >
              <span className="hidden sm:inline">{pickLocale(locale, next.nameVi, next.nameEn, ITEM_NAMES[next.id]?.zh, ITEM_NAMES[next.id]?.ja, ITEM_NAMES[next.id]?.ko)}</span>
              <span className="sm:hidden">{t("nextShort")}</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <Link
              href="/#cta"
              className="flex items-center gap-2 text-sm font-semibold text-brand-primary hover:opacity-80 transition-opacity group"
            >
              <span>{t("getQuote")}</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
