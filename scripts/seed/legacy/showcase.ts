// data/showcase.ts
// The five pictures of the editorial gallery on /products. Moves to the content database in the next milestone;
// kept apart from data/categories.ts so the products index does not pull the whole static catalog through it.

export const showcaseImages = [
  {
    seed: "vd-show-1",
    src: "/images/product/vd-item-card.jpeg",
    label: "Danh thiếp cao cấp",
    labelEn: "Premium Business Cards",
    aspect: "tall",
  },
  {
    seed: "vd-show-2",
    src: "/images/product/vd-item-box.jpg",
    label: "Hộp giấy sang trọng",
    labelEn: "Luxury Packaging",
    aspect: "square",
  },
  {
    seed: "vd-show-3",
    src: "/images/product/vd-item-catalogue.jpeg",
    label: "Catalogue chuyên nghiệp",
    labelEn: "Professional Catalogue",
    aspect: "square",
  },
  {
    seed: "vd-show-4",
    src: "/images/product/vd-item-label.jpeg",
    label: "Nhãn mác tinh tế",
    labelEn: "Premium Labels",
    aspect: "wide",
  },
  {
    seed: "vd-show-5",
    src: "/images/product/vd-item-lixi.jpeg",
    label: "Bao lì xì Tết",
    labelEn: "Tet Lucky Envelopes",
    aspect: "wide",
  },
] as const;
