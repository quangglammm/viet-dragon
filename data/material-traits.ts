// data/material-traits.ts
// Shared icon glossary for product-option description bullets (see
// `ProductOption.descriptionTraits` in data/categories.ts). One small, reusable
// registry — any page/component can look up a trait's icon + label/explanation
// by key instead of re-defining icon choices locally. Currently consumed by
// `MaterialFlashcard` (per-bullet icon) and `MaterialGlossaryFab` (full legend).

import {
  Sparkles, Square, Stamp, Feather, CloudFog,
  Palette, Shield, Layers, Zap,
  type LucideIcon,
} from "lucide-react";

export type MaterialTraitKey =
  | "glossy-coat"
  | "smooth-base"
  | "foil-accent"
  | "natural-grain"
  | "soft-light"
  | "textured-art"
  | "metallic-shine"
  | "waterproof-durability"
  | "embossed-depth"
  | "digital-precision";

export interface MaterialTrait {
  icon: LucideIcon;
  label: string;
  labelVi: string;
  description: string;
  descriptionVi: string;
}

export const materialTraits: Record<MaterialTraitKey, MaterialTrait> = {
  "glossy-coat": {
    icon: Sparkles,
    label: "Glossy Coat",
    labelVi: "Bóng Gương",
    description: "A coated surface with sharp, mirror-like light reflections.",
    descriptionVi: "Bề mặt tráng phủ bóng, phản chiếu ánh sáng sắc nét như gương.",
  },
  "smooth-base": {
    icon: Square,
    label: "Smooth Base",
    labelVi: "Nền Mịn",
    description: "A smooth base with no visible paper grain.",
    descriptionVi: "Nền giấy mịn, không lộ vân giấy.",
  },
  "foil-accent": {
    icon: Stamp,
    label: "Foil Accent",
    labelVi: "Ép Kim",
    description: "A metallic foil detail stamped onto the surface.",
    descriptionVi: "Chi tiết ép kim ánh kim được dập lên bề mặt.",
  },
  "natural-grain": {
    icon: Feather,
    label: "Natural Grain",
    labelVi: "Vân Giấy Tự Nhiên",
    description: "A matte surface with a fine, natural paper grain.",
    descriptionVi: "Bề mặt nhám với vân giấy mịn, tự nhiên.",
  },
  "soft-light": {
    icon: CloudFog,
    label: "Soft Diffused Light",
    labelVi: "Ánh Sáng Dịu",
    description: "Light diffuses evenly across the surface, with no glare or reflection.",
    descriptionVi: "Ánh sáng khuếch tán đều trên bề mặt, không chói, không phản quang.",
  },
  "textured-art": {
    icon: Palette,
    label: "Textured Art Paper",
    labelVi: "Vân Mỹ Thuật",
    description: "Distinct tactile paper texture for an artisan, luxury feel.",
    descriptionVi: "Vân giấy đặc trưng mang lại cảm giác nghệ thuật, sang trọng khi chạm vào.",
  },
  "metallic-shine": {
    icon: Sparkles,
    label: "Pearl Metallic Shine",
    labelVi: "Ánh Ngọc Trai",
    description: "Subtle pearlescent sheen that shifts beautifully in light.",
    descriptionVi: "Bề mặt ánh ngọc trai sang trọng, chuyển màu tinh tế dưới ánh sáng.",
  },
  "waterproof-durability": {
    icon: Shield,
    label: "Waterproof Plastic",
    labelVi: "Chống Nước & Siêu Bền",
    description: "Tear-resistant and 100% waterproof synthetic base.",
    descriptionVi: "Chất liệu nhựa tổng hợp chống rách và chống nước 100%.",
  },
  "embossed-depth": {
    icon: Layers,
    label: "3D Embossing",
    labelVi: "Dập Nổi / Dập Chìm",
    description: "Tactile 3D relief stamping for logos and focal accents.",
    descriptionVi: "Kỹ thuật dập nổi/dập chìm tạo độ sâu 3D cho logo và chi tiết điểm nhấn.",
  },
  "digital-precision": {
    icon: Zap,
    label: "Quick Digital Print",
    labelVi: "In Nhanh Kỹ Thuật Số",
    description: "High-speed digital printing with sharp colors and short turnaround.",
    descriptionVi: "In kỹ thuật số tốc độ cao, chuẩn màu sắc với thời gian hoàn thành nhanh chóng.",
  },
};
