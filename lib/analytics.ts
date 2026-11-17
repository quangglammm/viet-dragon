declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Sends a custom event to Google Analytics (GA4) if loaded.
 * Fails safely as a no-op in SSR or when blocked by an ad-blocker.
 */
export function trackEvent(action: string, params?: Record<string, unknown>): void {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", action, params);
  }
}
