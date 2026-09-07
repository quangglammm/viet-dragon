"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronsRight, Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

interface SuggestionConfig {
  flag: string;
  langName: string;
  question: string;
  switchBtn: string;
}

const SUGGESTIONS: Record<Locale, SuggestionConfig> = {
  vi: {
    flag: "🇻🇳",
    langName: "Tiếng Việt",
    question: "Chọn ngôn ngữ theo hệ thống?",
    switchBtn: "Chuyển ngay",
  },
  en: {
    flag: "🇬🇧",
    langName: "English",
    question: "Select system language?",
    switchBtn: "Switch now",
  },
  zh: {
    flag: "🇨🇳",
    langName: "中文",
    question: "切换为系统语言？",
    switchBtn: "立即切换",
  },
  ja: {
    flag: "🇯🇵",
    langName: "日本語",
    question: "システム言語に変更しますか？",
    switchBtn: "切り替える",
  },
  ko: {
    flag: "🇰🇷",
    langName: "한국어",
    question: "시스템 언어로 변경하시겠습니까?",
    switchBtn: "전환하기",
  },
};

function detectUserTargetLocale(): Locale | null {
  if (typeof window === "undefined" || !navigator) return null;

  const navLangs = navigator.languages || [navigator.language || ""];
  for (const raw of navLangs) {
    const code = raw.toLowerCase().trim();
    if (code.startsWith("zh")) return "zh";
    if (code.startsWith("ja")) return "ja";
    if (code.startsWith("ko")) return "ko";
    if (code.startsWith("vi")) return "vi";
    if (code.startsWith("en")) return "en";
  }

  // Timezone fallback if navigator language is ambiguous
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone.toLowerCase();
    if (tz.includes("tokyo")) return "ja";
    if (tz.includes("seoul")) return "ko";
    if (tz.includes("shanghai") || tz.includes("taipei") || tz.includes("hong_kong") || tz.includes("beijing")) return "zh";
    if (tz.includes("saigon") || tz.includes("ho_chi_minh") || tz.includes("bangkok") || tz.includes("hanoi")) return "vi";
  } catch {
    // Ignore timezone detection errors
  }

  return null;
}

const COOKIE_NAME = "vd_preferred_locale";

export function LanguageDetectorToast() {
  const currentLocale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [targetLocale, setTargetLocale] = useState<Locale | null>(null);
  const [visible, setVisible] = useState(false);

  // System language detection strictly applies ONLY to homepage
  const isHome = pathname === "/";

  useEffect(() => {
    if (!isHome) return;

    // Check for test override via URL query params (e.g. ?test_lang=en or ?toast=1)
    const urlParams = new URLSearchParams(window.location.search);
    const testLang = urlParams.get("test_lang") as Locale | null;
    const forceToast = urlParams.has("toast") || Boolean(testLang);

    if (forceToast) {
      const target = testLang && SUGGESTIONS[testLang] ? testLang : (currentLocale === "vi" ? "en" : "vi");
      setTargetLocale(target);
      setVisible(true);
      console.log(`[LanguageDetectorToast] Chế độ test đang bật: hiển thị đề xuất ngôn ngữ "${target}"`);
      return;
    }

    // Check if user has already made a decision or dismissed
    const hasDecision = document.cookie.includes(`${COOKIE_NAME}=`) || localStorage.getItem(COOKIE_NAME);
    if (hasDecision) {
      console.log(`[LanguageDetectorToast] Đã có lựa chọn ghi nhớ trước đó. Đã bỏ qua toast.`);
      return;
    }

    // Delay slightly so hero loads smoothly first
    const timer = setTimeout(() => {
      const detected = detectUserTargetLocale();
      console.log(`[LanguageDetectorToast] Ngôn ngữ hệ thống phát hiện: "${detected}", Ngôn ngữ trang hiện tại: "${currentLocale}"`);
      if (detected && detected !== currentLocale) {
        setTargetLocale(detected);
        setVisible(true);
      } else {
        console.log(`[LanguageDetectorToast] Ngôn ngữ hệ thống trùng với ngôn ngữ trang ("${currentLocale}") -> Không cần hiện đề xuất.`);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentLocale, isHome]);

  const saveDecision = (localeToSave: string) => {
    try {
      localStorage.setItem(COOKIE_NAME, localeToSave);
      const expires = new Date();
      expires.setDate(expires.getDate() + 30);
      document.cookie = `${COOKIE_NAME}=${localeToSave};path=/;expires=${expires.toUTCString()};SameSite=Lax`;
    } catch {
      // Ignore storage errors
    }
  };

  const handleSwitch = () => {
    if (!targetLocale) return;
    saveDecision(targetLocale);
    setVisible(false);
    router.replace(pathname, { locale: targetLocale });
  };

  const handleDismiss = () => {
    saveDecision(currentLocale);
    setVisible(false);
  };

  const showToast = isHome && visible && Boolean(targetLocale);
  const currentConfig = SUGGESTIONS[currentLocale] || SUGGESTIONS.vi;
  const targetConfig = (targetLocale && SUGGESTIONS[targetLocale]) || SUGGESTIONS.en;

  return (
    <AnimatePresence>
      {showToast && (
        <motion.div
          key="language-detector-toast"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-20 sm:bottom-6 left-4 sm:left-6 z-50 max-w-md bg-zinc-900/95 text-white backdrop-blur-md rounded-2xl shadow-2xl border border-white/15 p-3.5 sm:p-4"
          role="alert"
          aria-live="polite"
        >
        <div className="flex items-center gap-3">
          {/* Globe Icon */}
          <div className="shrink-0 p-2 rounded-xl bg-brand-primary/20 text-brand-primary border border-brand-primary/30">
            <Globe size={18} />
          </div>

          {/* Text & Flag structure: "Chọn ngôn ngữ theo hệ thống? - [cờ] - >>" */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/70 font-medium">
              {currentConfig.question}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-lg leading-none select-none">{targetConfig.flag}</span>
              <span className="text-sm font-bold text-white tracking-wide">
                {targetConfig.langName}
              </span>
            </div>
          </div>

          {/* Action button ">>" & Close button */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleSwitch}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              title={`${currentConfig.switchBtn} (${targetConfig.langName})`}
            >
              <span>{currentConfig.switchBtn}</span>
              <ChevronsRight size={15} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Close"
              className="p-1.5 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/10"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);
}
