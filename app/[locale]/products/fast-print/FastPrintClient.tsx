"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Zap, Clock, Truck, CheckCircle2, ArrowRight, Phone, BadgeCheck, Timer, Printer, FileText } from "lucide-react";
import { PHONE_NUMBER, ZALO_CHAT_URL } from "@/lib/contact";
import type { FastPrintCard } from "@/lib/content/read/merchandising";
import { NamedIcon } from "@/components/ui/named-icon";

// The page's structure; every word of it is UI copy (messages `fastPrint`), every item a row of the content database.
const STEP_ICONS = [FileText, Printer, Truck];
const FEATURE_ICONS = [Clock, BadgeCheck, CheckCircle2, Zap, Timer, Truck];

type Step = { title: string; desc: string };

export default function FastPrintClient({ items }: Readonly<{ items: readonly FastPrintCard[] }>) {
  const t = useTranslations("fastPrint");
  const steps = t.raw("steps") as Step[];
  const features = t.raw("features") as string[];

  return (
    <div className="bg-white min-h-screen">

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-brand-dark min-h-[520px] flex items-end">
        <Image
          src="/images/category/innhanh.webp"
          alt={t("heroAlt")}
          fill
          sizes="100vw"
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/90 via-brand-dark/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-16 pt-32 w-full">
          <nav className="flex items-center gap-2 text-sm text-white/50 mb-8">
            <Link href="/" className="hover:text-white transition-colors">{t("breadcrumbHome")}</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-white transition-colors">{t("breadcrumbProducts")}</Link>
            <span>/</span>
            <span className="text-white/80">{t("breadcrumbCurrent")}</span>
          </nav>

          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full bg-yellow-400/15 border border-yellow-400/30 text-yellow-300 text-xs font-bold uppercase tracking-widest"
            >
              <Zap size={12} fill="currentColor" />
              {t("badge")}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl lg:text-6xl font-black text-white leading-tight mb-4"
            >
              {t("title1")}{" "}<span className="text-yellow-300">{t("titleHighlight")}</span><br />{t("title2")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-white/70 text-lg mb-8 leading-relaxed"
            >
              {t("subtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <a
                href={ZALO_CHAT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-yellow-400 text-zinc-900 font-black uppercase tracking-wide text-sm rounded-full hover:bg-yellow-300 transition-colors"
              >
                <Zap size={16} />
                {t("btnZalo")}
              </a>
              <a
                href={`tel:${PHONE_NUMBER.replace(/\s/g, "")}`}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 text-white font-bold uppercase tracking-wide text-sm rounded-full border border-white/20 hover:bg-white/20 transition-colors backdrop-blur-sm"
              >
                <Phone size={16} />
                {PHONE_NUMBER}
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Feature Bar ── */}
      <section className="bg-yellow-400 py-4">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {features.map((label, i) => {
              const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length];
              return (
                <div key={label} className="flex items-center gap-2 justify-center sm:justify-start py-1">
                  <Icon size={16} className="text-zinc-800 shrink-0" />
                  <span className="text-xs font-bold text-zinc-800">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Products Grid ── */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-brand-primary uppercase tracking-widest mb-3">
              {t("prodsEyebrow")}
            </p>
            <h2 className="text-3xl lg:text-4xl font-black text-zinc-900">
              {t("prodsTitle")}
            </h2>
            <p className="text-zinc-500 mt-3 max-w-xl mx-auto">
              {t("prodsDesc")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((product, i) => {
              return (
                <motion.div
                  key={product.uid}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="group relative flex flex-col rounded-2xl border border-zinc-100 overflow-hidden hover:border-brand-primary/30 hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative h-52 overflow-hidden bg-zinc-100">
                    {product.image && (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-400 text-zinc-900 text-xs font-black">
                        <Zap size={10} fill="currentColor" />
                        {product.tag}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 p-5 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-black text-zinc-900 text-base group-hover:text-brand-primary transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-zinc-500 text-sm mt-1 leading-relaxed">
                          {product.description}
                        </p>
                      </div>
                      <div className="shrink-0 p-2 rounded-xl bg-brand-soft">
                        <NamedIcon name={product.icon} size={18} className="text-brand-primary" />
                      </div>
                    </div>

                    <div className="mt-auto pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-brand-primary">
                        {product.price ? t("price", { amount: product.price.amount, unit: product.price.unit }) : null}
                      </span>
                      <a
                        href={ZALO_CHAT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-zinc-500 hover:text-brand-primary transition-colors flex items-center gap-1"
                      >
                        {t("orderNow")} <ArrowRight size={12} />
                      </a>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-16 lg:py-20 bg-[var(--brand-soft)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-brand-primary uppercase tracking-widest mb-3">
              {t("stepsEyebrow")}
            </p>
            <h2 className="text-3xl lg:text-4xl font-black text-zinc-900">
              {t("stepsTitle")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {steps.map((step, i) => {
              const Icon = STEP_ICONS[i % STEP_ICONS.length];
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="relative bg-white rounded-2xl p-7 border border-brand-border shadow-sm"
                >
                  <span className="absolute -top-4 left-7 text-6xl font-black text-brand-primary/10 leading-none select-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="p-3 rounded-xl bg-brand-soft inline-flex mb-5">
                    <Icon size={22} className="text-brand-primary" />
                  </div>
                  <h3 className="font-black text-zinc-900 text-lg mb-2">
                    {step.title}
                  </h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Contact / CTA ── */}
      <section id="in-nhanh-cta" className="relative py-16 lg:py-20 overflow-hidden">
        <Image
          src="/images/cta/vd-cta-banner.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-brand-dark/88" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-4">
              {t("ctaEyebrow")}
            </p>
            <h2 className="text-3xl lg:text-5xl font-black text-white mb-4">
              {t("ctaTitle1")}{" "}
              <span className="text-yellow-300">{t("ctaTitleHighlight")}</span>
            </h2>
            <p className="text-white/60 text-base mb-8 max-w-xl mx-auto">
              {t("ctaDesc")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={ZALO_CHAT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-400 text-zinc-900 font-black uppercase tracking-wide text-sm rounded-full hover:bg-yellow-300 transition-colors"
              >
                <Zap size={16} />
                {t("ctaBtnZalo")}
              </a>
              <a
                href={`tel:${PHONE_NUMBER.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-2 px-8 py-4 text-white font-bold uppercase tracking-wide text-sm rounded-full border border-white/25 hover:bg-white/10 transition-colors"
              >
                <Phone size={16} />
                {PHONE_NUMBER}
              </a>
            </div>

            <p className="text-white/30 text-xs mt-6">
              {t("workshopHours")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Back to Products ── */}
      <div className="border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link
            href="/products"
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowRight size={14} className="rotate-180" />
            {t("allProducts")}
          </Link>
          <Link
            href="/#cta"
            className="flex items-center gap-2 text-sm font-semibold text-brand-primary hover:opacity-75 transition-opacity"
          >
            {t("getQuote")}
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
