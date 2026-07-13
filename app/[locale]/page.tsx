import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import ShopCategories from "@/components/sections/ShopCategories";
import ShopBanner from "@/components/sections/ShopBanner";
import About from "@/components/sections/About";
import Services from "@/components/sections/Services";
import Shop from "@/components/sections/Shop";
import CtaBanner from "@/components/sections/CtaBanner";
import Portfolio from "@/components/sections/Portfolio";
import Pricing from "@/components/sections/Pricing";
import Testimonials from "@/components/sections/Testimonials";
import FAQ from "@/components/sections/FAQ";
import Quality from "@/components/sections/Quality";
import Process from "@/components/sections/Process";
import BlogPreview from "@/components/sections/BlogPreview";
import Brands from "@/components/sections/Brands";
import CTA from "@/components/sections/CTA";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <ShopCategories />
      <ShopBanner />
      <About />
      <Services />
      <Shop />
      <CtaBanner />
      <Portfolio />
      <Pricing />
      <Testimonials />
      <FAQ />
      <Quality />
      <Process />
      <BlogPreview />
      <Brands />
      <CTA />
      <Footer />
    </>
  );
}
