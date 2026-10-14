"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { QuoteModal } from "@/components/ui/quote-modal";

interface QuoteModalOptions {
  productName?: string;
}

interface QuoteModalContextValue {
  isOpen: boolean;
  productName: string | undefined;
  openQuote: (options?: QuoteModalOptions) => void;
  closeQuote: () => void;
}

const QuoteModalContext = createContext<QuoteModalContextValue | null>(null);

export function useQuoteModal(): QuoteModalContextValue {
  const context = useContext(QuoteModalContext);
  if (!context) {
    throw new Error("useQuoteModal must be used within a QuoteModalProvider");
  }
  return context;
}

interface QuoteModalProviderProps {
  children: ReactNode;
}

export function QuoteModalProvider({
  children,
}: Readonly<QuoteModalProviderProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [productName, setProductName] = useState<string | undefined>(undefined);

  const openQuote = useCallback((options?: QuoteModalOptions) => {
    setProductName(options?.productName);
    setIsOpen(true);
  }, []);

  const closeQuote = useCallback(() => {
    setIsOpen(false);
    setProductName(undefined);
  }, []);

  // Global click delegator: intercept quote buttons/links across the app
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const trigger = target.closest(
        "[data-open-quote], a[href$='#cta'], a[href$='#quote'], a[href*='/#cta']"
      );

      if (trigger) {
        // If trigger has data-ignore-quote-modal, don't intercept
        if (trigger.hasAttribute("data-ignore-quote-modal")) return;

        e.preventDefault();
        e.stopPropagation();

        const product =
          trigger.getAttribute("data-quote-product") ??
          trigger.getAttribute("data-product") ??
          undefined;

        openQuote({ productName: product });
      }
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [openQuote]);

  const value = useMemo(
    () => ({
      isOpen,
      productName,
      openQuote,
      closeQuote,
    }),
    [isOpen, productName, openQuote, closeQuote]
  );

  return (
    <QuoteModalContext.Provider value={value}>
      {children}
      <QuoteModal
        key={isOpen ? `${isOpen}-${productName ?? "general"}` : "closed"}
        isOpen={isOpen}
        onClose={closeQuote}
        productName={productName}
      />
    </QuoteModalContext.Provider>
  );
}
