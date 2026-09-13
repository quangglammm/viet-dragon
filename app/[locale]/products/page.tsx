import type { Metadata } from "next";
import Image from "next/image";
import {
  Briefcase, Package, Calendar, Gift, User, Layers, Zap, Sparkles,
  ArrowRight, type LucideIcon,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pickLocale } from "@/lib/locale";
import type { Locale } from "@/i18n/routing";
import { productCategories, showcaseImages } from "@/data/categories";

const iconMap: Record<string, LucideIcon> = { Briefcase, Package, Calendar, Gift, User, Layers, Zap, Sparkles };

const SHOWCASE_LABELS: Record<string, { zh: string; ja: string; ko: string }> = {
  "vd-show-1": { zh: "高端商务名片", ja: "プレミアムビジネス名刺", ko: "프리미엄 비즈니스 명함" },
  "vd-show-2": { zh: "奢华礼品包装盒", ja: "高級ペーパーボックス包装", ko: "고급 패키지 박스" },
  "vd-show-3": { zh: "专业企业画册", ja: "プロフェッショナルカタログ", ko: "전문 기업 카탈로그" },
  "vd-show-4": { zh: "精致标签贴纸", ja: "上質ラベルシール", ko: "정밀 라벨 스티커" },
  "vd-show-5": { zh: "新年春节红包", ja: "お年玉・新年ポチ袋", ko: "새해 세뱃돈 봉투" },
};

const CATEGORY_NAMES: Record<string, { zh: string; ja: string; ko: string }> = {
  marketing: { zh: "营销物料", ja: "マーケティング", ko: "마케팅" },
  office: { zh: "办公文具", ja: "オフィス用品", ko: "오피스/사무" },
  packaging: { zh: "包装制品", ja: "パッケージ包装", ko: "패키지/포장" },
  tet: { zh: "新年年品", ja: "テト・新年", ko: "새해 인쇄물" },
  other: { zh: "其他印刷品", ja: "その他印刷", ko: "기타 인쇄물" },
};

const CATEGORY_DESCS: Record<string, { zh: string; ja: string; ko: string }> = {
  marketing: {
    zh: "用于向客户和合作伙伴展示品牌与产品的印刷物料 —— 打造卓越第一印象并助力销售转化。",
    ja: "顧客やパートナーへブランド・製品を効果的にアピールする印刷物 — 最高の第一印象と営業支援を実現。",
    ko: "고객 및 파트너에게 브랜드와 제품을 효과적으로 전달하는 인쇄 제작물 — 탁월한 첫인상과 비즈니스 성장을 지원합니다.",
  },
  office: {
    zh: "日常行政办公及品牌专业形象识别系统必备的各类办公印刷品。",
    ja: "日々の業務とブランド統一感を高める、オフィスに欠かせないビジネス印刷アイテム。",
    ko: "일상적인 업무 효율과 기업의 일관된 브랜드 아이덴티티를 위한 필수 오피스 인쇄물.",
  },
  packaging: {
    zh: "高品质产品包装盒、精品手提袋及安全运输纸箱，提升产品开箱体验与品牌价值。",
    ja: "製品の価値を高め、安全にお届けする化粧箱・ショッパー・ギフトパッケージ。",
    ko: "제품의 가치를 높이고 안전하게 보호하는 고급 패키지 박스, 종이 쇼핑백 및 포장재.",
  },
  tet: {
    zh: "精美新年台历、挂历、传统红包袋及企业专属春节礼盒。",
    ja: "カレンダー、お年玉袋、企業向け迎春ギフトボックスなど、新年を彩る特別印刷物。",
    ko: "새해 캘린더, 세뱃돈 봉투, 기업용 설맞이 특별 선물 세트 등 신년 맞춤 인쇄물.",
  },
  other: {
    zh: "各类广告展示、活动物料、礼品及特色辅助印刷品。",
    ja: "各種広告ディスプレイ、イベント販促物、ギフトおよび特殊印刷物。",
    ko: "특수 광고 디스플레이, 이벤트 홍보물, 판촉물 및 기타 인쇄물.",
  },
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "productsPage" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function ProductsPage({
  params,
}: Readonly<{
  params: Promise<{ locale: Locale }>;
}>) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "productsPage" });
  const [s1, s2, s3, s4, s5] = showcaseImages;
  const showcaseLabel = (s: (typeof showcaseImages)[number]) =>
    pickLocale(locale, s.label, s.labelEn, SHOWCASE_LABELS[s.seed]?.zh, SHOWCASE_LABELS[s.seed]?.ja, SHOWCASE_LABELS[s.seed]?.ko);

  return (
    <div className="bg-white">
      {/* ── Page header ── */}
      <div className="max-w-7xl mx-auto px-6 pt-14 pb-10">
        <nav aria-label="breadcrumb" className="flex items-center gap-2 text-sm text-zinc-400 mb-10">
          <Link href="/" className="hover:text-zinc-700 transition-colors">{t("breadcrumbHome")}</Link>
          <span>/</span>
          <span className="text-zinc-700 font-medium">{t("breadcrumbCurrent")}</span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <p className="text-brand-primary text-sm font-semibold tracking-widest uppercase mb-3">
              {t("eyebrow")}
            </p>
            <h1 className="text-5xl lg:text-6xl font-black text-zinc-900 leading-tight">
              {t("titleLine1")}{" "}
              <span className="text-brand-primary">{t("titleHighlight")}</span>
            </h1>
          </div>
          <p className="text-zinc-500 max-w-sm leading-relaxed lg:text-right text-sm">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* ── Editorial showcase gallery ── */}
      <div className="max-w-7xl mx-auto px-6 pb-16">

        {/* Mobile grid (< lg): simple 2-column with fixed card heights */}
        <div className="lg:hidden grid grid-cols-2 gap-3">
          {showcaseImages.map((s, i) => (
            <div
              key={s.seed}
              className={`relative rounded-2xl overflow-hidden group ${i === 0 ? "col-span-2 h-52" : "h-40"}`}
            >
              <Image
                src={s.src}
                alt={showcaseLabel(s)}
                fill
                sizes="50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3">
                <p className="text-white font-black text-sm">{showcaseLabel(s)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop editorial layout (lg+) */}
        <div className="hidden lg:block">
          {/* Row 1: tall left + 2 squares right */}
          <div className="grid grid-cols-3 gap-3 h-[480px]">
            {/* Large portrait */}
            <div className="col-span-1 relative rounded-2xl overflow-hidden group">
              <Image
                src={s1.src}
                alt={showcaseLabel(s1)}
                fill
                sizes="33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5">
                <p className="text-white font-black text-base">{showcaseLabel(s1)}</p>
              </div>
            </div>

            {/* Right: 2 squares stacked */}
            <div className="col-span-2 grid grid-rows-2 gap-3">
              {[s2, s3].map((s) => (
                <div key={s.seed} className="relative rounded-2xl overflow-hidden group">
                  <Image
                    src={s.src}
                    alt={showcaseLabel(s)}
                    fill
                    sizes="66vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/10 to-transparent" />
                  <div className="absolute bottom-4 left-5">
                    <p className="text-white font-black text-sm">{showcaseLabel(s)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: 2 wide side-by-side */}
          <div className="grid grid-cols-2 gap-3 mt-3 h-[260px]">
            {[s4, s5].map((s) => (
              <div key={s.seed} className="relative rounded-2xl overflow-hidden group">
                <Image
                  src={s.src}
                  alt={showcaseLabel(s)}
                  fill
                  sizes="50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-5">
                  <p className="text-white font-black text-sm">{showcaseLabel(s)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gallery caption */}
        <p className="text-center text-xs text-zinc-400 mt-4">
          {t("galleryCaption")}
        </p>
      </div>

      {/* ── Category grid ── */}
      <div className="border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <p className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-8">
            {t("browseByCategory")}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {productCategories.map((cat) => {
              const Icon = iconMap[cat.icon] ?? Briefcase;
              const name = pickLocale(locale, cat.nameVi, cat.nameEn, CATEGORY_NAMES[cat.id]?.zh, CATEGORY_NAMES[cat.id]?.ja, CATEGORY_NAMES[cat.id]?.ko);
              const description = pickLocale(locale, cat.descriptionVi, cat.description, CATEGORY_DESCS[cat.id]?.zh, CATEGORY_DESCS[cat.id]?.ja, CATEGORY_DESCS[cat.id]?.ko);
              return (
                <div key={cat.id} className="group block">
                  <div className="h-full rounded-2xl border border-zinc-100 overflow-hidden hover:border-zinc-300 hover:shadow-lg transition-all duration-300 bg-white flex flex-col">
                    {/* Cover image */}
                    <Link href={`/products/${cat.id}`} className="block relative h-52 overflow-hidden shrink-0">
                      <Image
                        src={cat.coverImage}
                        alt={name}
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/70 to-transparent" />
                      <div className="absolute bottom-4 left-5 flex items-center gap-3">
                        <span className="p-2 rounded-lg bg-white/20 backdrop-blur-sm text-white">
                          <Icon size={18} strokeWidth={1.5} />
                        </span>
                        <div>
                          <p className="text-white font-black text-base leading-snug">{name}</p>
                        </div>
                      </div>
                      <ArrowRight
                        size={18}
                        className="absolute top-4 right-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all duration-200"
                      />
                    </Link>

                    {/* Card body */}
                    <div className="p-6 flex flex-col justify-between gap-6 flex-1">
                      <div className="flex flex-col gap-4">
                        <Link
                          href={`/products/${cat.id}`}
                          className="block text-zinc-500 text-sm leading-relaxed hover:text-zinc-800 transition-colors"
                        >
                          {description}
                        </Link>
                        {/* Subcategory buttons: visible on mobile, smooth slide-up reveal on desktop hover */}
                        <div className="flex flex-wrap gap-2 pt-1 opacity-100 lg:opacity-0 lg:-translate-y-2 lg:pointer-events-none lg:group-hover:opacity-100 lg:group-hover:translate-y-0 lg:group-hover:pointer-events-auto transition-all duration-300">
                          {cat.items.map((item) => (
                            <Link
                              key={item.id}
                              href={`/products/${cat.id}/${item.id}`}
                              className="px-3.5 py-1.5 bg-zinc-50 hover:bg-brand-soft hover:text-brand-primary border border-zinc-200 hover:border-brand-primary/30 text-zinc-700 text-xs font-semibold rounded-full transition-all duration-200"
                            >
                              {pickLocale(locale, item.nameVi, item.nameEn, ITEM_NAMES[item.id]?.zh, ITEM_NAMES[item.id]?.ja, ITEM_NAMES[item.id]?.ko)}
                            </Link>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                        <Link
                          href={`/products/${cat.id}`}
                          className="text-brand-primary text-sm font-semibold hover:underline"
                        >
                          {t("viewDetail")}
                        </Link>
                        <span className="text-xs text-zinc-400 font-medium">
                          {locale === "vi"
                            ? `${cat.items.length} sản phẩm`
                            : locale === "zh"
                            ? `${cat.items.length} 款产品`
                            : locale === "ja"
                            ? `${cat.items.length} 製品`
                            : locale === "ko"
                            ? `${cat.items.length} 개 제품`
                            : `${cat.items.length} products`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Bottom CTA ── */}
      <div className="relative overflow-hidden">
        <Image
          src="/images/cta/vd-cta-banner.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-brand-dark/85" />
        <div className="relative max-w-7xl mx-auto px-6 py-16 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl font-black text-white">
              {t("ctaTitleLine1")}{" "}
              <span className="text-brand-primary">{t("ctaTitleHighlight")}</span>
            </h3>
            <p className="text-white/50 mt-1 text-sm">
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
  );
}
