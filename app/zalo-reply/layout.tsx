import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "../globals.css";

const sans = Be_Vietnam_Pro({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Viet Dragon - Zalo Reply",
  description: "Viet Dragon Chat Bridge",
};

export default function ZaloReplyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${sans.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
