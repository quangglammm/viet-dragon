"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Library, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { NamedIcon } from "@/components/ui/named-icon";
import { cn } from "@/lib/utils";
import { findHashTarget, smoothScrollToElement } from "@/lib/hash-navigation";
import type { GlossaryTrait } from "@/lib/content/read/pages";

/**
 * Floating button that opens a legend of every icon a material card uses for its bullets — lets a
 * customer revisit what an icon meant without re-reading every card. The traits (icon, name,
 * explanation) are the content database's, in the page's language.
 */
export function MaterialGlossaryFab({ traits }: Readonly<{ traits: readonly GlossaryTrait[] }>) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("materialGlossary");

  const listRef = useRef<HTMLUListElement>(null);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const isDraggingRef = useRef(false);
  const mouseStartRef = useRef<{ y: number; scrollTop: number } | null>(null);
  const touchStartPosRef = useRef<{ y: number } | null>(null);

  const checkScroll = useCallback(() => {
    const el = listRef.current;
    if (el) {
      setCanScrollDown(el.scrollHeight - el.scrollTop - el.clientHeight > 12);
    }
  }, []);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(checkScroll, 100);
      return () => clearTimeout(timer);
    }
  }, [open, checkScroll, traits]);

  // Mouse drag-to-scroll handlers (desktop gesture)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!listRef.current) return;
    mouseStartRef.current = { y: e.clientY, scrollTop: listRef.current.scrollTop };
    isDraggingRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!mouseStartRef.current || !listRef.current) return;
    const deltaY = e.clientY - mouseStartRef.current.y;
    if (Math.abs(deltaY) > 5) {
      isDraggingRef.current = true;
      listRef.current.scrollTop = mouseStartRef.current.scrollTop - deltaY;
    }
  };

  const handleMouseUp = () => {
    mouseStartRef.current = null;
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 60);
  };

  // Touch swipe handlers (mobile gesture)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartPosRef.current = { y: e.touches[0].clientY };
      isDraggingRef.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartPosRef.current && e.touches.length === 1) {
      const deltaY = Math.abs(e.touches[0].clientY - touchStartPosRef.current.y);
      if (deltaY > 8) {
        isDraggingRef.current = true;
      }
    }
  };

  const handleTouchEnd = () => {
    touchStartPosRef.current = null;
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 60);
  };

  const handleTraitClick = (anchorId?: string) => {
    if (isDraggingRef.current) return;
    if (!anchorId) return;
    setOpen(false);

    const cleanBase = window.location.pathname + window.location.search;
    window.history.pushState(null, "", `${cleanBase}#${anchorId}`);
    window.dispatchEvent(new Event("hashchange"));

    setTimeout(() => {
      const el = findHashTarget(anchorId) ?? document.getElementById(anchorId);
      if (el) {
        smoothScrollToElement(el);
      }
    }, 50);
  };

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
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-[min(88vw,320px)] rounded-2xl border border-zinc-100 bg-white shadow-xl overflow-hidden select-none"
            >
              <div className="flex items-center justify-between gap-2 px-5 py-4 bg-zinc-50 border-b border-zinc-100">
                <h3 className="font-black text-zinc-900 text-sm">{t("title")}</h3>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={t("closeLabel")}
                  className="shrink-0 inline-flex items-center justify-center size-7 rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-white transition-colors cursor-pointer"
                >
                  <X size={14} strokeWidth={1.75} />
                </button>
              </div>

              <ul
                ref={listRef}
                data-lenis-prevent="true"
                onScroll={checkScroll}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="max-h-[60vh] overflow-y-auto divide-y divide-zinc-100 custom-scrollbar overscroll-contain touch-pan-y cursor-grab active:cursor-grabbing"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {traits.map((trait) => (
                  <li key={trait.key}>
                    {trait.anchorId ? (
                      <button
                        type="button"
                        onClick={() => handleTraitClick(trait.anchorId)}
                        className="w-full text-left flex items-start gap-3 px-5 py-3.5 transition-colors cursor-pointer hover:bg-zinc-50 active:bg-zinc-100"
                      >
                        <span className="shrink-0 inline-flex items-center justify-center size-8 rounded-full bg-brand-soft text-brand-primary">
                          <NamedIcon name={trait.icon} size={15} strokeWidth={1.75} />
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-zinc-900 text-sm">{trait.label}</p>
                          <p className="text-zinc-500 text-xs leading-relaxed mt-0.5">{trait.description}</p>
                        </div>
                      </button>
                    ) : (
                      <div className="flex items-start gap-3 px-5 py-3.5">
                        <span className="shrink-0 inline-flex items-center justify-center size-8 rounded-full bg-brand-soft text-brand-primary">
                          <NamedIcon name={trait.icon} size={15} strokeWidth={1.75} />
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-zinc-900 text-sm">{trait.label}</p>
                          <p className="text-zinc-500 text-xs leading-relaxed mt-0.5">{trait.description}</p>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>

              {/* Scroll indicator overlay at bottom */}
              {canScrollDown && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    if (listRef.current) {
                      listRef.current.scrollBy({ top: 90, behavior: "smooth" });
                    }
                  }}
                  className="absolute inset-x-0 bottom-0 h-9 bg-gradient-to-t from-white via-white/85 to-transparent flex items-end justify-center pb-1 cursor-pointer z-10 select-none"
                >
                  <span className="text-[10px] font-semibold text-brand-primary bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-full shadow-2xs border border-brand-primary/20 flex items-center gap-1 hover:bg-brand-soft transition-colors">
                    <ChevronDown size={11} className="animate-bounce" />
                  </span>
                </div>
              )}
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
          className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-dark shadow-lg shadow-brand-dark/25 sm:h-14 sm:w-14 cursor-pointer"
        >
          <Library className="h-5 w-5 text-white sm:h-6 sm:w-6" strokeWidth={1.75} />
        </motion.button>
      </div>
    </>
  );
}
