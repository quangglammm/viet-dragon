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
