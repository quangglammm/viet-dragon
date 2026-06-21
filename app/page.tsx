import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import Gateway from "@/components/sections/Gateway";
import Trust from "@/components/sections/Trust";
import Vision from "@/components/sections/Vision";
import Portfolio from "@/components/sections/Portfolio";
import Products from "@/components/sections/Products";
import Services from "@/components/sections/Services";
import CtaSection from "@/components/sections/CTA";
import BlogPreview from "@/components/sections/BlogPreview";
import Footer from "@/components/sections/Footer";
import PanelContainer from "@/components/PanelContainer";

export default function Home() {
  return (
    <>
      <Navbar />
      <PanelContainer>
        <Hero />
        <Gateway />
        <Trust />
        <Vision />
        <Portfolio />
        <Products />
        <Services />
        <BlogPreview />
        <CtaSection />
      </PanelContainer>
      <Footer />
    </>
  );
}
