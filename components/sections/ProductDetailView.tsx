import Image from "next/image";
import { ArrowLeft, ArrowRight, ImagePlus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pickLocale } from "@/lib/locale";
import { NamedIcon } from "@/components/ui/named-icon";
import { cn } from "@/lib/utils";
import type { DetailPageModel, GlossaryTrait, Link as PageLink, MaterialPageModel, ShapePageModel } from "@/lib/content/read/pages";
import { MaterialFlashcard } from "@/components/ui/material-flashcard";
import { MaterialGlossaryFab } from "@/components/ui/material-glossary-fab";
import { AutoScrollToTarget } from "@/components/ui/auto-scroll-to-target";

// The page of a product's materials: a product without shapes, one shape of a product, or a material of one (the same cards, scrolled
// to the one the URL named). The three differ in their trail, heading and footer links — nothing else — so one view draws them all.

type Model = DetailPageModel | ShapePageModel | MaterialPageModel;

function allShapesLabel(locale: Locale, title: string): string {
  return pickLocale(
    locale,
    `Xem tất cả hình thức của ${title}`,
    `All shapes of ${title}`,
    `查看 ${title} 的全部款式`,
    `${title} のすべての仕様を見る`,
    `${title}의 모든 형태 보기`
  );
}

interface Frame {
  /** The trail after «category»: the product (when the page is below it), then the page itself. */
  trail: PageLink[];
  last: string;
  pill: PageLink;
  heading: string;
  description: string;
  image: string | null;
  /** The name in the quote banner. */
  askAbout: string;
  /** Set on the plain product page only: the banner button tells the quote form which product was looked at. */
  quoteProduct?: string;
  prev: PageLink | null;
  next: PageLink | null;
  /** Where «previous» leads when there is no previous page, and the link in the middle. */
  back: PageLink;
  all: PageLink;
}

function frameOf(model: Model, locale: Locale, tr: (key: string) => string): Frame {
  const { context } = model;
  if (model.kind === "detail") {
    return {
      trail: [],
      last: context.title,
      pill: context.category,
      heading: context.title,
      description: context.description,
      image: context.cover,
      askAbout: context.title,
      quoteProduct: context.title,
      prev: model.prev,
      next: model.next,
      back: { label: tr("backToCategory"), href: context.category.href },
      all: { label: tr("viewAllInCategory"), href: context.category.href },
    };
  }
  const below = { trail: [context.product], pill: context.product, back: context.product, all: { label: allShapesLabel(locale, context.title), href: context.product.href } };
  if (model.kind === "shape") {
    return {
      ...below,
      last: model.shape.name,
      heading: model.shape.name,
      description: model.shape.description,
      image: model.shape.image,
      askAbout: model.shape.name,
      prev: model.prev,
      next: model.next,
    };
  }
  return { ...below, last: model.material.name, heading: context.title, description: context.description, image: context.cover, askAbout: context.title, prev: null, next: null };
}

function Pagination({ frame, t }: Readonly<{ frame: Frame; t: (key: string) => string }>) {
  const { prev, next } = frame;
  const linkClass = "flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors group";
  return (
    <div className="border-t border-zinc-100">
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between gap-4">
        {prev ? (
          <Link href={prev.href} className={linkClass}>
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">{prev.label}</span>
            <span className="sm:hidden">{t("prevShort")}</span>
          </Link>
        ) : (
          <Link href={frame.back.href} className={linkClass}>
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>{frame.back.label}</span>
          </Link>
        )}

        <Link href={frame.all.href} className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors">
          {frame.all.label}
        </Link>

        {next ? (
          <Link href={next.href} className={linkClass}>
            <span className="hidden sm:inline">{next.label}</span>
            <span className="sm:hidden">{t("nextShort")}</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        ) : (
          <Link href="/#cta" className="flex items-center gap-2 text-sm font-semibold text-brand-primary hover:opacity-80 transition-opacity group">
            <span>{t("getQuote")}</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>
    </div>
  );
}

export async function ProductDetailView({ locale, model, traits }: Readonly<{ locale: Locale; model: Model; traits: readonly GlossaryTrait[] }>) {
  const t = await getTranslations({ locale, namespace: "productDetailPage" });
  const frame = frameOf(model, locale, t);
  const { context, cards } = model;
  const target = model.kind === "material" ? model.material : null;

  return (
    <div className="bg-white">
      {/* The URL named a material: scroll to its card once the page has settled (a URL hash is handled by SmoothScroll). */}
      {target && <AutoScrollToTarget targetId={target.anchor.id} />}

      {/* ── Breadcrumb ── */}
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-6">
        <nav aria-label="breadcrumb" className="flex items-center gap-2 text-sm text-zinc-400 flex-wrap">
          <Link href="/" className="hover:text-zinc-700 transition-colors">{t("breadcrumbHome")}</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-zinc-700 transition-colors">{t("breadcrumbProducts")}</Link>
          <span>/</span>
          <Link href={context.category.href} className="hover:text-zinc-700 transition-colors">{context.category.label}</Link>
          <span>/</span>
          {frame.trail.map((step) => (
            <span key={step.href} className="contents">
              <Link href={step.href} className="hover:text-zinc-700 transition-colors">{step.label}</Link>
              <span>/</span>
            </span>
          ))}
          <span className="text-zinc-700 font-medium">{frame.last}</span>
        </nav>
      </div>

      {/* ── Product panel ── */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          <div className="aspect-square rounded-2xl border border-zinc-100 overflow-hidden bg-zinc-100 lg:sticky lg:top-28">
            <div className="relative w-full h-full">
              {frame.image ? (
                <Image
                  src={frame.image}
                  alt={frame.askAbout}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                  preload
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-200/50 p-6 select-none">
                  <div className="p-4 rounded-2xl bg-white/80 shadow-2xs border border-zinc-200/60 mb-2">
                    <ImagePlus size={36} strokeWidth={1.5} className="text-zinc-400" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-400 tracking-wide text-center">{frame.askAbout}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <Link
              href={frame.pill.href}
              className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full bg-zinc-50 border border-zinc-200 text-zinc-600 text-xs font-semibold hover:border-zinc-300 hover:text-zinc-900 transition-colors"
            >
              <NamedIcon name={context.category.icon} size={13} strokeWidth={1.5} /> {frame.pill.label}
            </Link>

            <h1 className="text-3xl lg:text-4xl font-black text-zinc-900 leading-tight">{frame.heading}</h1>

            <p className="text-zinc-500 leading-relaxed">{frame.description}</p>

            {cards.length > 0 && (
              <div className="flex flex-col gap-8 mt-2">
                <div className="flex flex-col gap-6">
                  {cards.map((card) => (
                    <div
                      key={card.uid}
                      id={card.anchor.id}
                      data-aliases={card.anchor.aliases.join(" ")}
                      className={cn(
                        "scroll-mt-28 lg:scroll-mt-32 relative transition-all duration-300",
                        target?.uid === card.uid && "ring-2 ring-brand-primary ring-offset-4 rounded-2xl p-1"
                      )}
                    >
                      <p className="font-black text-zinc-900 text-[15px] leading-snug mb-2.5">{card.tagline}</p>
                      <MaterialFlashcard
                        card={card}
                        locale={locale}
                        descriptionLabel={t("optionDescriptionLabel")}
                        bestForLabel={t("optionBestForLabel")}
                        viewImageHint={t("optionViewImageHint")}
                        backToDetailsHint={t("optionBackToDetailsHint")}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {cards.length > 0 && <MaterialGlossaryFab traits={traits} />}

      {/* ── Quote CTA ── */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="relative rounded-2xl overflow-hidden">
          <Image src="/images/cta/vd-cta-banner.jpg" alt="" fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-brand-dark/85" />
          <div className="relative px-10 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-black text-white text-2xl">
                {t("ctaTitleLine1")}{" "}
                <span className="text-brand-primary">{frame.askAbout}</span>?
              </h3>
              <p className="text-white/50 text-sm mt-1">{t("ctaSubtitle")}</p>
            </div>
            <Link
              href="/#cta"
              data-quote-product={frame.quoteProduct}
              className="shrink-0 inline-flex items-center gap-2 px-7 py-3.5 bg-brand-primary text-white font-bold uppercase tracking-wide btn-wipe whitespace-nowrap text-sm"
            >
              {t("ctaButton")} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      <Pagination frame={frame} t={t} />
    </div>
  );
}
