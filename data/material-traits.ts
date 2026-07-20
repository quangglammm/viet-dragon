// data/material-traits.ts
// Shared icon glossary for product-option description bullets (see
// `ProductOption.descriptionTraits` in data/categories.ts). One small, reusable
// registry — any page/component can look up a trait's icon + label/explanation
// by key instead of re-defining icon choices locally. Currently consumed by
// `MaterialFlashcard` (per-bullet icon) and `MaterialGlossaryFab` (full legend).

import {
  Sparkles, Square, Stamp, Feather, CloudFog,
  type LucideIcon,
} from "lucide-react";

export type MaterialTraitKey =
  | "glossy-coat"
  | "smooth-base"
  | "foil-accent"
  | "natural-grain"
  | "soft-light";

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
};
