import type { Metadata } from "next";
import { Be_Vietnam_Pro, Plus_Jakarta_Sans } from "next/font/google";
import "../globals.css";

const sans = Be_Vietnam_Pro({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const heading = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Viet Dragon Admin Portal | Quản Trị Hệ Thống In Ấn & Nội Dung",
  description: "Trang quản trị sản phẩm in ấn, bảng giá, media và đa ngôn ngữ Viet Dragon Printing.",
};

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${sans.variable} ${heading.variable} antialiased`}>
      <body className="bg-[#f4f6fb] text-slate-900 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
