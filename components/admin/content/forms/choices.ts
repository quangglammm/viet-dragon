import type { VocabOption } from "@/lib/content/editor/vocabulary";

export const STATUS_OPTIONS: readonly VocabOption[] = [
  { value: "published", label: "Đang hiển thị" },
  { value: "archived", label: "Đã lưu trữ (ẩn)" },
];

export const ASPECT_OPTIONS: readonly VocabOption[] = [
  { value: "tall", label: "Dọc" },
  { value: "square", label: "Vuông" },
  { value: "wide", label: "Ngang" },
];
