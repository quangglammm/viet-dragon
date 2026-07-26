import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";

export default function BlogLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 lg:pt-26">{children}</main>
      <Footer />
    </>
  );
}
