import { getTranslations } from "next-intl/server";
import Footer from "@/components/sections/Footer";
import Navbar from "@/components/sections/Navbar";
import { WipeButton } from "@/components/ui/wipe-button";

// Rendered for every notFound() under [locale] and, via the [...rest] catch-all, for
// unknown URLs. Next marks it noindex and answers 404 on its own.
export default async function LocaleNotFound() {
  const t = await getTranslations("notFound");

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-16 lg:pt-26">
        <section className="max-w-3xl mx-auto px-6 py-24 text-center">
          <span className="inline-block eyebrow-pill mb-4">
            <span className="eyebrow-pill-text">404</span>
          </span>
          <h1 className="text-4xl lg:text-5xl font-black text-zinc-900 leading-tight">{t("title")}</h1>
          <p className="mt-5 text-lg text-zinc-500">{t("description")}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <WipeButton href="/">{t("homeCta")}</WipeButton>
            <WipeButton href="/products" tone="dark">
              {t("productsCta")}
            </WipeButton>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
