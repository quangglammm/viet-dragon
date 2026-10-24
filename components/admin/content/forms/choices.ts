import type { VocabOption } from "@/lib/content/editor/vocabulary";

export const STATUS_OPTIONS: readonly VocabOption[] = [
  { value: "published", label: "Đang hiển thị" },
  { value: "archived", label: "Đã lưu trữ (ẩn)" },
];

export const CONTENT_FORMAT_OPTIONS: readonly VocabOption[] = [
  { value: "plain", label: "Văn bản thường" },
  { value: "markdown", label: "Markdown" },
];

export const ASPECT_OPTIONS: readonly VocabOption[] = [
  { value: "tall", label: "Dọc" },
  { value: "square", label: "Vuông" },
  { value: "wide", label: "Ngang" },
];
