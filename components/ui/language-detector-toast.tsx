"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Globe, X, Check } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

interface SuggestionConfig {
  flag: string;
  langName: string;
  title: string;
  message: string;
  switchLabel: string;
  keepLabel: string;
}

const SUGGESTIONS: Record<Locale, SuggestionConfig> = {
  zh: {
    flag: "🇨🇳",
    langName: "中文",
    title: "建议切换至中文浏览",
    message: "检测到您的浏览器主要使用中文。是否将语言切换为中文？",
    switchLabel: "切换至中文",
    keepLabel: "保持原语言",
  },
  ja: {
    flag: "🇯🇵",
    langName: "日本語",
    title: "日本語で表示しますか？",
    message: "ブラウザの言語設定に合わせて、日本語表示に切り替えることができます。",
    switchLabel: "日本語に切り替える",
    keepLabel: "現在の言語を維持",
  },
  ko: {
    flag: "🇰🇷",
    langName: "한국어",
    title: "한국어로 보시겠습니까?",
    message: "브라우저 언어 설정에 맞춰 한국어로 편리하게 보실 수 있습니다.",
    switchLabel: "한국어로 전환",
    keepLabel: "현재 언어 유지",
  },
  en: {
    flag: "🇬🇧",
    langName: "English",
    title: "View in English?",
    message: "We noticed your browser is set to English. Would you like to switch?",
    switchLabel: "Switch to English",
    keepLabel: "Keep current language",
  },
  vi: {
    flag: "🇻🇳",
    langName: "Tiếng Việt",
    title: "Xem bằng Tiếng Việt?",
    message: "Bạn có muốn chuyển giao diện sang Tiếng Việt để tiện theo dõi?",
    switchLabel: "Chuyển sang Tiếng Việt",
    keepLabel: "Giữ nguyên",
  },
};

function detectUserTargetLocale(): Locale | null {
  if (typeof window === "undefined" || !navigator) return null;

  // 1. Check browser languages
  const navLangs = navigator.languages || [navigator.language || ""];
  for (const raw of navLangs) {
    const code = raw.toLowerCase().trim();
    if (code.startsWith("zh")) return "zh";
    if (code.startsWith("ja")) return "ja";
    if (code.startsWith("ko")) return "ko";
    if (code.startsWith("vi")) return "vi";
    if (code.startsWith("en")) return "en";
  }

  // 2. Check timezone as fallback
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone.toLowerCase();
    if (tz.includes("tokyo")) return "ja";
    if (tz.includes("seoul")) return "ko";
    if (tz.includes("shanghai") || tz.includes("taipei") || tz.includes("hong_kong") || tz.includes("beijing")) return "zh";
    if (tz.includes("saigon") || tz.includes("ho_chi_minh") || tz.includes("bangkok") || tz.includes("hanoi")) return "vi";
  } catch {
    // Ignore timezone error
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

  useEffect(() => {
    // Check if user has already made a choice or dismissed
    const hasDecision = document.cookie.includes(`${COOKIE_NAME}=`) || localStorage.getItem(COOKIE_NAME);
    if (hasDecision) return;

    // Slight delay so user sees page load smoothly first
    const timer = setTimeout(() => {
      const detected = detectUserTargetLocale();
      if (detected && detected !== currentLocale) {
        setTargetLocale(detected);
        setVisible(true);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [currentLocale]);

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

  if (!visible || !targetLocale) return null;

  const config = SUGGESTIONS[targetLocale];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="fixed bottom-24 sm:bottom-6 left-4 sm:left-6 z-50 max-w-sm w-[calc(100vw-32px)] bg-zinc-900/95 text-white backdrop-blur-md rounded-2xl shadow-2xl border border-white/15 p-4 sm:p-5"
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-brand-primary">
            <span className="text-xl leading-none">{config.flag}</span>
            <span className="p-1 rounded-md bg-white/10 text-white">
              <Globe size={14} />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-white/90">
              {config.langName}
            </span>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Close language suggestion"
            className="text-white/40 hover:text-white transition-colors p-1 -mr-1 -mt-1 rounded-lg hover:bg-white/10"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-2.5">
          <p className="font-bold text-sm text-white">{config.title}</p>
          <p className="text-xs text-white/70 mt-1 leading-relaxed">{config.message}</p>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={handleSwitch}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <Check size={13} strokeWidth={2.5} />
            {config.switchLabel}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 hover:text-white text-xs font-medium transition-colors cursor-pointer"
          >
            {config.keepLabel}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
