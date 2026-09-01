"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { DonutChart, type DonutSlice } from "@/components/admin/donut-chart";
import {
  Languages,
  Package,
  FileText,
  Image as ImageIcon,
  ArrowUpRight,
  Sparkles,
  PhoneCall,
  Printer,
  Calculator,
  TrendingUp,
  Send,
  Layers,
  BarChart3,
  DollarSign,
  Moon,
  Sun,
  Activity,
  ShoppingBag,
  Users,
  Sliders,
} from "lucide-react";

interface QuotationLead {
  id: string;
  customerName: string;
  company?: string;
  phone: string;
  productName: string;
  quantity: string;
  finishings: string[];
  locale: "vi" | "en" | "zh" | "ja" | "ko";
  status: "new" | "consulting" | "sampled" | "printing" | "completed";
  createdAt: string;
}

const SAMPLE_LEADS: QuotationLead[] = [
  {
    id: "BG-8091",
    customerName: "Nguyễn Hoàng Minh",
    company: "Chuỗi Cà Phê The Coffee Soul",
    phone: "0908 123 456",
    productName: "Túi Giấy Kraft & Ly Giấy In Logo",
    quantity: "2.000 túi · 5.000 ly",
    finishings: ["In 4 màu", "Quai dù xoắn"],
    locale: "vi",
    status: "new",
    createdAt: "10 phút trước",
  },
  {
    id: "BG-8090",
    customerName: "Tanaka Kenji",
    company: "Japan Precision Co., Ltd (Bình Dương)",
    phone: "0912 345 678",
    productName: "Bao Thư Doanh Nghiệp & Folder Kẹp File",
    quantity: "1.000 bộ",
    finishings: ["Ép kim logo", "Cán màng mờ"],
    locale: "ja",
    status: "consulting",
    createdAt: "45 phút trước",
  },
  {
    id: "BG-8089",
    customerName: "Trần Thu Hằng",
    company: "Mỹ Phẩm Cao Cấp GlowSkin",
    phone: "0983 999 888",
    productName: "Hộp Giấy Cứng Cao Cấp (Hộp Âm Dương)",
    quantity: "500 hộp",
    finishings: ["Cán màng nhung", "Ép kim vàng hồng", "Bế mút nhung định hình"],
    locale: "vi",
    status: "sampled",
    createdAt: "2 giờ trước",
  },
  {
    id: "BG-8088",
    customerName: "David Zhang",
    company: "Apex Global Logistics",
    phone: "0934 567 890",
    productName: "Danh Thiếp Cao Cấp (Namecard)",
    quantity: "20 hộp (In Lấy Liền 2H)",
    finishings: ["Giấy Mỹ Thuật Econo", "In 2 mặt", "Bo tròn 4 góc"],
    locale: "en",
    status: "printing",
    createdAt: "Hôm nay, 08:30",
  },
];

const STATUS_MAP = {
  new: { label: "Mới nhận", bg: "bg-rose-50 text-rose-700 border-rose-200" },
  consulting: { label: "Đang tư vấn", bg: "bg-amber-50 text-amber-700 border-amber-200" },
  sampled: { label: "Đã gửi mẫu test", bg: "bg-purple-50 text-purple-700 border-purple-200" },
  printing: { label: "Đang in tại xưởng", bg: "bg-blue-50 text-blue-700 border-blue-200" },
  completed: { label: "Đã giao hàng", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

// 12-Month Sales & Orders Data (Matches Reference Images 1, 2, 4, 5)
const MONTHLY_STATS_FULL = [
  { month: "Jan", sales: 450, orders: 580, revenue: 165, growth: "+8%" },
  { month: "Feb", sales: 650, orders: 350, revenue: 142, growth: "-14%" },
  { month: "Mar", sales: 440, orders: 760, revenue: 198, growth: "+39%" },
  { month: "Apr", sales: 160, orders: 350, revenue: 215, growth: "+8%" },
  { month: "May", sales: 940, orders: 850, revenue: 228, growth: "+6%" },
  { month: "Jun", sales: 410, orders: 350, revenue: 236, growth: "+3%" },
  { month: "Jul", sales: 550, orders: 780, revenue: 242, growth: "+2%" },
  { month: "Aug", sales: 260, orders: 240, revenue: 248, growth: "+18%", active: true },
  { month: "Sep", sales: 400, orders: 350, revenue: 255, growth: "+3%" },
  { month: "Oct", sales: 550, orders: 680, revenue: 260, growth: "+2%" },
  { month: "Nov", sales: 250, orders: 420, revenue: 268, growth: "+3%" },
  { month: "Dec", sales: 450, orders: 620, revenue: 280, growth: "+4%" },
];

// Product Actions Data (Views vs Clicks - Matches Images 1 & 4)
const PRODUCT_ACTIONS_DATA = [
  { month: "Jan", views: 580, clicks: 640 },
  { month: "Feb", views: 630, clicks: 760 },
  { month: "Mar", views: 950, clicks: 880 },
  { month: "Apr", views: 520, clicks: 410 },
  { month: "May", views: 760, clicks: 800 },
  { month: "Jun", views: 480, clicks: 510 },
  { month: "Jul", views: 880, clicks: 760 },
  { month: "Aug", views: 640, clicks: 710 },
  { month: "Sep", views: 920, clicks: 840 },
];

// Product Category Share for Full Pie Chart (Matches User Image: 62.7% Blue, 23.5% Pink, 13.8% Green)
const CATEGORY_DONUT_SLICES: DonutSlice[] = [
  { label: "Bao bì & Hộp giấy Cao cấp", value: 155800000, percent: 62.7, amount: "155.8 Tr", color: "#0072ff" },
  { label: "Ấn phẩm Tiếp thị & Catalogue", value: 58400000, percent: 23.5, amount: "58.4 Tr", color: "#ff0844" },
  { label: "Túi giấy & Quà tặng Doanh nghiệp", value: 34300000, percent: 13.8, amount: "34.3 Tr", color: "#11998e" },
];

// Language Demographic Share for Full Pie Chart
const LANGUAGE_DONUT_SLICES: DonutSlice[] = [
  { label: "Tiếng Việt (Nội địa)", flag: "🇻🇳", value: 155800000, percent: 62.7, amount: "155.8 Tr", color: "#0072ff" },
  { label: "English (FDI / Xuất khẩu)", flag: "🇬🇧", value: 58400000, percent: 23.5, amount: "58.4 Tr", color: "#ff0844" },
  { label: "日本語 & 中文 (DN Quốc Tế)", flag: "🇯🇵", value: 34300000, percent: 13.8, amount: "34.3 Tr", color: "#11998e" },
];

// Technology Distribution for Full Pie Chart
const TECH_DONUT_SLICES: DonutSlice[] = [
  { label: "In Offset 4-6 Màu Heidelberg", value: 155800000, percent: 62.7, amount: "155.8 Tr", color: "#0072ff" },
  { label: "In Kỹ Thuật Số Konica/Fuji", value: 58400000, percent: 23.5, amount: "58.4 Tr", color: "#ff0844" },
  { label: "In Lụa & UV Định Hình", value: 34300000, percent: 13.8, amount: "34.3 Tr", color: "#11998e" },
];

// Material & Paper Inventory Status
const WORKSHOP_INVENTORY = [
  { material: "Giấy Couche C300gsm (Khổ 65x86)", stock: "1.450 ram", duration: "Đủ dùng 18 ngày", status: "good" },
  { material: "Giấy Bristol B350gsm (Khổ 79x109)", stock: "820 ram", duration: "Đủ dùng 12 ngày", status: "good" },
  { material: "Giấy Kraft Nhật 250gsm", stock: "210 ram", duration: "Đủ dùng 4 ngày", status: "warning" },
  { material: "Giấy Mỹ Thuật Econo White", stock: "95 ram", duration: "Sắp hết hàng", status: "danger" },
  { material: "Cuộn Màng Mờ OPP (12 Micron)", stock: "48 cuộn", duration: "Đủ dùng 30 ngày", status: "good" },
  { material: "Nhũ Ép Kim Vàng 24K Foil", stock: "35 cuộn", duration: "Đủ dùng 25 ngày", status: "good" },
];

// Helper to generate smooth SVG bezier curves for area & line charts
function generateBezierPath(points: { x: number; y: number }[]) {
  if (!points || points.length === 0) return "";
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const ctrlX = (curr.x + next.x) / 2;
    d += ` C ${ctrlX},${curr.y} ${ctrlX},${next.y} ${next.x},${next.y}`;
  }
  return d;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    productsCount: 20,
    categoriesCount: 8,
    postsCount: 6,
    mediaCount: 35,
    localesCount: 5,
  });

  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "quarter" | "year">("30d");
  const [donutMode, setDonutMode] = useState<"category" | "language" | "tech">("category");
  const [hoveredMonth, setHoveredMonth] = useState<typeof MONTHLY_STATS_FULL[0] | null>(MONTHLY_STATS_FULL[7]);
  const [leads, setLeads] = useState<QuotationLead[]>(SAMPLE_LEADS);

  // CHART THEME & VISUAL MODE STATE (Inspired by Reference Images 1, 2, 3 vs 4, 5)
  const [dashboardTheme, setDashboardTheme] = useState<"dark" | "light">("dark");
  const [chartType, setChartType] = useState<"area" | "bar">("area");

  // Quick Print Cost Estimator State
  const [calcProduct, setCalcProduct] = useState("card");
  const [calcQty, setCalcQty] = useState(5);
  const [calcLamination, setCalcLamination] = useState(true);
  const [calcFoil, setCalcFoil] = useState(false);
  const [calcDoubleSided, setCalcDoubleSided] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/products").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/admin/blog").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/admin/media").then((r) => (r.ok ? r.json() : [])),
    ]).then(([products, posts, media]) => {
      const catsCount = Array.isArray(products) ? products.length : 8;
      const totalProds = Array.isArray(products)
        ? products.reduce((acc: number, c: { items?: unknown[] }) => acc + (c.items?.length || 0), 0)
        : 20;

      setStats({
        categoriesCount: catsCount,
        productsCount: totalProds,
        postsCount: Array.isArray(posts) ? posts.length : 6,
        mediaCount: Array.isArray(media) ? media.length : 35,
        localesCount: 5,
      });
    });
  }, []);

  const calculateEstimate = () => {
    let unitBase = 80000;
    if (calcProduct === "box") unitBase = 25000;
    if (calcProduct === "bag") unitBase = 12000;
    if (calcProduct === "brochure") unitBase = 8000;

    let total = unitBase * calcQty;
    if (calcDoubleSided) total += calcQty * 15000;
    if (calcLamination) total += calcQty * 10000;
    if (calcFoil) total += 150000;

    return total;
  };

  const handleStatusChange = (id: string) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id !== id) return lead;
        const sequence: QuotationLead["status"][] = ["new", "consulting", "sampled", "printing", "completed"];
        const currentIndex = sequence.indexOf(lead.status);
        const nextStatus = sequence[(currentIndex + 1) % sequence.length];
        return { ...lead, status: nextStatus };
      })
    );
  };

  const isDark = dashboardTheme === "dark";

  return (
    <AdminShell>
      {/* CHART BACKGROUND & STYLE TOOLBAR (Allows switching between Light/Dark theme & Area/Bar chart visualizer) */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-xs border border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-brand-primary">
            <Sliders size={18} />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight">
              Tùy Chỉnh Background & Kiểu Biểu Đồ Admin
            </h2>
            <p className="text-[11px] text-slate-500">
              Đổi giữa Giao diện Tối Slate (Ảnh 4, 5) & Giao diện Sáng Crisp (Ảnh 1, 2, 3)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Theme Background Toggle (Dark Slate vs Light Mode) */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200/60">
            <button
              type="button"
              onClick={() => setDashboardTheme("dark")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                isDark
                  ? "bg-[#1e293b] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Moon size={14} className={isDark ? "text-purple-400" : ""} />
              <span>Nền Tối Sang Trọng</span>
            </button>

            <button
              type="button"
              onClick={() => setDashboardTheme("light")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                !isDark
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Sun size={14} className={!isDark ? "text-amber-500" : ""} />
              <span>Nền Sáng Thanh Lịch</span>
            </button>
          </div>

          {/* Chart Type Toggle (Smooth Area Curve vs Dual Bar Pillar) */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200/60">
            <button
              type="button"
              onClick={() => setChartType("area")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                chartType === "area"
                  ? "bg-brand-primary text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Activity size={14} />
              <span>Biểu Đồ Sóng Gradient</span>
            </button>

            <button
              type="button"
              onClick={() => setChartType("bar")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                chartType === "bar"
                  ? "bg-brand-primary text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BarChart3 size={14} />
              <span>Biểu Đồ Cột Trực Quan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Banner: Workshop & Brand Status */}
      <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#09052f] via-[#1a0f5a] to-[#7000fe] p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-pink-300 backdrop-blur-md border border-white/10">
              <Sparkles size={13} /> Hệ Thống Quản Lý & Báo Cáo Xưởng In Viet Dragon
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
              Bảng Điều Khiển Xưởng In & Báo Cáo Số Liệu
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-purple-100 max-w-2xl leading-relaxed">
              Theo dõi thời gian thực doanh thu in ấn, sản lượng xuất xưởng, phân bổ khách hàng quốc tế và quản lý nội dung 5 ngôn ngữ.
            </p>
          </div>

          {/* Timeframe Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-black/30 p-1.5 backdrop-blur-md border border-white/10 self-start lg:self-auto">
            <button
              type="button"
              onClick={() => setTimeframe("7d")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                timeframe === "7d" ? "bg-white text-[#09052f] shadow-md" : "text-zinc-300 hover:text-white"
              }`}
            >
              7 ngày qua
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("30d")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                timeframe === "30d" ? "bg-white text-[#09052f] shadow-md" : "text-zinc-300 hover:text-white"
              }`}
            >
              Tháng 8/2026
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("quarter")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                timeframe === "quarter" ? "bg-white text-[#09052f] shadow-md" : "text-zinc-300 hover:text-white"
              }`}
            >
              Quý 3
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("year")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                timeframe === "year" ? "bg-white text-[#09052f] shadow-md" : "text-zinc-300 hover:text-white"
              }`}
            >
              Năm 2026
            </button>
          </div>
        </div>
      </div>

      {/* 4 KPI METRIC CARDS WITH VIBRANT SQUARE ICON BADGES */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Metric 1: Total Orders */}
        <div
          className={`rounded-3xl border p-6 transition-all shadow-xs hover:shadow-md ${
            isDark
              ? "bg-[#1e293b] border-slate-700/80 text-white"
              : "bg-white border-slate-200/80 text-slate-900"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider block ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Tổng Đơn Đặt In
              </span>
              <span className="text-3xl font-black mt-2 block font-mono">4.805</span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/30">
              <ShoppingBag size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-500 flex items-center gap-1">
              ▲ 5.2% <span className={isDark ? "text-slate-400 font-normal" : "text-slate-500 font-normal"}>so với tuần trước</span>
            </span>
          </div>
        </div>

        {/* Metric 2: Total Revenue */}
        <div
          className={`rounded-3xl border p-6 transition-all shadow-xs hover:shadow-md ${
            isDark
              ? "bg-[#1e293b] border-slate-700/80 text-white"
              : "bg-white border-slate-200/80 text-slate-900"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider block ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Tổng Doanh Thu In
              </span>
              <span className="text-3xl font-black mt-2 block font-mono">248.5 Tr</span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 text-white shadow-md shadow-emerald-500/30">
              <DollarSign size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-500 flex items-center gap-1">
              ▲ 4.6% <span className={isDark ? "text-slate-400 font-normal" : "text-slate-500 font-normal"}>so với tuần trước</span>
            </span>
          </div>
        </div>

        {/* Metric 3: Total Customers */}
        <div
          className={`rounded-3xl border p-6 transition-all shadow-xs hover:shadow-md ${
            isDark
              ? "bg-[#1e293b] border-slate-700/80 text-white"
              : "bg-white border-slate-200/80 text-slate-900"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider block ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Tổng Khách Hàng
              </span>
              <span className="text-3xl font-black mt-2 block font-mono">5.8K</span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white shadow-md shadow-rose-500/30">
              <Users size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="font-bold text-rose-500 flex items-center gap-1">
              ▼ 2.7% <span className={isDark ? "text-slate-400 font-normal" : "text-slate-500 font-normal"}>so với tuần trước</span>
            </span>
          </div>
        </div>

        {/* Metric 4: Bounce Rate / Return */}
        <div
          className={`rounded-3xl border p-6 transition-all shadow-xs hover:shadow-md ${
            isDark
              ? "bg-[#1e293b] border-slate-700/80 text-white"
              : "bg-white border-slate-200/80 text-slate-900"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider block ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Tỉ Lệ Khách Quay Lại
              </span>
              <span className="text-3xl font-black mt-2 block font-mono">38.15%</span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-md shadow-sky-500/30">
              <TrendingUp size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-500 flex items-center gap-1">
              ▲ 12.2% <span className={isDark ? "text-slate-400 font-normal" : "text-slate-500 font-normal"}>tối ưu hóa tốt</span>
            </span>
          </div>
        </div>
      </div>

      {/* CHARTS SECTION 1: SALES FIGURES & STATISTICS PIE (Updated Pie Chart Component) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mb-10">
        {/* Main Chart Card: Sales Figures (2 Cols) */}
        <div
          className={`lg:col-span-2 rounded-3xl border p-6 shadow-xs flex flex-col justify-between transition-colors ${
            isDark
              ? "bg-[#1e293b] border-slate-700/80 text-white"
              : "bg-white border-slate-200/80 text-slate-900"
          }`}
        >
          <div>
            {/* Chart Header */}
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${isDark ? "border-slate-700/70" : "border-slate-100"}`}>
              <div>
                <h2 className="text-lg font-black tracking-tight">Số Liệu Doanh Số & Đơn Đặt In</h2>
                <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Doanh số & Số lượng đơn hàng theo tháng (Dữ liệu đối soát xưởng in)
                </p>
              </div>

              {/* Chart Series Legend Dots & Hovered Month Badge */}
              <div className="flex items-center gap-4 text-xs font-bold">
                {hoveredMonth && (
                  <div className={`hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg border text-[11px] font-mono ${
                    isDark ? "bg-slate-800 border-slate-700 text-purple-300" : "bg-purple-50 border-purple-100 text-purple-900"
                  }`}>
                    <span>{hoveredMonth.month}:</span>
                    <span className="text-blue-500 font-bold">{hoveredMonth.sales} Doanh số</span>
                    <span>·</span>
                    <span className="text-emerald-500 font-bold">{hoveredMonth.orders} Đơn hàng</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-blue-500 shadow-xs" />
                  <span className={isDark ? "text-slate-300" : "text-slate-700"}>Doanh Số</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-xs" />
                  <span className={isDark ? "text-slate-300" : "text-slate-700"}>Đơn Hàng</span>
                </div>
              </div>
            </div>

            {/* CHART CANVAS AREA */}
            <div className="relative mt-6 pt-2">
              {/* Y-Axis Grid Lines */}
              <div className="absolute inset-x-0 top-0 bottom-8 flex flex-col justify-between pointer-events-none">
                {[1000, 800, 600, 400, 200, 0].map((val) => (
                  <div key={val} className="flex items-center gap-3">
                    <span className={`w-8 text-right font-mono text-[10px] font-semibold ${isDark ? "text-slate-400" : "text-slate-400"}`}>
                      {val}
                    </span>
                    <div className={`flex-1 border-b ${isDark ? "border-slate-700/60" : "border-slate-100"}`} />
                  </div>
                ))}
              </div>

              {/* CHART VISUALIZER: AREA SMOOTH GRADIENT vs DUAL BAR PILLARS */}
              <div className="relative h-60 w-full pl-11 pr-2 pt-2">
                {chartType === "area" ? (
                  <div className="h-full w-full">
                    <svg viewBox="0 0 600 220" className="h-full w-full overflow-visible">
                      <defs>
                        <linearGradient id="greenGradientArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                        </linearGradient>

                        <linearGradient id="blueGradientArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>

                      {(() => {
                        const greenPoints = MONTHLY_STATS_FULL.map((item, idx) => ({
                          x: 20 + (idx / (MONTHLY_STATS_FULL.length - 1)) * 560,
                          y: 200 - (item.orders / 1000) * 180,
                        }));

                        const bluePoints = MONTHLY_STATS_FULL.map((item, idx) => ({
                          x: 20 + (idx / (MONTHLY_STATS_FULL.length - 1)) * 560,
                          y: 200 - (item.sales / 1000) * 180,
                        }));

                        const greenBezier = generateBezierPath(greenPoints);
                        const blueBezier = generateBezierPath(bluePoints);

                        const greenArea = `${greenBezier} L ${greenPoints[greenPoints.length - 1].x},200 L ${greenPoints[0].x},200 Z`;
                        const blueArea = `${blueBezier} L ${bluePoints[bluePoints.length - 1].x},200 L ${bluePoints[0].x},200 Z`;

                        return (
                          <>
                            <path d={greenArea} fill="url(#greenGradientArea)" />
                            <path d={greenBezier} fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" />

                            <path d={blueArea} fill="url(#blueGradientArea)" />
                            <path d={blueBezier} fill="none" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round" />

                            {greenPoints.map((pt, idx) => (
                              <circle
                                key={`g-${idx}`}
                                cx={pt.x}
                                cy={pt.y}
                                r="4"
                                fill="#10b981"
                                onMouseEnter={() => setHoveredMonth(MONTHLY_STATS_FULL[idx])}
                                className="transition-all hover:r-6 cursor-pointer"
                              />
                            ))}

                            {bluePoints.map((pt, idx) => (
                              <circle
                                key={`b-${idx}`}
                                cx={pt.x}
                                cy={pt.y}
                                r="4"
                                fill="#3b82f6"
                                onMouseEnter={() => setHoveredMonth(MONTHLY_STATS_FULL[idx])}
                                className="transition-all hover:r-6 cursor-pointer"
                              />
                            ))}
                          </>
                        );
                      })()}
                    </svg>

                    <div className="flex items-center justify-between text-xs font-bold px-1 mt-2">
                      {MONTHLY_STATS_FULL.map((item) => (
                        <span
                          key={item.month}
                          onMouseEnter={() => setHoveredMonth(item)}
                          className={`cursor-pointer transition-colors ${
                            hoveredMonth?.month === item.month
                              ? "text-brand-primary font-black scale-110"
                              : isDark
                              ? "text-slate-400"
                              : "text-slate-500"
                          }`}
                        >
                          {item.month}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full items-end justify-between gap-1.5 pb-6">
                    {MONTHLY_STATS_FULL.map((item) => {
                      const salesHeight = Math.round((item.sales / 1000) * 100);
                      const ordersHeight = Math.round((item.orders / 1000) * 100);

                      return (
                        <div
                          key={item.month}
                          onMouseEnter={() => setHoveredMonth(item)}
                          className="group flex flex-1 flex-col items-center h-full justify-end cursor-pointer"
                        >
                          <div className="flex items-end gap-1 w-full justify-center h-full">
                            <div
                              style={{ height: `${salesHeight}%` }}
                              className="w-3 rounded-t-sm bg-blue-500 group-hover:bg-blue-400 transition-all duration-300"
                              title={`Sales: ${item.sales}`}
                            />
                            <div
                              style={{ height: `${ordersHeight}%` }}
                              className="w-3 rounded-t-sm bg-emerald-500 group-hover:bg-emerald-400 transition-all duration-300"
                              title={`Orders: ${item.orders}`}
                            />
                          </div>

                          <span className={`mt-3 text-[11px] font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            {item.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={`mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t text-xs ${isDark ? "border-slate-700/70 text-slate-400" : "border-slate-100 text-slate-500"}`}>
            <div className="flex items-center gap-4">
              <span>Đạt mục tiêu quý 3: <strong className="text-emerald-500 font-extrabold">98.4%</strong></span>
              <span>· Tăng trưởng đơn hàng: <strong className="text-blue-500 font-extrabold">+18.4%</strong></span>
            </div>
            <span>Cập nhật xưởng in: <strong>Vừa xong</strong></span>
          </div>
        </div>

        {/* Chart 2 Card: Statistics Full Pie Chart (Redesigned as per user reference image) */}
        <div
          className={`rounded-3xl border p-6 shadow-xs flex flex-col justify-between transition-colors ${
            isDark
              ? "bg-[#1e293b] border-slate-700/80 text-white"
              : "bg-white border-slate-200/80 text-slate-900"
          }`}
        >
          <div>
            <div className={`flex items-center justify-between border-b pb-4 ${isDark ? "border-slate-700/70" : "border-slate-100"}`}>
              <h3 className="font-extrabold text-base">Statistics</h3>
              <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-400"}`}>•••</span>
            </div>

            {/* Mode Switch Pills */}
            <div className="mt-4 flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setDonutMode("category")}
                className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  donutMode === "category" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                }`}
              >
                Danh mục
              </button>
              <button
                type="button"
                onClick={() => setDonutMode("language")}
                className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  donutMode === "language" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                }`}
              >
                Ngôn ngữ
              </button>
              <button
                type="button"
                onClick={() => setDonutMode("tech")}
                className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  donutMode === "tech" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                }`}
              >
                Công nghệ
              </button>
            </div>

            {/* Solid SVG Pie Chart with direct percentage labels (Reference Image style) */}
            <div className="mt-4">
              {donutMode === "category" && (
                <DonutChart
                  data={CATEGORY_DONUT_SLICES}
                  totalLabel="Doanh Thu"
                  totalValue="248.5 Tr"
                  isDark={isDark}
                />
              )}
              {donutMode === "language" && (
                <DonutChart
                  data={LANGUAGE_DONUT_SLICES}
                  totalLabel="Thị Trường"
                  totalValue="5 Ngôn Ngữ"
                  isDark={isDark}
                />
              )}
              {donutMode === "tech" && (
                <DonutChart
                  data={TECH_DONUT_SLICES}
                  totalLabel="Hệ Thống"
                  totalValue="100%"
                  isDark={isDark}
                />
              )}
            </div>
          </div>

          {/* Order Status Percentage Badges */}
          <div className="mt-4 space-y-2 pt-3 border-t border-slate-700/50">
            <div className={`flex items-center justify-between text-xs p-2 rounded-xl ${isDark ? "bg-slate-800/60" : "bg-slate-50"}`}>
              <span className="font-bold">Đơn Mới Nhận</span>
              <span className="bg-blue-600 text-white font-mono font-bold px-2 py-0.5 rounded-md text-[11px]">62.7%</span>
            </div>
            <div className={`flex items-center justify-between text-xs p-2 rounded-xl ${isDark ? "bg-slate-800/60" : "bg-slate-50"}`}>
              <span className="font-bold">Đã Giao Thành Công</span>
              <span className="bg-rose-500 text-white font-mono font-bold px-2 py-0.5 rounded-md text-[11px]">23.5%</span>
            </div>
            <div className={`flex items-center justify-between text-xs p-2 rounded-xl ${isDark ? "bg-slate-800/60" : "bg-slate-50"}`}>
              <span className="font-bold">Đang In / Xử Lý</span>
              <span className="bg-emerald-500 text-white font-mono font-bold px-2 py-0.5 rounded-md text-[11px]">13.8%</span>
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS SECTION 2: PRODUCT ACTIONS & VISITOR TRENDS */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mb-10">
        <div
          className={`lg:col-span-2 rounded-3xl border p-6 shadow-xs flex flex-col justify-between transition-colors ${
            isDark
              ? "bg-[#1e293b] border-slate-700/80 text-white"
              : "bg-white border-slate-200/80 text-slate-900"
          }`}
        >
          <div>
            <div className={`flex items-center justify-between border-b pb-4 ${isDark ? "border-slate-700/70" : "border-slate-100"}`}>
              <div>
                <h3 className="font-extrabold text-base">Tương Tác Sản Phẩm In</h3>
                <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Lượt xem chi tiết sản phẩm in & lượt nhấp đăng ký nhận báo giá
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-blue-500" />
                  <span className={isDark ? "text-slate-300" : "text-slate-700"}>Lượt Xem</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-amber-400" />
                  <span className={isDark ? "text-slate-300" : "text-slate-700"}>Lượt Nhấp Báo Giá</span>
                </div>
              </div>
            </div>

            <div className="relative mt-6 pt-2">
              <div className="absolute inset-x-0 top-0 bottom-8 flex flex-col justify-between pointer-events-none">
                {[1000, 800, 600, 400, 200, 0].map((val) => (
                  <div key={val} className="flex items-center gap-3">
                    <span className={`w-8 text-right font-mono text-[10px] font-semibold ${isDark ? "text-slate-400" : "text-slate-400"}`}>
                      {val}
                    </span>
                    <div className={`flex-1 border-b ${isDark ? "border-slate-700/60" : "border-slate-100"}`} />
                  </div>
                ))}
              </div>

              <div className="relative h-52 w-full pl-11 pr-2 pt-2">
                <svg viewBox="0 0 550 180" className="h-full w-full overflow-visible">
                  {(() => {
                    const viewsPoints = PRODUCT_ACTIONS_DATA.map((item, idx) => ({
                      x: 20 + (idx / (PRODUCT_ACTIONS_DATA.length - 1)) * 510,
                      y: 160 - (item.views / 1000) * 140,
                    }));

                    const clicksPoints = PRODUCT_ACTIONS_DATA.map((item, idx) => ({
                      x: 20 + (idx / (PRODUCT_ACTIONS_DATA.length - 1)) * 510,
                      y: 160 - (item.clicks / 1000) * 140,
                    }));

                    const viewsBezier = generateBezierPath(viewsPoints);
                    const clicksBezier = generateBezierPath(clicksPoints);

                    return (
                      <>
                        <path d={viewsBezier} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
                        <path d={clicksBezier} fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />

                        {viewsPoints.map((pt, i) => (
                          <circle key={`v-${i}`} cx={pt.x} cy={pt.y} r="3.5" fill="#3b82f6" />
                        ))}
                        {clicksPoints.map((pt, i) => (
                          <circle key={`c-${i}`} cx={pt.x} cy={pt.y} r="3.5" fill="#f59e0b" />
                        ))}
                      </>
                    );
                  })()}
                </svg>

                <div className="flex items-center justify-between text-xs font-bold px-1 mt-2">
                  {PRODUCT_ACTIONS_DATA.map((item) => (
                    <span key={item.month} className={isDark ? "text-slate-400" : "text-slate-500"}>
                      {item.month}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`rounded-3xl border p-6 shadow-xs flex flex-col justify-between transition-colors ${
            isDark
              ? "bg-[#1e293b] border-slate-700/80 text-white"
              : "bg-white border-slate-200/80 text-slate-900"
          }`}
        >
          <div>
            <div className={`flex items-center justify-between border-b pb-4 ${isDark ? "border-slate-700/70" : "border-slate-100"}`}>
              <h3 className="font-extrabold text-base">Nội Dung CMS</h3>
              <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-400"}`}>Tổng quan</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-blue-600 p-4 text-white shadow-md">
                <span className="text-2xl font-black block font-mono">25</span>
                <span className="text-xs font-bold opacity-90 block mt-1">Trang Web</span>
              </div>
              <div className="rounded-2xl bg-rose-600 p-4 text-white shadow-md">
                <span className="text-2xl font-black block font-mono">35</span>
                <span className="text-xs font-bold opacity-90 block mt-1">Bài Viết</span>
              </div>
              <div className="rounded-2xl bg-emerald-600 p-4 text-white shadow-md">
                <span className="text-2xl font-black block font-mono">16</span>
                <span className="text-xs font-bold opacity-90 block mt-1">Tài Khoản</span>
              </div>
              <div className="rounded-2xl bg-purple-600 p-4 text-white shadow-md">
                <span className="text-2xl font-black block font-mono">22</span>
                <span className="text-xs font-bold opacity-90 block mt-1">Danh Mục</span>
              </div>
            </div>
          </div>

          <div className={`mt-4 rounded-2xl p-3.5 text-center text-xs font-medium ${isDark ? "bg-slate-800 text-purple-300" : "bg-purple-50 text-purple-900"}`}>
            Tự động đồng bộ với cơ sở dữ liệu xưởng in Viet Dragon.
          </div>
        </div>
      </div>

      {/* SECOND ROW: Multi-Language FDI Share & Material Inventory */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-10">
        <div
          className={`rounded-3xl border p-6 shadow-xs transition-colors ${
            isDark
              ? "bg-[#1e293b] border-slate-700/80 text-white"
              : "bg-white border-slate-200/80 text-slate-900"
          }`}
        >
          <div className={`flex items-center justify-between border-b pb-4 ${isDark ? "border-slate-700/70" : "border-slate-100"}`}>
            <div className="flex items-center gap-2">
              <Languages size={18} className="text-emerald-500" />
              <h3 className="font-extrabold text-base">
                Phân Bổ Khách Hàng Theo Ngôn Ngữ
              </h3>
            </div>
            <span className="rounded-lg bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 text-xs font-bold">
              Đa quốc gia
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {LANGUAGE_DONUT_SLICES.map((lang, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{lang.flag}</span>
                    <span className={isDark ? "text-slate-200" : "text-slate-800"}>{lang.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-[11px] font-normal ${isDark ? "text-slate-400" : "text-slate-400"}`}>{lang.amount}</span>
                    <span className="font-black text-brand-primary">{lang.percent}%</span>
                  </div>
                </div>
                <div className={`h-2 w-full rounded-full overflow-hidden ${isDark ? "bg-slate-700" : "bg-slate-100"}`}>
                  <div
                    style={{ width: `${lang.percent}%`, backgroundColor: lang.color }}
                    className="h-full rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>

          <p className={`mt-5 text-xs leading-relaxed border-t pt-3 ${isDark ? "border-slate-700/70 text-slate-400" : "border-slate-100 text-slate-400"}`}>
            Hệ thống tự động phát hiện trình duyệt & ngôn ngữ của khách hàng quốc tế (Nhật Bản, Hàn Quốc, Trung Quốc, Âu Mỹ) tại các KCN TP.HCM & Bình Dương.
          </p>
        </div>

        <div
          className={`rounded-3xl border p-6 shadow-xs transition-colors ${
            isDark
              ? "bg-[#1e293b] border-slate-700/80 text-white"
              : "bg-white border-slate-200/80 text-slate-900"
          }`}
        >
          <div className={`flex items-center justify-between border-b pb-4 ${isDark ? "border-slate-700/70" : "border-slate-100"}`}>
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-amber-500" />
              <h3 className="font-extrabold text-base">
                Tồn Kho Giấy In & Vật Tư Xưởng
              </h3>
            </div>
            <span className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-400"}`}>Xưởng Bình Dương</span>
          </div>

          <div className={`mt-4 divide-y ${isDark ? "divide-slate-700/60" : "divide-slate-100"}`}>
            {WORKSHOP_INVENTORY.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className={`font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>{item.material}</p>
                  <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-400"}`}>{item.duration}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-mono font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{item.stock}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      item.status === "good"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : item.status === "warning"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {item.status === "good" ? "Đủ hàng" : item.status === "warning" ? "Cần nhập" : "Sắp hết"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* THIRD ROW: Quotation Leads & Print Cost Estimator */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mb-10">
        <div
          className={`lg:col-span-2 rounded-3xl border p-6 shadow-xs transition-colors ${
            isDark
              ? "bg-[#1e293b] border-slate-700/80 text-white"
              : "bg-white border-slate-200/80 text-slate-900"
          }`}
        >
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 ${isDark ? "border-slate-700/70" : "border-slate-100"}`}>
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 rounded-full bg-rose-500 animate-pulse" />
                <h2 className="text-lg font-black">
                  Yêu Cầu Báo Giá & Tư Vấn Mẫu Gần Đây
                </h2>
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Khách hàng gửi yêu cầu qua form, mã QR hoặc nút copy tư vấn Zalo trên web
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span className={`rounded-lg px-2.5 py-1 ${isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"}`}>Nhấp vào thẻ để đổi trạng thái</span>
            </div>
          </div>

          <div className="mt-5 space-y-3.5">
            {leads.map((lead) => {
              const statusCfg = STATUS_MAP[lead.status];
              return (
                <div
                  key={lead.id}
                  className={`rounded-2xl border p-4 transition-all ${
                    isDark
                      ? "border-slate-700/70 bg-slate-800/40 hover:bg-slate-800 hover:border-purple-500/50"
                      : "border-slate-100 bg-slate-50/50 hover:bg-purple-50/30 hover:border-purple-200"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-mono font-bold text-white">
                        {lead.id}
                      </span>
                      <span className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>{lead.customerName}</span>
                      {lead.company && (
                        <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>· {lead.company}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-400"}`}>{lead.createdAt}</span>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(lead.id)}
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold transition-transform active:scale-95 cursor-pointer ${statusCfg.bg}`}
                      >
                        {statusCfg.label}
                      </button>
                    </div>
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-center gap-y-1.5 gap-x-3 text-xs">
                    <div className={`flex items-center gap-1 font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                      <Printer size={13} className="text-brand-primary" />
                      <span>{lead.productName}</span>
                    </div>
                    <span className="text-slate-500">|</span>
                    <span className={`font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>{lead.quantity}</span>
                    <span className="text-slate-500">|</span>
                    <div className="flex items-center gap-1 text-slate-400">
                      <span>Gia công:</span>
                      {lead.finishings.map((f, idx) => (
                        <span
                          key={idx}
                          className={`rounded-md border px-1.5 py-0.2 text-[10px] font-medium ${
                            isDark
                              ? "bg-slate-800 border-slate-700 text-slate-300"
                              : "bg-white border-slate-200 text-slate-700"
                          }`}
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className={`mt-3.5 flex items-center justify-between border-t pt-2.5 text-xs ${isDark ? "border-slate-700/60" : "border-slate-200/60"}`}>
                    <div className={`flex items-center gap-2 font-mono font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      <PhoneCall size={12} className="text-emerald-500" />
                      <span>{lead.phone}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`https://zalo.me/${lead.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-500 text-white px-2.5 py-1 text-[11px] font-bold hover:bg-blue-600 transition-colors shadow-xs"
                      >
                        <Send size={11} /> Nhắn Zalo
                      </a>
                      <a
                        href={`tel:${lead.phone.replace(/[^0-9]/g, "")}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-900 text-white px-2.5 py-1 text-[11px] font-bold hover:bg-brand-primary transition-colors shadow-xs"
                      >
                        <PhoneCall size={11} /> Gọi Ngay
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className={`rounded-3xl border p-6 shadow-xs flex flex-col justify-between transition-colors ${
            isDark
              ? "bg-[#1e293b] border-slate-700/80 text-white"
              : "bg-white border-slate-200/80 text-slate-900"
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                <Calculator size={18} />
              </span>
              <div>
                <h3 className="font-extrabold text-base">
                  Tính Giá In Nhanh
                </h3>
                <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Ước tính giá vốn & báo giá tức thì</p>
              </div>
            </div>

            <div className="mt-5 space-y-3.5">
              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Loại sản phẩm in
                </label>
                <select
                  value={calcProduct}
                  onChange={(e) => setCalcProduct(e.target.value)}
                  className={`w-full rounded-xl border p-2.5 text-xs font-semibold focus:border-brand-primary focus:outline-hidden ${
                    isDark
                      ? "border-slate-700 bg-slate-800 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-800"
                  }`}
                >
                  <option value="card">Danh thiếp / Card Visit (C300gsm)</option>
                  <option value="box">Hộp giấy Ivory 350gsm</option>
                  <option value="bag">Túi giấy Kraft quai xoắn</option>
                  <option value="brochure">Catalogue / Brochure A4</option>
                </select>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Số lượng ({calcProduct === "card" ? "Hộp" : "Cái / Cuốn"})
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[2, 5, 10, 20].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setCalcQty(qty)}
                      className={`rounded-xl py-2 text-xs font-bold transition-all cursor-pointer ${
                        calcQty === qty
                          ? "bg-brand-primary text-white shadow-md shadow-brand-primary/30"
                          : isDark
                          ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {qty} {calcProduct === "card" ? "hộp" : ""}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`space-y-2 pt-2 border-t ${isDark ? "border-slate-700/60" : "border-slate-100"}`}>
                <label className={`text-xs font-bold block ${isDark ? "text-slate-300" : "text-slate-700"}`}>Quy cách gia công</label>
                
                <label className={`flex items-center justify-between rounded-xl p-2.5 text-xs cursor-pointer ${
                  isDark ? "bg-slate-800/80 text-slate-300 hover:bg-slate-800" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}>
                  <span>In 2 mặt đầy đủ màu</span>
                  <input
                    type="checkbox"
                    checked={calcDoubleSided}
                    onChange={(e) => setCalcDoubleSided(e.target.checked)}
                    className="h-4 w-4 rounded accent-brand-primary cursor-pointer"
                  />
                </label>

                <label className={`flex items-center justify-between rounded-xl p-2.5 text-xs cursor-pointer ${
                  isDark ? "bg-slate-800/80 text-slate-300 hover:bg-slate-800" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}>
                  <span>Cán màng mờ 2 mặt</span>
                  <input
                    type="checkbox"
                    checked={calcLamination}
                    onChange={(e) => setCalcLamination(e.target.checked)}
                    className="h-4 w-4 rounded accent-brand-primary cursor-pointer"
                  />
                </label>

                <label className={`flex items-center justify-between rounded-xl p-2.5 text-xs cursor-pointer ${
                  isDark ? "bg-slate-800/80 text-slate-300 hover:bg-slate-800" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}>
                  <span>Ép kim logo (Foil Stamp)</span>
                  <input
                    type="checkbox"
                    checked={calcFoil}
                    onChange={(e) => setCalcFoil(e.target.checked)}
                    className="h-4 w-4 rounded accent-brand-primary cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className={`mt-6 rounded-2xl p-4 border ${
            isDark
              ? "bg-slate-800/90 border-purple-900/50"
              : "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100"
          }`}>
            <div className="flex items-center justify-between text-xs text-purple-400 font-medium">
              <span>Đơn giá đề xuất:</span>
              <span className="text-[11px] bg-purple-500/20 px-2 py-0.5 rounded-full font-bold text-purple-300">
                Thời gian: 24H
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-brand-primary">
                {calculateEstimate().toLocaleString()} đ
              </span>
              <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                (~{(calculateEstimate() / calcQty).toLocaleString()} đ / đv)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CMS Direct Shortcuts */}
      <div className="mb-6">
        <h2 className={`text-base font-extrabold mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
          <TrendingUp size={18} className="text-brand-primary" />
          Phân Hệ Quản Trị Website & Nội Dung
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/translations"
            className={`group rounded-3xl border p-6 shadow-xs transition-all ${
              isDark
                ? "bg-[#1e293b] border-slate-700/80 text-white hover:border-brand-primary/50 hover:shadow-lg"
                : "bg-white border-slate-200/80 text-slate-900 hover:border-brand-primary/50 hover:shadow-lg"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="rounded-2xl bg-purple-500/20 p-3 text-purple-400 group-hover:scale-110 transition-transform">
                <Languages size={22} />
              </span>
              <ArrowUpRight size={18} className="text-slate-400 group-hover:text-brand-primary transition-colors" />
            </div>
            <h3 className="mt-4 font-bold text-base group-hover:text-brand-primary transition-colors">
              Biên Tập 5 Ngôn Ngữ
            </h3>
            <p className={`mt-1.5 text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Chỉnh sửa song song tiếng Việt, Anh, Trung, Nhật, Hàn trên tất cả các trang.
            </p>
          </Link>

          <Link
            href="/admin/products"
            className={`group rounded-3xl border p-6 shadow-xs transition-all ${
              isDark
                ? "bg-[#1e293b] border-slate-700/80 text-white hover:border-emerald-500/50 hover:shadow-lg"
                : "bg-white border-slate-200/80 text-slate-900 hover:border-emerald-500/50 hover:shadow-lg"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="rounded-2xl bg-emerald-500/20 p-3 text-emerald-400 group-hover:scale-110 transition-transform">
                <Package size={22} />
              </span>
              <ArrowUpRight size={18} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
            </div>
            <h3 className="mt-4 font-bold text-base group-hover:text-emerald-400 transition-colors">
              Sản Phẩm & Bảng Giá
            </h3>
            <p className={`mt-1.5 text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Quản lý {stats.productsCount} sản phẩm ({stats.categoriesCount} danh mục in), tùy chọn chất liệu flashcard, in 2 mặt, phụ phí ép kim.
            </p>
          </Link>

          <Link
            href="/admin/media"
            className={`group rounded-3xl border p-6 shadow-xs transition-all ${
              isDark
                ? "bg-[#1e293b] border-slate-700/80 text-white hover:border-blue-500/50 hover:shadow-lg"
                : "bg-white border-slate-200/80 text-slate-900 hover:border-blue-500/50 hover:shadow-lg"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="rounded-2xl bg-blue-500/20 p-3 text-blue-400 group-hover:scale-110 transition-transform">
                <ImageIcon size={22} />
              </span>
              <ArrowUpRight size={18} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
            </div>
            <h3 className="mt-4 font-bold text-base group-hover:text-blue-400 transition-colors">
              Thư Viện Mẫu In & Ảnh
            </h3>
            <p className={`mt-1.5 text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Tải lên hình ảnh mẫu in thực tế ({stats.mediaCount}+ tệp), tự động tối ưu hóa và sao chép link 1-click.
            </p>
          </Link>

          <Link
            href="/admin/blog"
            className={`group rounded-3xl border p-6 shadow-xs transition-all ${
              isDark
                ? "bg-[#1e293b] border-slate-700/80 text-white hover:border-amber-500/50 hover:shadow-lg"
                : "bg-white border-slate-200/80 text-slate-900 hover:border-amber-500/50 hover:shadow-lg"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="rounded-2xl bg-amber-500/20 p-3 text-amber-400 group-hover:scale-110 transition-transform">
                <FileText size={22} />
              </span>
              <ArrowUpRight size={18} className="text-slate-400 group-hover:text-amber-400 transition-colors" />
            </div>
            <h3 className="mt-4 font-bold text-base group-hover:text-amber-400 transition-colors">
              Bài Viết & Mẹo In Ấn
            </h3>
            <p className={`mt-1.5 text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Quản lý {stats.postsCount} bài viết cẩm nang in ấn, case study bao bì và tin tức xưởng in.
            </p>
          </Link>
        </div>
      </div>
    </AdminShell>
  );
}
