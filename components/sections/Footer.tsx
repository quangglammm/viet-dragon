"use client";

import { useState } from "react";
import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { pickLocale } from "@/lib/locale";
import type { Locale } from "@/i18n/routing";
import { productCategories, isFastPrint, getStartingPrice, type ProductItem, type ProductCategory } from "@/data/categories";
import { IconBadge } from "@/components/ui/icon-badge";
import { cn } from "@/lib/utils";

const usefulLinkHrefs = ["/#about", "/#services", "/#process", "/#testimonials", "/#faq"] as const;
const usefulLinkKeys = ["about", "services", "process", "testimonials", "faq"] as const;

// lucide-react dropped brand/social marks — minimal inline glyphs instead.
function FacebookIcon({ size = 15 }: Readonly<{ size?: number }>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.5 21v-8.5H16l.5-3.5h-3V6.8c0-1 .3-1.7 1.7-1.7H16.5V1.4C16.2 1.3 15.2 1.2 14 1.2c-2.5 0-4.2 1.5-4.2 4.3V9H7.3v3.5h2.5V21h3.7z" />
    </svg>
  );
}
function InstagramIcon({ size = 15 }: Readonly<{ size?: number }>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.9c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1s-3.6 0-4.9-.1c-3.3-.1-4.8-1.7-4.9-4.9-.1-1.3-.1-1.6-.1-4.8s0-3.6.1-4.9c.1-3.2 1.7-4.8 4.9-4.9 1.3-.1 1.6-.1 4.9-.1zm0-2.2C8.7 0 8.3 0 7 .1 2.7.3.3 2.7.1 7 0 8.3 0 8.7 0 12s0 3.7.1 5c.2 4.3 2.6 6.7 6.9 6.9 1.3.1 1.7.1 5 .1s3.7 0 5-.1c4.3-.2 6.7-2.6 6.9-6.9.1-1.3.1-1.7.1-5s0-3.7-.1-5C23.7 2.7 21.3.3 17 .1 15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8z" />
    </svg>
  );
}
function YoutubeIcon({ size = 15 }: Readonly<{ size?: number }>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.5 6.2c-.3-1-1-1.8-2-2.1C19.7 3.5 12 3.5 12 3.5s-7.7 0-9.5.6c-1 .3-1.7 1.1-2 2.1C0 8 0 12 0 12s0 4 .5 5.8c.3 1 1 1.8 2 2.1 1.8.6 9.5.6 9.5.6s7.7 0 9.5-.6c1-.3 1.7-1.1 2-2.1.5-1.8.5-5.8.5-5.8s0-4-.5-5.8zM9.5 15.5V8.5l6.4 3.5-6.4 3.5z" />
    </svg>
  );
}

// Placeholder social hrefs — swap for real profile URLs once they exist.
const socialLinks = [
  { icon: FacebookIcon, href: "https://facebook.com", name: "Facebook" },
  { icon: InstagramIcon, href: "https://instagram.com", name: "Instagram" },
  { icon: YoutubeIcon, href: "https://youtube.com", name: "YouTube" },
];

interface FooterCategoryItemProps {
  cat: ProductCategory;
  locale: Locale;
  activeItem: ProductItem;
  onHoverItem: (catId: string, item: ProductItem) => void;
}

function FooterCategoryItem({
  cat,
  locale,
  activeItem,
  onHoverItem,
}: Readonly<FooterCategoryItemProps>) {
  return (
    <li className="group relative w-max">
      <Link
        href={`/products#${cat.id}`}
        className="inline-block text-sm text-brand-dark/60 group-hover:text-brand-primary group-hover:translate-x-1 transition-all duration-200 py-1 font-medium"
      >
        {pickLocale(locale, cat.nameVi, cat.nameEn)}
      </Link>

      {/* Hover Sub-categories Card (Sample Image 2 Style) */}
      <div className="absolute left-0 lg:left-full bottom-full lg:bottom-auto lg:-top-6 mb-2 lg:mb-0 lg:ml-3 w-[460px] bg-white rounded-2xl shadow-2xl border border-zinc-100 p-4 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50 text-zinc-800 flex gap-4">
        {/* Left Side Preview */}
        <div className="w-44 shrink-0 bg-zinc-50 border border-zinc-200/60 rounded-xl p-3 text-center flex flex-col items-center justify-between">
          <div className="w-full">
            <div className="relative w-full h-28 rounded-lg overflow-hidden mb-2 bg-white shadow-xs">
              <Image
                src={activeItem.image}
                alt={pickLocale(locale, activeItem.nameVi, activeItem.nameEn)}
                fill
                sizes="176px"
                className="object-cover"
              />
            </div>
            <h5 className="text-[11px] font-bold text-emerald-700 uppercase leading-snug">
              {pickLocale(locale, activeItem.nameVi, activeItem.nameEn)}
            </h5>
            <p className="text-[10px] text-zinc-500 italic mt-0.5 line-clamp-2">
              {pickLocale(locale, activeItem.descriptionVi, activeItem.description)}
            </p>
          </div>
          <p className="text-[11px] font-semibold text-emerald-700 italic mt-2">
            {getStartingPrice(activeItem.id, locale)}
          </p>
        </div>

        {/* Right Side Items List */}
        <div className="flex-1 min-w-0">
          <ul className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-1">
            {cat.items.map((item) => {
              const isHovered = activeItem.id === item.id;
              return (
                <li key={item.id}>
                  <Link
                    href={`/products/${cat.id}/${item.id}`}
                    onMouseEnter={() => onHoverItem(cat.id, item)}
                    className={cn(
                      "inline-flex items-center gap-1.5 text-xs py-0.5 rounded transition-all",
                      isHovered
                        ? "text-emerald-700 font-bold translate-x-0.5"
                        : "text-zinc-600 hover:text-emerald-700 hover:font-medium"
                    )}
                  >
                    <span>{pickLocale(locale, item.nameVi, item.nameEn)}</span>
                    {isFastPrint(item.id) && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold text-white bg-amber-500 rounded leading-none shadow-xs shrink-0">
                        {locale === "vi" ? "in nhanh" : "fast"}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </li>
  );
}

export default function Footer() {
  const [footerPreview, setFooterPreview] = useState<Record<string, ProductItem>>({});
  const t = useTranslations("footer");
  const tContact = useTranslations("contact");
  const locale = useLocale() as Locale;

  const handleHoverItem = (catId: string, item: ProductItem) => {
    setFooterPreview((prev) => ({ ...prev, [catId]: item }));
  };

  return (
    <footer className="bg-brand-soft text-brand-dark">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <p className="text-2xl font-black tracking-tight mb-4">
              VIET <span className="text-brand-primary">DRAGON</span>
            </p>
            <p className="text-brand-dark/60 text-sm leading-relaxed mb-5">
              {t("tagline")}
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, href, name }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-white text-brand-dark hover:bg-brand-primary hover:text-white transition-colors"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Products — categories from data */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-brand-dark/40 mb-4">
              {t("productsLabel")}
            </p>
            <ul className="flex flex-col gap-2">
              {productCategories.map((cat) => (
                <FooterCategoryItem
                  key={cat.id}
                  cat={cat}
                  locale={locale}
                  activeItem={footerPreview[cat.id] ?? cat.items[0]}
                  onHoverItem={handleHoverItem}
                />
              ))}
            </ul>
          </div>

          {/* Useful links */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-brand-dark/40 mb-4">
              {t("usefulLabel")}
            </p>
            <ul className="flex flex-col gap-2">
              {usefulLinkHrefs.map((href, i) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-brand-dark/60 hover:text-brand-primary transition-colors"
                  >
                    {t(`usefulLinks.${usefulLinkKeys[i]}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-brand-dark/40 mb-4">
              {t("contactLabel")}
            </p>
            <ul className="flex flex-col gap-4 text-sm text-brand-dark/60">
              <li className="flex items-center gap-3">
                <IconBadge icon={Phone} size="md" />
                <span className="flex flex-col">
                  <a href="tel:0901448377" className="hover:text-brand-primary transition-colors">{tContact("phone1")}</a>
                  <a href="tel:0919510543" className="hover:text-brand-primary transition-colors">{tContact("phone2")}</a>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <IconBadge icon={Mail} size="md" />
                <a href="mailto:contact@vietdragon.vn" className="hover:text-brand-primary transition-colors">
                  {tContact("email")}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <IconBadge icon={MapPin} size="md" />
                <span className="leading-relaxed">
                  {tContact("address")}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-brand-border flex items-center justify-center text-xs text-brand-dark/40">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}
