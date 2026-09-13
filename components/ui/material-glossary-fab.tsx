"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Library, X } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { materialTraits } from "@/data/material-traits";
import { pickLocale } from "@/lib/locale";
import type { Locale } from "@/i18n/routing";

const TRAIT_TRANSLATIONS: Record<string, { labelZh: string; labelJa: string; labelKo: string; descZh: string; descJa: string; descKo: string }> = {
  "glossy-coat": {
    labelZh: "亮面光泽",
    labelJa: "光沢グロス",
    labelKo: "유광 코팅",
    descZh: "高光覆膜表面，如镜面般清晰反射光线。",
    descJa: "鏡のようにシャープに光を反射するグロスコーティング表面。",
    descKo: "거울처럼 선명하게 빛을 반사하는 유광 코팅 표면.",
  },
  "smooth-base": {
    labelZh: "平滑纸基",
    labelJa: "スムース地",
    labelKo: "매끄러운 표면",
    descZh: "表面光滑细腻，无明显纸张纹理。",
    descJa: "紙のテクスチャが目立たない、滑らかな仕上がりのベース紙。",
    descKo: "종이 결이 드러나지 않는 매끄럽고 균일한 표면.",
  },
  "foil-accent": {
    labelZh: "烫金工艺",
    labelJa: "箔押し加工",
    labelKo: "박 가공",
    descZh: "金属光泽烫印工艺，显著提升局部视觉焦点与奢华感。",
    descJa: "メタリックな輝きを放つ箔押しによる上質なアクセント。",
    descKo: "표면에 금속박을 압착하여 고급스러운 광택 포인트를 더합니다.",
  },
  "natural-grain": {
    labelZh: "自然纸纹",
    labelJa: "ナチュラル木目",
    labelKo: "자연 종이 결",
    descZh: "哑光质感，带有细腻自然的纸张纤维纹理。",
    descJa: "細やかで自然な紙の風合いを持つマットな質感。",
    descKo: "미세하고 자연스러운 종이 질감을 지닌 무광 표면.",
  },
  "soft-light": {
    labelZh: "柔和漫反射",
    labelJa: "ソフト反射",
    labelKo: "부드러운 빛 분산",
    descZh: "光线在表面均匀漫射，不刺眼、无眩光反光。",
    descJa: "表面で均一に光が拡散し、眩しさや映り込みを防ぎます。",
    descKo: "빛이 고르게 분산되어 눈부심과 반사광이 없습니다.",
  },
  "textured-art": {
    labelZh: "艺术纹理",
    labelJa: "テクスチャアート紙",
    labelKo: "예술 지문 텍스처",
    descZh: "独特的触感纸纹理，营造手工质感与高端奢华氛围。",
    descJa: "特徴的な触感の紙肌が、クラフト感と高級感を演出。",
    descKo: "고유한 촉감의 종이 질감으로 아티스틱하고 고급스러운 느낌을 부여합니다.",
  },
  "metallic-shine": {
    labelZh: "珍珠金属光泽",
    labelJa: "パールメタリック",
    labelKo: "펄 메탈릭 광채",
    descZh: "优雅的珍珠微光，在光线照耀下呈现细腻变幻色彩。",
    descJa: "光の角度によって上品に移ろうパールのような輝き。",
    descKo: "빛의 각도에 따라 은은하게 변하는 우아한 진주 펄 광택.",
  },
  "waterproof-durability": {
    labelZh: "防水耐撕材质",
    labelJa: "耐水・高耐久",
    labelKo: "방수 및 내구성",
    descZh: "合成塑料基材，100%防水且抗撕裂，经久耐用。",
    descJa: "破れにくく100%防水性能を備えた合成樹脂ベース。",
    descKo: "찢어지지 않는 100% 방수 합성 플라스틱 소재.",
  },
  "embossed-depth": {
    labelZh: "3D立体击凸/压凹",
    labelJa: "エンボス・デボス",
    labelKo: "형압 / 엠보싱",
    descZh: "立体浮雕压印工艺，为品牌标志与重点细节赋予触感深度。",
    descJa: "ロゴやアイキャッチに立体的な奥行きをもたらす浮き出し加工。",
    descKo: "로고 및 포인트 요소에 3D 입체 깊이감을 주는 형압 가공.",
  },
  "digital-precision": {
    labelZh: "数码极速精印",
    labelJa: "スピードデジタル印刷",
    labelKo: "디지털 초고속 인쇄",
    descZh: "高分辨率数码印刷，免制版立等可取，小批量订购优选。",
    descJa: "製版不要で即納可能な高解像度デジタル印刷 — 小ロットに最適。",
    descKo: "판 제작 시간 없이 즉시 출력하는 고해상도 디지털 인쇄 — 소량 주문 최적.",
  },
};

/**
 * Floating button that opens a static legend of every icon used across
 * `ProductOption.descriptionTraits` (see data/material-traits.ts) — lets a
 * customer revisit what a material-flashcard icon meant without re-reading
 * every flashcard. Self-contained: drop it into any page, no props needed.
 */
export function MaterialGlossaryFab() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("materialGlossary");
  const locale = useLocale() as Locale;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-20"
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-4 left-3 z-30 flex flex-col items-start gap-3 sm:bottom-8 sm:left-6">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-[min(88vw,320px)] rounded-2xl border border-zinc-100 bg-white shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between gap-2 px-5 py-4 bg-zinc-50 border-b border-zinc-100">
                <h3 className="font-black text-zinc-900 text-sm">{t("title")}</h3>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={t("closeLabel")}
                  className="shrink-0 inline-flex items-center justify-center size-7 rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-white transition-colors"
                >
                  <X size={14} strokeWidth={1.75} />
                </button>
              </div>
              <ul className="max-h-[60vh] overflow-y-auto divide-y divide-zinc-100">
                {Object.entries(materialTraits).map(([key, trait]) => {
                  const Icon = trait.icon;
                  return (
                    <li key={key} className="flex items-start gap-3 px-5 py-3.5">
                      <span className="shrink-0 inline-flex items-center justify-center size-8 rounded-full bg-brand-soft text-brand-primary">
                        <Icon size={15} strokeWidth={1.75} />
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-zinc-900 text-sm">
                          {pickLocale(locale, trait.labelVi, trait.label, TRAIT_TRANSLATIONS[key]?.labelZh, TRAIT_TRANSLATIONS[key]?.labelJa, TRAIT_TRANSLATIONS[key]?.labelKo)}
                        </p>
                        <p className="text-zinc-500 text-xs leading-relaxed mt-0.5">
                          {pickLocale(locale, trait.descriptionVi, trait.description, TRAIT_TRANSLATIONS[key]?.descZh, TRAIT_TRANSLATIONS[key]?.descJa, TRAIT_TRANSLATIONS[key]?.descKo)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? t("closeLabel") : t("openLabel")}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.35, ease: "easeOut" }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-dark shadow-lg shadow-brand-dark/25 sm:h-14 sm:w-14"
        >
          <Library className="h-5 w-5 text-white sm:h-6 sm:w-6" strokeWidth={1.75} />
        </motion.button>
      </div>
    </>
  );
}
