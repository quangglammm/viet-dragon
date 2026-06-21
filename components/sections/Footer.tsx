import Link from "next/link";
import { productCategories } from "@/data/categories";

const freeServices = [
  "Tư Vấn / Consultation",
  "Thiết Kế / Design",
  "In Thử / Sample Print",
  "Giao Hàng / Delivery",
];

export default function Footer() {
  return (
    <footer className="bg-brand-dark text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <p className="text-2xl font-black tracking-tight mb-4">
              VIET <span className="text-brand-red">DRAGON</span>
            </p>
            <p className="text-white/50 text-sm leading-relaxed mb-2">
              Công ty in ấn chuyên nghiệp tại TP. Hồ Chí Minh &amp; Bình Dương.
            </p>
            <p className="text-white/30 text-xs leading-relaxed">
              Professional printing services in Ho Chi Minh City &amp; Binh Duong.
            </p>
          </div>

          {/* Products — categories from data */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-white/40 mb-4">
              Sản Phẩm · Products
            </p>
            <ul className="flex flex-col gap-2">
              {productCategories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href="/products"
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {cat.nameVi}
                    <span className="text-white/30 ml-1 text-xs">/ {cat.nameEn}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Free services */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-white/40 mb-4">
              Dịch Vụ Miễn Phí · Free Services
            </p>
            <ul className="flex flex-col gap-2">
              {freeServices.map((s) => (
                <li key={s}>
                  <Link
                    href="/#services"
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-white/40 mb-4">
              Liên Hệ · Contact
            </p>
            <ul className="flex flex-col gap-3 text-sm text-white/60">
              <li>
                <a href="tel:0901448377" className="hover:text-white transition-colors">
                  📞 0901 448 377
                </a>
              </li>
              <li>
                <a href="tel:0919510543" className="hover:text-white transition-colors">
                  📞 0919 510 543
                </a>
              </li>
              <li>
                <a href="mailto:contact@vietdragon.vn" className="hover:text-white transition-colors">
                  ✉️ contact@vietdragon.vn
                </a>
              </li>
              <li className="text-white/40 text-xs leading-relaxed">
                📍 TP. Hồ Chí Minh &amp; Bình Dương
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/30">
          <p>© {new Date().getFullYear()} Viet Dragon. All rights reserved.</p>
          <p>In ấn chất lượng cao · Premium Printing Services</p>
        </div>
      </div>
    </footer>
  );
}
