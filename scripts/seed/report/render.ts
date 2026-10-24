import { NOTE_KINDS, type NoteKind } from "../notes";
import { LOCALES } from "../localized";
import type { ReportData } from "./collect";
import { renderDecisions } from "./decisions";
import { counted, n, table } from "./format";

// The seed report, in Vietnamese, for the owner. Plain markdown; every number is computed from the run.

const LANGUAGE_NAME: Record<(typeof LOCALES)[number], string> = { vi: "Tiếng Việt", en: "English", zh: "中文", ja: "日本語", ko: "한국어" };

/** Note kinds that a numbered decision already explains. Any other kind with entries is listed under "Ghi chú khác". */
const EXPLAINED_BY_DECISIONS: readonly NoteKind[] = [
  "material-name-conflict", "shared-translation-key", "title-precedence-differs", "spec-same-vi-different-translation", "bullet-count-differs-by-locale",
  "option-slug-collision", "media-stray", "fastprint-price-wording",
];

/** What each note means to the owner. Exhaustive: adding a note kind without an explanation does not compile. */
const NOTE_DESCRIPTIONS: Record<NoteKind, string> = {
  "media-stray": "Tệp tạm hoặc sao lưu trong thư mục ảnh, không được đăng ký",
  "media-unknown-extension": "Tệp có đuôi lạ trong thư mục ảnh, không được đăng ký",
  "media-unresolved": "Dữ liệu nhắc tới một tệp ảnh không có trong thư mục ảnh; chỗ đó để trống",
  "category-description-differs": "Mô tả tiếng Anh của danh mục có hai phiên bản khác nhau trong mã",
  "icon-unknown": "Biểu tượng không có trong thư viện biểu tượng; dùng biểu tượng mặc định",
  "fastprint-price-unparsed": "Không đọc được giá của sản phẩm in nhanh",
  "fastprint-price-differs-by-locale": "Số tiền của sản phẩm in nhanh khác nhau giữa các ngôn ngữ",
  "fastprint-tag-hours-inconsistent": "Nhãn thời gian in nhanh (ví dụ «2h») không nhất quán giữa các ngôn ngữ",
  "fastprint-price-wording": "Cách diễn đạt giá in nhanh",
  "material-name-conflict": "Loại giấy có tên dịch khác nhau",
  "product-no-title": "Sản phẩm thiếu tiêu đề ở một ngôn ngữ (sẽ hiện tiếng Anh)",
  "product-no-description": "Sản phẩm thiếu mô tả tiếng Trung/Nhật/Hàn",
  "title-precedence-differs": "Tiêu đề có hai nguồn khác nhau",
  "shared-translation-key": "Sản phẩm ở nhiều danh mục dùng chung bản dịch",
  "slug-invalid": "Đường dẫn không hợp lệ (phải là chữ thường không dấu, số và dấu gạch ngang)",
  "shape-slug-duplicate": "Hai hình thức trùng đường dẫn trong một sản phẩm (đã thêm hậu tố)",
  "option-slug-collision": "Hai lựa chọn trùng đường dẫn trong một sản phẩm",
  "option-unit-ignored": "Lựa chọn có ghi đơn vị tính riêng; chưa được nhập",
  "bullet-count-differs-by-locale": "Số gạch đầu dòng khác nhau giữa các ngôn ngữ",
  "traits-length-mismatch": "Số biểu tượng đặc điểm không khớp số gạch đầu dòng mô tả (biểu tượng thừa hoặc thiếu)",
  "unknown-trait": "Biểu tượng đặc điểm không có trong từ điển đặc điểm",
  "alias-invalid": "Đường dẫn cũ không hợp lệ nên không được giữ",
  "size-sub-mm": "Kích thước có phần lẻ dưới 1 mm; đã làm tròn",
  "size-label-unparseable": "Nhãn kích thước không tách được phần ghi chú",
  "spec-length-differs-by-locale": "Danh sách thông số có số dòng khác nhau giữa các ngôn ngữ",
  "spec-same-vi-different-translation": "Cụm tiếng Việt có hai bản dịch",
  "menu-unresolved": "Mục menu không trỏ được tới sản phẩm, hình thức hay chất liệu nào; không được nhập",
  "message-namespace-not-object": "Khối văn bản giao diện không đúng dạng; bị bỏ qua",
};

function introduction(data: ReportData): string {
  return [
    `# Báo cáo nhập dữ liệu gốc của website Việt Dragon`,
    `Ngày tạo: ${data.generatedOn}. Báo cáo này được tạo tự động từ dữ liệu hiện có của website (sản phẩm, menu, bài viết, bản dịch…).`,
    `**Chưa có gì thay đổi trên website.** Đây là bản sao đưa vào cơ sở dữ liệu mới để quản trị viên chỉnh sửa về sau. Website vẫn đọc dữ liệu cũ cho đến khi bước chuyển đổi được thực hiện và kiểm tra xong.`,
    `Phần 2 liệt kê ${n(11)} chỗ dữ liệu hiện tại **không nhất quán** nên cần chủ shop chọn. Mỗi mục đã có đề xuất; chỉ cần đánh dấu «Đồng ý» hoặc ghi cách khác. Phần 1 cho biết đã nhập những gì, phần 3 là ghi chú kỹ thuật không cần quyết định.`,
  ].join("\n\n");
}

function imported(data: ReportData): string {
  const countRows = data.counts.map((c) => [c.label, n(c.rows)]);
  const gaps = data.coverage.map((row) => {
    const base = row.perLocale.vi;
    return [row.label, ...LOCALES.map((l) => (row.perLocale[l] === base ? n(row.perLocale[l]) : `${n(row.perLocale[l])} (thiếu ${n(base - row.perLocale[l])})`))];
  });
  return [
    `## 1. Đã nhập những gì`,
    table(["Mục", "Số lượng"], countRows),
    `### Bản dịch theo ngôn ngữ`,
    `Số bản dịch đã có cho từng ngôn ngữ; «thiếu» là so với số bản tiếng Việt. Chỗ thiếu sẽ hiện bản tiếng Anh (hoặc tiếng Việt) cho đến khi được dịch.`,
    table(["Nội dung", ...LOCALES.map((l) => LANGUAGE_NAME[l])], gaps),
  ].join("\n\n");
}

function technicalNotes(data: ReportData): string {
  const { notes } = data.outcome;
  const wording = [...new Set(notes.get("fastprint-price-wording"))];
  const others = NOTE_KINDS.filter((kind) => !EXPLAINED_BY_DECISIONS.includes(kind) && notes.count(kind) > 0);
  const parts = [
    `## 3. Ghi chú kỹ thuật (không cần quyết định)`,
    counted(`Cách diễn đạt giá «In nhanh» (chữ «Chỉ từ», «From», «〜»…) không phải dữ liệu, sẽ chuyển vào bản dịch giao diện:`, wording, 12),
    others.length
      ? [`### Ghi chú khác`, ...others.map((kind) => counted(`**${NOTE_DESCRIPTIONS[kind]}** — ${n(notes.count(kind))}:`, notes.get(kind), 5))].join("\n\n")
      : "- Không còn ghi chú nào khác.",
  ];
  return parts.join("\n\n");
}

function appendix(data: ReportData): string {
  const { notes, stats } = data.outcome;
  const section = (title: string, items: readonly string[]) => [`### ${title} (${n(items.length)})`, items.length ? items.map((item) => `- ${item}`).join("\n") : "- Không có."].join("\n\n");
  return [
    `## Phụ lục — danh sách đầy đủ`,
    section("Loại giấy có tên dịch khác nhau (quyết định 2)", notes.get("material-name-conflict")),
    section("Đường dẫn đoán giữa các danh mục không còn hoạt động (quyết định 9)", stats.droppedCrossCategoryAliases),
    section("Khóa dịch mồ côi (quyết định 10)", Object.entries(stats.unusedTranslationKeys).flatMap(([table, keys]) => keys.map((key) => `${table}: ${key}`))),
    section("Tệp tạm không đăng ký (quyết định 10)", notes.get("media-stray")),
    section("Ảnh/video đã đăng ký nhưng chưa trang nào dùng (quyết định 10)", data.unreferencedMedia),
  ].join("\n\n");
}

export function renderReport(data: ReportData): string {
  return [introduction(data), imported(data), `## 2. Những điều cần quyết định`, renderDecisions(data), technicalNotes(data), appendix(data)].join("\n\n") + "\n";
}

