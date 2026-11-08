import { LOCALES } from "../localized";
import { NOTE_KINDS, type NoteKind } from "../notes";
import type { ReportData, UrlRow } from "./collect";
import { renderMasterDecisions } from "./decisions";
import { counted, n, table } from "./format";
import { renderOtherLanguages, renderSuggestionTables } from "./other-languages";

// The seed report, in Vietnamese, for the owner. Plain markdown; every number is computed from the run.
// Order of the report = order of priority: Vietnamese and English first (they must be complete and reviewed),
// Chinese / Japanese / Korean follow English.

const LANGUAGE_NAME: Record<(typeof LOCALES)[number], string> = { vi: "Tiếng Việt", en: "English", zh: "中文", ja: "日本語", ko: "한국어" };

/** Note kinds that a numbered decision, an information item or an appendix already explains. */
const EXPLAINED_ELSEWHERE: readonly NoteKind[] = [
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

function introduction(data: ReportData, decisions: number): string {
  return [
    `# Báo cáo nhập dữ liệu gốc của website Việt Dragon`,
    `Ngày tạo: ${data.generatedOn}. Báo cáo này được tạo tự động từ dữ liệu hiện có của website (sản phẩm, menu, bài viết, bản dịch…).`,
    `**Chưa có gì thay đổi trên website.** Đây là bản sao đưa vào cơ sở dữ liệu mới để quản trị viên chỉnh sửa về sau. Website vẫn đọc dữ liệu cũ cho đến khi bước chuyển đổi được thực hiện và kiểm tra xong.`,
    `**Thứ tự ưu tiên: tiếng Việt và English hoàn chỉnh trước, các ngôn ngữ còn lại sao chép từ English.** Phần 2 liệt kê ${n(decisions)} chỗ cần chủ shop quyết định cho tiếng Việt và English (quan trọng nhất là hệ thống đường dẫn theo từng ngôn ngữ). Mỗi mục đã có đề xuất; chỉ cần đánh dấu «Đồng ý» hoặc ghi cách khác. Phần 3 là tiếng Trung / Nhật / Hàn — chưa cần quyết định, chỉ cần biết. Phần 1 cho biết đã nhập những gì, phần 4 là ghi chú kỹ thuật.`,
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
    `### Mức đầy đủ theo ngôn ngữ`,
    `Số bản dịch đã có cho từng ngôn ngữ; «thiếu» là so với số bản tiếng Việt. Tiếng Việt và English phải đầy đủ trước. Tiếng Trung / Nhật / Hàn đã được bổ sung các chỗ còn trống bằng bản dịch đề xuất (phần 3). Chỗ nào còn thiếu sẽ hiện bản English (rồi tiếng Việt).`,
    table(["Nội dung", ...LOCALES.map((l) => LANGUAGE_NAME[l])], gaps),
  ].join("\n\n");
}

function technicalNotes(data: ReportData): string {
  const { notes } = data.outcome;
  const wording = [...new Set(notes.get("fastprint-price-wording"))];
  const others = NOTE_KINDS.filter((kind) => !EXPLAINED_ELSEWHERE.includes(kind) && notes.count(kind) > 0);
  return [
    `## 4. Ghi chú kỹ thuật (không cần quyết định)`,
    counted(`Cách diễn đạt giá «In nhanh» (chữ «Chỉ từ», «From», «〜»…) không phải dữ liệu, sẽ chuyển vào bản dịch giao diện:`, wording, 12),
    others.length
      ? [`### Ghi chú khác`, ...others.map((kind) => counted(`**${NOTE_DESCRIPTIONS[kind]}** — ${n(notes.count(kind))}:`, notes.get(kind), 5))].join("\n\n")
      : "- Không còn ghi chú nào khác.",
  ].join("\n\n");
}

const urlRows = (rows: readonly UrlRow[]): string[][] => rows.map((row) => [row.scope, `\`${row.vi}\``, `\`${row.en}\``]);

function appendix(data: ReportData): string {
  const { notes, stats } = data.outcome;
  const { urls } = data;
  const section = (title: string, items: readonly string[]) => [`### ${title} (${n(items.length)})`, items.length ? items.map((item) => `- ${item}`).join("\n") : "- Không có."].join("\n\n");
  return [
    `## Phụ lục — danh sách đầy đủ`,
    [
      `### Phụ lục A — đường dẫn mới của hình thức, lựa chọn chất liệu và bài viết (quyết định 1)`,
      `Đường dẫn tiếng Trung / Nhật / Hàn giống English. Ghi cách sửa bên cạnh dòng nào chưa vừa ý.`,
      `**Hình thức** (${n(urls.shapes.length)}):`,
      table(["Sản phẩm", "Tiếng Việt", "English"], urlRows(urls.shapes)),
      `**Lựa chọn chất liệu** (${n(urls.options.length)}):`,
      table(["Sản phẩm", "Tiếng Việt", "English"], urlRows(urls.options)),
      `**Bài viết** (${n(urls.posts.length)}):`,
      table(["Hiện nay (tiếng Việt)", "Tiếng Việt (mới)", "English (mới)"], urls.posts.map((p) => [`\`/blog/${p.today}\``, `\`${p.vi}\``, `\`${p.en}\``])),
    ].join("\n\n"),
    [
      `### Phụ lục B — dữ liệu thừa (quyết định 6 và 7)`,
      section("Đường dẫn đoán giữa các danh mục không còn hoạt động", stats.droppedCrossCategoryAliases),
      section("Khóa dịch mồ côi", Object.entries(stats.unusedTranslationKeys).flatMap(([table, keys]) => keys.map((key) => `${table}: ${key}`))),
      section("Tệp tạm không đăng ký", notes.get("media-stray")),
      section("Ảnh/video đã đăng ký nhưng chưa thấy nơi nào nhắc tới", data.unreferencedMedia),
    ].join("\n\n"),
    [`### Phụ lục C — tiếng Trung / Nhật / Hàn`, section("Loại giấy có tên dịch khác nhau", notes.get("material-name-conflict"))].join("\n\n"),
    renderSuggestionTables(data),
  ].join("\n\n");
}

export function renderReport(data: ReportData): string {
  const decisions = renderMasterDecisions(data);
  return [
    introduction(data, decisions.count),
    imported(data),
    `## 2. Tiếng Việt và English — cần chủ shop quyết định`,
    decisions.text,
    renderOtherLanguages(data),
    technicalNotes(data),
    appendix(data),
  ].join("\n\n") + "\n";
}
