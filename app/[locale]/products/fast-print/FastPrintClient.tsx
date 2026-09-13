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

import type { Locale } from "@/i18n/routing";

const PRINT_PRODUCTS = [
  {
    id: "danh-thiep",
    nameVi: "Danh thiếp",
    nameEn: "Business Cards",
    nameZh: "商务名片",
    nameJa: "ビジネス名刺",
    nameKo: "비즈니스 명함",
    tagVi: "In nhanh 2h",
    tagEn: "Ready in 2h",
    tagZh: "2小时快印",
    tagJa: "2時間特急",
    tagKo: "2시간 출고",
    priceVi: "Chỉ từ 120.000đ/Hộp",
    priceEn: "From 120,000đ/Box",
    priceZh: "低至 120,000₫/盒",
    priceJa: "120,000₫/箱〜",
    priceKo: "최저 120,000₫/상자",
    descVi: "Danh thiếp C300, cán màng mờ/bóng, bo góc tùy chọn.",
    descEn: "300gsm card, matte/gloss lamination, optional round corners.",
    descZh: "300gsm 铜版纸，哑膜/亮膜覆膜，可选圆角。",
    descJa: "300gsm コート紙、マット/グロスPP加工、角丸加工対応。",
    descKo: "300gsm 스노우지, 무광/유광 코팅, 모따기 가공 선택 가능.",
    image: "/images/product/vd-item-card.jpeg",
    icon: CreditCard,
  },
  {
    id: "to-roi",
    nameVi: "Tờ rơi / Leaflet",
    nameEn: "Flyers & Leaflets",
    nameZh: "宣传单页 / 折页",
    nameJa: "チラシ / フライヤー",
    nameKo: "전단지 / 리플렛",
    tagVi: "In nhanh 4h",
    tagEn: "Ready in 4h",
    tagZh: "4小时快印",
    tagJa: "4時間特急",
    tagKo: "4시간 출고",
    priceVi: "Chỉ từ 850đ/Tờ",
    priceEn: "From 850đ/Sheet",
    priceZh: "低至 850₫/张",
    priceJa: "850₫/枚〜",
    priceKo: "최저 850₫/장",
    descVi: "Tờ rơi A5/A4 Couche 150–200gsm, cán màng bảo vệ.",
    descEn: "A5/A4 flyers, C150–C200gsm, with optional lamination.",
    descZh: "A5/A4 150–200gsm 铜版纸，表面保护性覆膜。",
    descJa: "A5/A4 コート紙 150–200gsm、表面保護PP加工。",
    descKo: "A5/A4 150–200gsm 아트지, 표면 보호 코팅.",
    image: "/images/product/vd-item-flyer.jpeg",
    icon: FileText,
  },
  {
    id: "voucher",
    nameVi: "Voucher / Phiếu",
    nameEn: "Vouchers & Coupons",
    nameZh: "代金券 / 优惠券",
    nameJa: "クーポン / 引換券",
    nameKo: "쿠폰 / 상품권",
    tagVi: "In nhanh 4h",
    tagEn: "Ready in 4h",
    tagZh: "4小时快印",
    tagJa: "4時間特急",
    tagKo: "4시간 출고",
    priceVi: "Chỉ từ 1.100đ/Tờ",
    priceEn: "From 1,100đ/Sheet",
    priceZh: "低至 1,100₫/张",
    priceJa: "1,100₫/枚〜",
    priceKo: "최저 1,100₫/장",
    descVi: "Voucher cấn răng cưa nhảy số, bảo vệ bằng cán màng.",
    descEn: "Perforated vouchers with sequential numbering.",
    descZh: "打齿孔撕线设计，连续流水编号，覆膜保护。",
    descJa: "ミシン目加工、ナンバリング連番印字、保護PP加工。",
    descKo: "미싱선 가공, 일련번호 넘버링, 코팅 처리.",
    image: "/images/product/tag-couche1.webp",
    icon: StickyNote,
  },
  {
    id: "tem-nhan",
    nameVi: "Tem nhãn / Decal",
    nameEn: "Labels & Stickers",
    nameZh: "不干胶标签 / 贴纸",
    nameJa: "ラベル / シール",
    nameKo: "라벨 / 스티커",
    tagVi: "In nhanh 2h",
    tagEn: "Ready in 2h",
    tagZh: "2小时快印",
    tagJa: "2時間特急",
    tagKo: "2시간 출고",
    priceVi: "Chỉ từ 400đ/Tem",
    priceEn: "From 400đ/Sticker",
    priceZh: "低至 400₫/枚",
    priceJa: "400₫/枚〜",
    priceKo: "최저 400₫/장",
    descVi: "Decal giấy, nhựa chống nước, bế theo hình bất kỳ.",
    descEn: "Paper or waterproof vinyl stickers, kiss-cut to any shape.",
    descZh: "铜版纸胶或防水PVC材质，支持任意异形模切。",
    descJa: "上質紙シール・防水耐水ビニール、自由な形状にダイカット。",
    descKo: "일반 종이 및 방수 비닐 라벨, 자유 곡선 도무송 재단.",
    image: "/images/product/vd-item-decal.jpeg",
    icon: Package2,
  },
  {
    id: "catalogue",
    nameVi: "Catalogue / Tờ gấp",
    nameEn: "Catalogues & Brochures",
    nameZh: "企业画册 / 宣传折页",
    nameJa: "カタログ / パンフレット",
    nameKo: "카탈로그 / 브로슈어",
    tagVi: "In nhanh 6h",
    tagEn: "Ready in 6h",
    tagZh: "6小时快印",
    tagJa: "6時間特急",
    tagKo: "6시간 출고",
    priceVi: "Chỉ từ 3.600đ/Cuốn",
    priceEn: "From 3,600đ/Book",
    priceZh: "低至 3,600₫/本",
    priceJa: "3,600₫/冊〜",
    priceKo: "최저 3,600₫/권",
    descVi: "Catalogue A4/A5 tiêu chuẩn, tờ gấp đôi, gấp ba.",
    descEn: "A4/A5 catalogues, bi-fold and tri-fold brochures.",
    descZh: "标准 A4/A5 画册、对折页、三折页。",
    descJa: "A4/A5 標準カタログ、2つ折り・3つ折りリーフレット。",
    descKo: "표준 A4/A5 카탈로그, 2단/3단 접지 팜플렛.",
    image: "/images/product/vd-item-catalogue.jpeg",
    icon: Printer,
  },
  {
    id: "envelope",
    nameVi: "Bao thư lấy ngay",
    nameEn: "Express Envelopes",
    nameZh: "加急信封",
    nameJa: "特急封筒",
    nameKo: "당일 인쇄 봉투",
    tagVi: "Lấy ngay",
    tagEn: "Express",
    tagZh: "急件速取",
    tagJa: "即日発送",
    tagKo: "즉시 출고",
    priceVi: "Chỉ từ 1.800đ/Cái",
    priceEn: "From 1,800đ/Pcs",
    priceZh: "低至 1,800₫/个",
    priceJa: "1,800₫/枚〜",
    priceKo: "최저 1,800₫/개",
    descVi: "Bao thư in nhanh nhiều kích thước, giao trong 4h.",
    descEn: "Multiple sizes, express delivery within 4h.",
    descZh: "多种尺寸信封快速印刷，4小时内送达。",
    descJa: "各種サイズ対応、特急印刷・4時間以内のお届け。",
    descKo: "다양한 규격의 봉투 인쇄, 4시간 이내 배송.",
    image: "/images/product/vd-item-envelope.jpeg",
    icon: Package2,
  },
] as const;

const STEPS = [
  {
    num: "01",
    titleVi: "Gửi file thiết kế",
    titleEn: "Send your design file",
    titleZh: "发送设计文件",
    titleJa: "デザインデータ送付",
    titleKo: "디자인 파일 접수",
    descVi: "Gửi file AI, PDF, PSD qua Zalo/email. Chúng tôi kiểm tra file và xác nhận trong 15 phút.",
    descEn: "Send AI, PDF, or PSD via Zalo/email. We review and confirm within 15 minutes.",
    descZh: "通过 Zalo 或邮箱发送 AI、PDF、PSD。我们将在 15 分钟内审核并确认文件。",
    descJa: "AI、PDF、PSDファイルをZaloまたはメールで送信。15分以内にデータ確認・受付完了します。",
    descKo: "AI, PDF, PSD 파일을 Zalo 또는 이메일로 접수. 15분 이내에 파일 검토 후 확정해 드립니다.",
    icon: FileText,
  },
  {
    num: "02",
    titleVi: "In nhanh & hoàn thiện",
    titleEn: "Fast print & finishing",
    titleZh: "极速印刷与成型",
    titleJa: "特急印刷・製本加工",
    titleKo: "초고속 인쇄 및 후가공",
    descVi: "Máy in kỹ thuật số tốc độ cao in chính xác màu sắc, cán màng và bế thành phẩm theo đúng yêu cầu.",
    descEn: "High-speed digital press delivers accurate CMYK colors with lamination and finishing.",
    descZh: "高速工业数码印刷机精准还原色彩，专业覆膜及模切成型。",
    descJa: "最新の高速デジタル印刷機が正確なCMYKカラーを再現し、PP加工・型抜きを迅速に行います。",
    descKo: "고속 디지털 프레스로 정확한 CMYK 색상을 구현하고 코팅 및 재단 가공을 완성합니다.",
    icon: Printer,
  },
  {
    num: "03",
    titleVi: "Nhận hàng linh hoạt",
    titleEn: "Flexible delivery",
    titleZh: "灵活配送方式",
    titleJa: "柔軟な納品・受取",
    titleKo: "맞춤형 수령 및 배송",
    descVi: "Nhận tại xưởng hoặc giao tận nơi tại TP.HCM & Bình Dương, nhanh nhất trong 2–4 giờ.",
    descEn: "Pick up at our shop or get express delivery in HCM City & Binh Duong in 2–4 hours.",
    descZh: "工厂自提或专人送货上门（胡志明市及平阳省），最快 2–4 小时送达。",
    descJa: "店頭受取またはホーチミン市＆ビンズオン省への特急バイク配送（最短2〜4時間）。",
    descKo: "매장 직접 수령 또는 호치민 및 빈증 전역 퀵 배송, 최단 2~4시간 내 배송.",
    icon: Truck,
  },
] as const;

const FEATURES = [
  {
    iconEl: Clock,
    labelVi: "Giao trong 2–4 giờ",
    labelEn: "Delivered in 2–4 hours",
    labelZh: "2–4小时送达",
    labelJa: "2〜4時間でお届け",
    labelKo: "2~4시간 신속 배송",
  },
  {
    iconEl: BadgeCheck,
    labelVi: "Chuẩn màu 100%",
    labelEn: "100% color accuracy",
    labelZh: "100%精准色彩",
    labelJa: "100%高精度カラー",
    labelKo: "100% 정밀 색상",
  },
  {
    iconEl: CheckCircle2,
    labelVi: "Không MOQ tối thiểu",
    labelEn: "No minimum quantity",
    labelZh: "无起订量门槛",
    labelJa: "最小ロット制限なし",
    labelKo: "최소 주문 수량 없음",
  },
  {
    iconEl: Zap,
    labelVi: "In ngay trong ngày",
    labelEn: "Same-day printing",
    labelZh: "当天印刷出货",
    labelJa: "当日仕上げ即日印刷",
    labelKo: "당일 인쇄 즉시 출고",
  },
  {
    iconEl: Timer,
    labelVi: "Xác nhận trong 15 phút",
    labelEn: "Confirmed in 15 minutes",
    labelZh: "15分钟内极速确认",
    labelJa: "15分以内の迅速確認",
    labelKo: "15분 이내 빠른 확인",
  },
  {
    iconEl: Truck,
    labelVi: "Miễn phí giao nội thành",
    labelEn: "Free city delivery",
    labelZh: "市区订单免费配送",
    labelJa: "市内エリア無料配送",
    labelKo: "시내 무료 직배송",
  },
] as const;

const I18N = {
  breadcrumbHome: { vi: "Trang Chủ", en: "Home", zh: "首页", ja: "ホーム", ko: "홈" },
  breadcrumbProducts: { vi: "Sản Phẩm", en: "Products", zh: "产品", ja: "製品一覧", ko: "제품 목록" },
  breadcrumbCurrent: { vi: "In Nhanh", en: "Fast Print", zh: "极速快印", ja: "特急印刷", ko: "당일 특급 인쇄" },
  badge: {
    vi: "In kỹ thuật số lấy liền trong ngày",
    en: "Same-day digital printing",
    zh: "当天数码快印取件",
    ja: "当日仕上げデジタル特急印刷",
    ko: "당일 완성 디지털 초고속 인쇄",
  },
  title1: { vi: "In nhanh — ", en: "Fast print — ", zh: "极速快印 — ", ja: "特急スピード印刷 — ", ko: "초고속 인쇄 — " },
  titleHighlight: { vi: "lấy ngay", en: "ready", zh: "极速交付", ja: "即日仕上がり", ko: "즉시 출고" },
  title2: { vi: "trong 2 giờ", en: "in 2 hours", zh: "2小时内出货", ja: "2時間で納品", ko: "2시간 완성" },
  subtitle: {
    vi: "Danh thiếp, tờ rơi, voucher, tem nhãn — in số lượng ít lấy ngay trong ngày. Không MOQ tối thiểu, chuẩn màu 100%, giao tận nơi TP.HCM & Bình Dương.",
    en: "Business cards, flyers, vouchers, labels — small-run express printing with no minimum order, 100% color accuracy, delivered to your door.",
    zh: "名片、传单、优惠券、标签 — 小批量当天快印取件。无起订量门槛，100%色彩精准，胡志明市及平阳省送货上门。",
    ja: "名刺、チラシ、クーポン、ラベル — 小ロット当日仕上げ。最小発注数なし、100%正確な色校正、ホーチミン市＆ビンズオン省へ直送。",
    ko: "명함, 전단지, 쿠폰, 라벨 스티커 — 소량 당일 즉시 출고. 최소 주문 수량 제한 없음, 100% 정밀 색상 보장, 호치민 및 빈증 전역 직배송.",
  },
  btnZalo: { vi: "Gửi file qua Zalo", en: "Send file via Zalo", zh: "通过 Zalo 发送文件", ja: "Zaloでデータ送信", ko: "Zalo로 파일 전송" },
  prodsEyebrow: { vi: "Sản phẩm có thể in nhanh", en: "Products available for express print", zh: "支持加急印刷的产品", ja: "特急印刷対応製品", ko: "당일 특급 인쇄 지원 품목" },
  prodsTitle: { vi: "In lấy ngay — giao trong 2–6 giờ", en: "Express print — delivered in 2–6 hours", zh: "极速快印 — 2至6小时送达", ja: "特急印刷 — 2〜6時間でお届け", ko: "즉시 출고 — 2~6시간 내 배송" },
  prodsDesc: {
    vi: "Tất cả sản phẩm đều được in bằng máy kỹ thuật số tốc độ cao, cam kết màu sắc trung thực và thành phẩm đẹp.",
    en: "All products printed on high-speed digital presses with guaranteed color accuracy and quality finishing.",
    zh: "所有产品均由高速数码印刷机制造，保证色彩逼真还原与高品质精工成型。",
    ja: "全製品を高精度デジタル印刷機で製造。忠実な色再現と美しい仕上がりをお約束します。",
    ko: "모든 제품은 고속 디지털 인쇄기로 제작되며, 정확한 색상 구현과 깔끔한 마감을 보장합니다.",
  },
  orderNow: { vi: "Đặt ngay", en: "Order now", zh: "立即订购", ja: "今すぐ注文", ko: "지금 주문하기" },
  stepsEyebrow: { vi: "Quy trình đặt in nhanh", en: "How fast print works", zh: "加急印刷流程", ja: "特急印刷の流れ", ko: "빠른 인쇄 진행 절차" },
  stepsTitle: { vi: "3 bước — nhận hàng trong 2 giờ", en: "3 steps — delivered in 2 hours", zh: "简易3步 — 2小时内取件", ja: "簡単3ステップ — 2時間でお届け", ko: "간단 3단계 — 2시간 내 수령" },
  ctaEyebrow: { vi: "Bắt đầu đặt hàng ngay", en: "Start your order now", zh: "立即开启加急印刷", ja: "今すぐご注文・ご相談", ko: "지금 바로 주문하기" },
  ctaTitle1: { vi: "Cần gấp?", en: "Need it fast?", zh: "时间紧迫？", ja: "お急ぎですか？", ko: "급하게 필요하신가요?" },
  ctaTitleHighlight: {
    vi: "Chúng tôi giải quyết trong 2 giờ.",
    en: "We deliver in 2 hours.",
    zh: "我们2小时内为您搞定。",
    ja: "2時間仕上げでお応えします。",
    ko: "2시간 이내에 해결해 드립니다.",
  },
  ctaDesc: {
    vi: "Gửi file thiết kế qua Zalo — nhận báo giá trong 5 phút và xác nhận đơn hàng ngay, giao tận nơi tại TP.HCM & Bình Dương.",
    en: "Send your design file via Zalo — get a quote in 5 minutes and confirm your order for delivery across HCM City & Binh Duong.",
    zh: "通过 Zalo 发送设计文件 — 5分钟内获取报价并确认订单，快速配送至胡志明市及平阳省全境。",
    ja: "デザインデータをZaloで送信 — 5分以内にお見積りをご案内、ホーチミン市＆ビンズオン省へ特急配送。",
    ko: "디자인 파일을 Zalo로 전송하세요 — 5분 내 견적 안내 및 주문 확인, 호치민과 빈증 전역으로 배송됩니다.",
  },
  ctaBtnZalo: { vi: "Gửi file qua Zalo ngay", en: "Send file via Zalo now", zh: "立即通过 Zalo 发送文件", ja: "今すぐZaloでファイル送信", ko: "지금 Zalo로 파일 전송" },
  workshopHours: {
    vi: "Xưởng làm việc T2–T7: 8:00–12:00 & 13:30–17:30. Tư vấn online qua Zalo 24/7.",
    en: "Workshop hours Mon–Sat: 8:00–12:00 & 13:30–17:30. Online consultation via Zalo 24/7.",
    zh: "工厂工作时间 周一至周六：8:00–12:00 & 13:30–17:30。Zalo 在线咨询 24/7 全天候开放。",
    ja: "営業時間 月〜土：8:00〜12:00 & 13:30〜17:30。Zaloオンライン相談は24時間受付中。",
    ko: "제작소 운영시간 월~토: 8:00~12:00 & 13:30~17:30. Zalo 실시간 온라인 상담 24시간 상시 가능.",
  },
  allProducts: { vi: "Xem tất cả sản phẩm", en: "All products", zh: "查看全部产品", ja: "全製品一覧を見る", ko: "전체 제품 보기" },
  getQuote: { vi: "Nhận báo giá", en: "Get a quote", zh: "获取即时报价", ja: "お見積り依頼", ko: "견적 요청하기" },
};

function pickField(dict: Record<string, string>, loc: string): string {
  return dict[loc] || dict.en || dict.vi || "";
}

export default function FastPrintClient({ locale }: Readonly<{ locale: string }>) {
  const loc = (locale || "vi") as Locale;
  const t = (k: keyof typeof I18N) => pickField(I18N[k], loc);

  const getProdName = (p: (typeof PRINT_PRODUCTS)[number]) => {
    if (loc === "vi") return p.nameVi;
    if (loc === "zh") return p.nameZh;
    if (loc === "ja") return p.nameJa;
    if (loc === "ko") return p.nameKo;
    return p.nameEn;
  };
  const getProdTag = (p: (typeof PRINT_PRODUCTS)[number]) => {
    if (loc === "vi") return p.tagVi;
    if (loc === "zh") return p.tagZh;
    if (loc === "ja") return p.tagJa;
    if (loc === "ko") return p.tagKo;
    return p.tagEn;
  };
  const getProdPrice = (p: (typeof PRINT_PRODUCTS)[number]) => {
    if (loc === "vi") return p.priceVi;
    if (loc === "zh") return p.priceZh;
    if (loc === "ja") return p.priceJa;
    if (loc === "ko") return p.priceKo;
    return p.priceEn;
  };
  const getProdDesc = (p: (typeof PRINT_PRODUCTS)[number]) => {
    if (loc === "vi") return p.descVi;
    if (loc === "zh") return p.descZh;
    if (loc === "ja") return p.descJa;
    if (loc === "ko") return p.descKo;
    return p.descEn;
  };
  const getStepTitle = (s: (typeof STEPS)[number]) => {
    if (loc === "vi") return s.titleVi;
    if (loc === "zh") return s.titleZh;
    if (loc === "ja") return s.titleJa;
    if (loc === "ko") return s.titleKo;
    return s.titleEn;
  };
  const getStepDesc = (s: (typeof STEPS)[number]) => {
    if (loc === "vi") return s.descVi;
    if (loc === "zh") return s.descZh;
    if (loc === "ja") return s.descJa;
    if (loc === "ko") return s.descKo;
    return s.descEn;
  };
  const getFeatureLabel = (f: (typeof FEATURES)[number]) => {
    if (loc === "vi") return f.labelVi;
    if (loc === "zh") return f.labelZh;
    if (loc === "ja") return f.labelJa;
    if (loc === "ko") return f.labelKo;
    return f.labelEn;
  };

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
            <Link href="/" className="hover:text-white transition-colors">{t("breadcrumbHome")}</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-white transition-colors">{t("breadcrumbProducts")}</Link>
            <span>/</span>
            <span className="text-white/80">{t("breadcrumbCurrent")}</span>
          </nav>

          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full bg-yellow-400/15 border border-yellow-400/30 text-yellow-300 text-xs font-bold uppercase tracking-widest"
            >
              <Zap size={12} fill="currentColor" />
              {t("badge")}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl lg:text-6xl font-black text-white leading-tight mb-4"
            >
              {t("title1")}<span className="text-yellow-300">{t("titleHighlight")}</span><br />{t("title2")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-white/70 text-lg mb-8 leading-relaxed"
            >
              {t("subtitle")}
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
                {t("btnZalo")}
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
                    {getFeatureLabel(f)}
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
              {t("prodsEyebrow")}
            </p>
            <h2 className="text-3xl lg:text-4xl font-black text-zinc-900">
              {t("prodsTitle")}
            </h2>
            <p className="text-zinc-500 mt-3 max-w-xl mx-auto">
              {t("prodsDesc")}
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
                      alt={getProdName(product)}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-400 text-zinc-900 text-xs font-black">
                        <Zap size={10} fill="currentColor" />
                        {getProdTag(product)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 p-5 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-black text-zinc-900 text-base group-hover:text-brand-primary transition-colors">
                          {getProdName(product)}
                        </h3>
                        <p className="text-zinc-500 text-sm mt-1 leading-relaxed">
                          {getProdDesc(product)}
                        </p>
                      </div>
                      <div className="shrink-0 p-2 rounded-xl bg-brand-soft">
                        <Icon size={18} className="text-brand-primary" />
                      </div>
                    </div>

                    <div className="mt-auto pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-brand-primary">
                        {getProdPrice(product)}
                      </span>
                      <a
                        href={ZALO_CHAT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-zinc-500 hover:text-brand-primary transition-colors flex items-center gap-1"
                      >
                        {t("orderNow")} <ArrowRight size={12} />
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
              {t("stepsEyebrow")}
            </p>
            <h2 className="text-3xl lg:text-4xl font-black text-zinc-900">
              {t("stepsTitle")}
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
                    {getStepTitle(step)}
                  </h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    {getStepDesc(step)}
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
              {t("ctaEyebrow")}
            </p>
            <h2 className="text-3xl lg:text-5xl font-black text-white mb-4">
              {t("ctaTitle1")}{" "}
              <span className="text-yellow-300">{t("ctaTitleHighlight")}</span>
            </h2>
            <p className="text-white/60 text-base mb-8 max-w-xl mx-auto">
              {t("ctaDesc")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={ZALO_CHAT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-400 text-zinc-900 font-black uppercase tracking-wide text-sm rounded-full hover:bg-yellow-300 transition-colors"
              >
                <Zap size={16} />
                {t("ctaBtnZalo")}
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
              {t("workshopHours")}
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
            {t("allProducts")}
          </Link>
          <Link
            href="/#cta"
            className="flex items-center gap-2 text-sm font-semibold text-brand-primary hover:opacity-75 transition-opacity"
          >
            {t("getQuote")}
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
