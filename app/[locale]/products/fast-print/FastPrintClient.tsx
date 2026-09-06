"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { motion } from "motion/react";
import {
  Zap, Clock, Truck, CheckCircle2, ArrowRight, Phone,
  BadgeCheck, Timer, Printer, Package2, CreditCard,
  FileText, StickyNote,
} from "lucide-react";
import { PHONE_NUMBER, ZALO_CHAT_URL } from "@/lib/contact";

const PRINT_PRODUCTS = [
  {
    id: "danh-thiep",
    nameVi: "Danh thiếp",
    nameEn: "Business Cards",
    tagVi: "In nhanh 2h",
    tagEn: "Ready in 2h",
    priceVi: "Chỉ từ 120.000đ/Hộp",
    priceEn: "From 120,000đ/Box",
    descVi: "Danh thiếp C300, cán màng mờ/bóng, bo góc tùy chọn.",
    descEn: "300gsm card, matte/gloss lamination, optional round corners.",
    image: "/images/product/vd-item-card.jpeg",
    icon: CreditCard,
  },
  {
    id: "to-roi",
    nameVi: "Tờ rơi / Leaflet",
    nameEn: "Flyers & Leaflets",
    tagVi: "In nhanh 4h",
    tagEn: "Ready in 4h",
    priceVi: "Chỉ từ 850đ/Tờ",
    priceEn: "From 850đ/Sheet",
    descVi: "Tờ rơi A5/A4 Couche 150–200gsm, cán màng bảo vệ.",
    descEn: "A5/A4 flyers, C150–C200gsm, with optional lamination.",
    image: "/images/product/vd-item-flyer.jpeg",
    icon: FileText,
  },
  {
    id: "voucher",
    nameVi: "Voucher / Phiếu",
    nameEn: "Vouchers & Coupons",
    tagVi: "In nhanh 4h",
    tagEn: "Ready in 4h",
    priceVi: "Chỉ từ 1.100đ/Tờ",
    priceEn: "From 1,100đ/Sheet",
    descVi: "Voucher cấn răng cưa nhảy số, bảo vệ bằng cán màng.",
    descEn: "Perforated vouchers with sequential numbering.",
    image: "/images/product/tag-couche1.webp",
    icon: StickyNote,
  },
  {
    id: "tem-nhan",
    nameVi: "Tem nhãn / Decal",
    nameEn: "Labels & Stickers",
    tagVi: "In nhanh 2h",
    tagEn: "Ready in 2h",
    priceVi: "Chỉ từ 400đ/Tem",
    priceEn: "From 400đ/Sticker",
    descVi: "Decal giấy, nhựa chống nước, bế theo hình bất kỳ.",
    descEn: "Paper or waterproof vinyl stickers, kiss-cut to any shape.",
    image: "/images/product/vd-item-decal.jpeg",
    icon: Package2,
  },
  {
    id: "catalogue",
    nameVi: "Catalogue / Tờ gấp",
    nameEn: "Catalogues & Brochures",
    tagVi: "In nhanh 6h",
    tagEn: "Ready in 6h",
    priceVi: "Chỉ từ 3.600đ/Cuốn",
    priceEn: "From 3,600đ/Book",
    descVi: "Catalogue A4/A5 tiêu chuẩn, tờ gấp đôi, gấp ba.",
    descEn: "A4/A5 catalogues, bi-fold and tri-fold brochures.",
    image: "/images/product/vd-item-catalogue.jpeg",
    icon: Printer,
  },
  {
    id: "envelope",
    nameVi: "Bao thư lấy ngay",
    nameEn: "Express Envelopes",
    tagVi: "Lấy ngay",
    tagEn: "Express",
    priceVi: "Chỉ từ 1.800đ/Cái",
    priceEn: "From 1,800đ/Pcs",
    descVi: "Bao thư in nhanh nhiều kích thước, giao trong 4h.",
    descEn: "Multiple sizes, express delivery within 4h.",
    image: "/images/product/vd-item-envelope.jpeg",
    icon: Package2,
  },
] as const;

const STEPS = [
  {
    num: "01",
    titleVi: "Gửi file thiết kế",
    titleEn: "Send your design file",
    descVi: "Gửi file AI, PDF, PSD qua Zalo/email. Chúng tôi kiểm tra file và xác nhận trong 15 phút.",
    descEn: "Send AI, PDF, or PSD via Zalo/email. We review and confirm within 15 minutes.",
    icon: FileText,
  },
  {
    num: "02",
    titleVi: "In nhanh & hoàn thiện",
    titleEn: "Fast print & finishing",
    descVi: "Máy in kỹ thuật số tốc độ cao in chính xác màu sắc, cán màng và bế thành phẩm theo đúng yêu cầu.",
    descEn: "High-speed digital press delivers accurate CMYK colors with lamination and finishing.",
    icon: Printer,
  },
  {
    num: "03",
    titleVi: "Nhận hàng linh hoạt",
    titleEn: "Flexible delivery",
    descVi: "Nhận tại xưởng hoặc giao tận nơi tại TP.HCM & Bình Dương, nhanh nhất trong 2–4 giờ.",
    descEn: "Pick up at our shop or get express delivery in HCM City & Binh Duong in 2–4 hours.",
    icon: Truck,
  },
] as const;

const FEATURES = [
  { iconEl: Clock, labelVi: "Giao trong 2–4 giờ", labelEn: "Delivered in 2–4 hours" },
  { iconEl: BadgeCheck, labelVi: "Chuẩn màu 100%", labelEn: "100% color accuracy" },
  { iconEl: CheckCircle2, labelVi: "Không MOQ tối thiểu", labelEn: "No minimum quantity" },
  { iconEl: Zap, labelVi: "In ngay trong ngày", labelEn: "Same-day printing" },
  { iconEl: Timer, labelVi: "Xác nhận trong 15 phút", labelEn: "Confirmed in 15 minutes" },
  { iconEl: Truck, labelVi: "Miễn phí giao nội thành", labelEn: "Free city delivery" },
] as const;

export default function FastPrintClient({ locale }: Readonly<{ locale: string }>) {
  const isVi = locale === "vi";

  return (
    <div className="bg-white min-h-screen">

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-brand-dark min-h-[520px] flex items-end">
        <Image
          src="/images/category/innhanh.webp"
          alt="In nhanh Viet Dragon"
          fill
          sizes="100vw"
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/90 via-brand-dark/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-16 pt-32 w-full">
          <nav className="flex items-center gap-2 text-sm text-white/50 mb-8">
            <Link href="/" className="hover:text-white transition-colors">{isVi ? "Trang Chủ" : "Home"}</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-white transition-colors">{isVi ? "Sản Phẩm" : "Products"}</Link>
            <span>/</span>
            <span className="text-white/80">{isVi ? "In Nhanh" : "Fast Print"}</span>
          </nav>

          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full bg-yellow-400/15 border border-yellow-400/30 text-yellow-300 text-xs font-bold uppercase tracking-widest"
            >
              <Zap size={12} fill="currentColor" />
              {isVi ? "In kỹ thuật số lấy liền trong ngày" : "Same-day digital printing"}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl lg:text-6xl font-black text-white leading-tight mb-4"
            >
              {isVi ? (
                <>In nhanh — <span className="text-yellow-300">lấy ngay</span><br />trong 2 giờ</>
              ) : (
                <>Fast print — <span className="text-yellow-300">ready</span><br />in 2 hours</>
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-white/70 text-lg mb-8 leading-relaxed"
            >
              {isVi
                ? "Danh thiếp, tờ rơi, voucher, tem nhãn — in số lượng ít lấy ngay trong ngày. Không MOQ tối thiểu, chuẩn màu 100%, giao tận nơi TP.HCM & Bình Dương."
                : "Business cards, flyers, vouchers, labels — small-run express printing with no minimum order, 100% color accuracy, delivered to your door."}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <a
                href={ZALO_CHAT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-yellow-400 text-zinc-900 font-black uppercase tracking-wide text-sm rounded-full hover:bg-yellow-300 transition-colors"
              >
                <Zap size={16} />
                {isVi ? "Gửi file qua Zalo" : "Send file via Zalo"}
              </a>
              <a
                href={`tel:${PHONE_NUMBER.replace(/\s/g, "")}`}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 text-white font-bold uppercase tracking-wide text-sm rounded-full border border-white/20 hover:bg-white/20 transition-colors backdrop-blur-sm"
              >
                <Phone size={16} />
                {PHONE_NUMBER}
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Feature Bar ── */}
      <section className="bg-yellow-400 py-4">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {FEATURES.map((f) => {
              const Icon = f.iconEl;
              return (
                <div key={f.labelVi} className="flex items-center gap-2 justify-center sm:justify-start py-1">
                  <Icon size={16} className="text-zinc-800 shrink-0" />
                  <span className="text-xs font-bold text-zinc-800">
                    {isVi ? f.labelVi : f.labelEn}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Products Grid ── */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-brand-primary uppercase tracking-widest mb-3">
              {isVi ? "Sản phẩm có thể in nhanh" : "Products available for express print"}
            </p>
            <h2 className="text-3xl lg:text-4xl font-black text-zinc-900">
              {isVi ? "In lấy ngay — giao trong 2–6 giờ" : "Express print — delivered in 2–6 hours"}
            </h2>
            <p className="text-zinc-500 mt-3 max-w-xl mx-auto">
              {isVi
                ? "Tất cả sản phẩm đều được in bằng máy kỹ thuật số tốc độ cao, cam kết màu sắc trung thực và thành phẩm đẹp."
                : "All products printed on high-speed digital presses with guaranteed color accuracy and quality finishing."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRINT_PRODUCTS.map((product, i) => {
              const Icon = product.icon;
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="group relative flex flex-col rounded-2xl border border-zinc-100 overflow-hidden hover:border-brand-primary/30 hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative h-52 overflow-hidden bg-zinc-100">
                    <Image
                      src={product.image}
                      alt={isVi ? product.nameVi : product.nameEn}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-400 text-zinc-900 text-xs font-black">
                        <Zap size={10} fill="currentColor" />
                        {isVi ? product.tagVi : product.tagEn}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 p-5 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-black text-zinc-900 text-base group-hover:text-brand-primary transition-colors">
                          {isVi ? product.nameVi : product.nameEn}
                        </h3>
                        <p className="text-zinc-500 text-sm mt-1 leading-relaxed">
                          {isVi ? product.descVi : product.descEn}
                        </p>
                      </div>
                      <div className="shrink-0 p-2 rounded-xl bg-brand-soft">
                        <Icon size={18} className="text-brand-primary" />
                      </div>
                    </div>

                    <div className="mt-auto pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-brand-primary">
                        {isVi ? product.priceVi : product.priceEn}
                      </span>
                      <a
                        href={ZALO_CHAT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-zinc-500 hover:text-brand-primary transition-colors flex items-center gap-1"
                      >
                        {isVi ? "Đặt ngay" : "Order now"} <ArrowRight size={12} />
                      </a>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-16 lg:py-20 bg-[var(--brand-soft)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-brand-primary uppercase tracking-widest mb-3">
              {isVi ? "Quy trình đặt in nhanh" : "How fast print works"}
            </p>
            <h2 className="text-3xl lg:text-4xl font-black text-zinc-900">
              {isVi ? "3 bước — nhận hàng trong 2 giờ" : "3 steps — delivered in 2 hours"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="relative bg-white rounded-2xl p-7 border border-brand-border shadow-sm"
                >
                  <span className="absolute -top-4 left-7 text-6xl font-black text-brand-primary/10 leading-none select-none">
                    {step.num}
                  </span>
                  <div className="p-3 rounded-xl bg-brand-soft inline-flex mb-5">
                    <Icon size={22} className="text-brand-primary" />
                  </div>
                  <h3 className="font-black text-zinc-900 text-lg mb-2">
                    {isVi ? step.titleVi : step.titleEn}
                  </h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    {isVi ? step.descVi : step.descEn}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Contact / CTA ── */}
      <section id="in-nhanh-cta" className="relative py-16 lg:py-20 overflow-hidden">
        <Image
          src="/images/cta/vd-cta-banner.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-brand-dark/88" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-4">
              {isVi ? "Bắt đầu đặt hàng ngay" : "Start your order now"}
            </p>
            <h2 className="text-3xl lg:text-5xl font-black text-white mb-4">
              {isVi ? "Cần gấp?" : "Need it fast?"}{" "}
              <span className="text-yellow-300">{isVi ? "Chúng tôi giải quyết trong 2 giờ." : "We deliver in 2 hours."}</span>
            </h2>
            <p className="text-white/60 text-base mb-8 max-w-xl mx-auto">
              {isVi
                ? "Gửi file thiết kế qua Zalo — nhận báo giá trong 5 phút và xác nhận đơn hàng ngay, giao tận nơi tại TP.HCM & Bình Dương."
                : "Send your design file via Zalo — get a quote in 5 minutes and confirm your order for delivery across HCM City & Binh Duong."}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={ZALO_CHAT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-400 text-zinc-900 font-black uppercase tracking-wide text-sm rounded-full hover:bg-yellow-300 transition-colors"
              >
                <Zap size={16} />
                {isVi ? "Gửi file qua Zalo ngay" : "Send file via Zalo now"}
              </a>
              <a
                href={`tel:${PHONE_NUMBER.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-2 px-8 py-4 text-white font-bold uppercase tracking-wide text-sm rounded-full border border-white/25 hover:bg-white/10 transition-colors"
              >
                <Phone size={16} />
                {PHONE_NUMBER}
              </a>
            </div>

            <p className="text-white/30 text-xs mt-6">
              {isVi
                ? "Xưởng làm việc T2–T7: 8:00–12:00 & 13:30–17:30. Tư vấn online qua Zalo 24/7."
                : "Workshop hours Mon–Sat: 8:00–12:00 & 13:30–17:30. Online consultation via Zalo 24/7."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Back to Products ── */}
      <div className="border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link
            href="/products"
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowRight size={14} className="rotate-180" />
            {isVi ? "Xem tất cả sản phẩm" : "All products"}
          </Link>
          <Link
            href="/#cta"
            className="flex items-center gap-2 text-sm font-semibold text-brand-primary hover:opacity-75 transition-opacity"
          >
            {isVi ? "Nhận báo giá" : "Get a quote"}
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
