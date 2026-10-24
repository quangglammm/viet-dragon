import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Change } from "@/lib/content/diff";
import { DiffView } from "./diff-view";

const render = (changes: Change[]) => renderToStaticMarkup(createElement(DiffView, { type: "product", changes }));

describe("DiffView", () => {
  it("names an added row by what it is and shows its text, not its JSON", () => {
    const markup = render([{ kind: "added", path: "options[3f2a1c9e-0000-4000-8000-000000000000].bullets[feature:3]", after: { i18n: { vi: "Đặc điểm thử nghiệm" }, kind: "feature", trait: null, position: 3 } }]);
    expect(markup).toContain("Dòng nội dung");
    expect(markup).toContain("Đặc điểm thử nghiệm");
    expect(markup).not.toContain("&quot;kind&quot;");
  });

  it("names a removed shape by its Vietnamese name", () => {
    const markup = render([{ kind: "removed", path: "shapes[3f2a1c9e-0000-4000-8000-000000000000]", before: { i18n: { vi: { name: "Tờ rơi A5", badge: "Mới" } }, position: 1 } }]);
    expect(markup).toContain("Hình thức");
    expect(markup).toContain("Tờ rơi A5");
  });

  it("falls back to the JSON for a row with no text of its own", () => {
    expect(render([{ kind: "added", path: "sizes[large]", after: { tier: "large", w: 210 } }])).toContain("&quot;tier&quot;");
  });

  it("keeps a plain field change as before and after", () => {
    const markup = render([{ kind: "changed", path: "i18n.vi.title", before: "Tờ rơi", after: "Tờ rơi A5" }]);
    expect(markup).toContain("Tên sản phẩm (vi)");
    expect(markup).toContain("Tờ rơi A5");
  });
});

describe("DiffView on a menu", () => {
  const render = (changes: Change[], names?: Map<string, string>) => renderToStaticMarkup(createElement(DiffView, { type: "menu", changes, names }));
  const group = "4f9729d5-6e95-4014-b423-617db5973e42";

  it("calls a column by its own number and says what a group or column holds", () => {
    const markup = render([
      { kind: "removed", path: `columns[2].groups[${group}]`, before: { product: group, items: [{}, {}, {}], i18n: {} } },
      { kind: "added", path: "columns[4]", after: { column: 4, groups: [{ product: group }] } },
    ]);
    expect(markup).toContain("Cột menu 4"); // the column NUMBER, not its position
    expect(markup).toContain("Nhóm menu · cột menu 2");
    expect(markup).toContain("3 mục");
    expect(markup).toContain("1 nhóm sản phẩm");
  });

  it("names the product in the path when the editor knows it, and shortens the id when it does not", () => {
    const changes: Change[] = [{ kind: "removed", path: `columns[2].groups[${group}]`, before: {} }];
    expect(render(changes, new Map([[group, "Tờ rơi"]]))).toContain("«Tờ rơi»");
    expect(render(changes)).toContain("#4f9729d5");
  });
});
