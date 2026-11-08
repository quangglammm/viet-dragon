"use client";

import { setChildSlug, setOptionScope } from "@/lib/content/editor/product-ops";
import { suggestSlugs } from "@/lib/content/editor/slugs";
import { AliasList } from "../../alias-list";
import { IconField } from "../../icon-field";
import { MediaField } from "../../media-field";
import { MediaListField } from "../../media-list-field";
import { SlugField } from "../../slug-field";
import { NumberField, SelectField, SwitchField, TextField } from "../../fields";
import { BulletsEditor } from "./bullets-editor";
import { ChildNameField } from "./name-field";
import { scopeOptions, useProduct, WHOLE_PRODUCT } from "./use-product";

/** The inside of one option (one material offered by the product): what it is, its prices, its card, its photos, its URLs. */
export function OptionCard({ index }: Readonly<{ index: number }>) {
  const { editor, product, apply } = useProduct();
  const option = product.options[index];
  const at = `options[${index}]`;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <SelectField path={`${at}.material`} options="material" required />
        <SelectField
          path={`${at}.shape`}
          options={scopeOptions(product, editor.language)}
          nullable
          nullLabel={WHOLE_PRODUCT}
          hint="Chỉ hiển thị cho một hình thức, hoặc cho cả sản phẩm."
          onValue={(shape) => apply((current) => setOptionScope(current, option.uid, shape))}
        />
        <IconField path={`${at}.icon`} nullable />
        <SelectField path={`${at}.unit`} options="unit" nullable nullLabel="— Không có đơn vị —" />
        <SwitchField path={`${at}.hideFoil`} />
        <SwitchField path={`${at}.hideDoubleSided`} />
        <NumberField path={`${at}.position`} hint="Thứ tự (đổi bằng nút mũi tên)." />
      </div>

      <div>
        <p className="mb-2 text-xs font-black text-slate-700">Giá</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <NumberField path={`${at}.prices.base`} nullable suffix="đ" />
          <NumberField path={`${at}.prices.doubleSided`} nullable suffix="đ" />
          <NumberField path={`${at}.prices.foil`} nullable suffix="đ" />
          <NumberField path={`${at}.prices.foil2`} nullable suffix="đ" />
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-black text-slate-700">Nội dung thẻ</p>
        <div className="grid gap-4 md:grid-cols-2">
          <ChildNameField kind="options" uid={option.uid} path={`${at}.i18n.*.name`} />
          <TextField path={`${at}.i18n.*.cardTitle`} hint="Để trống thì thẻ dùng tên chất liệu." />
          <div className="md:col-span-2"><TextField path={`${at}.i18n.*.tagline`} /></div>
        </div>
      </div>

      <BulletsEditor optionIndex={index} />

      <div className="grid gap-4 md:grid-cols-2">
        <MediaListField path={`${at}.images.default`} />
        <MediaListField path={`${at}.images.pure`} hint="Ảnh nền trắng (nếu có)." />
      </div>

      <div className="space-y-3 rounded-2xl bg-slate-50 p-3">
        <SlugField
          path={`${at}.slugs.*.slug`}
          onSlug={(slug) => apply((current) => setChildSlug(current, "options", option.uid, editor.language, slug))}
          suggestion={suggestSlugs({ vi: option.i18n.vi?.name, en: option.i18n.en?.name })[editor.language]}
        />
        <AliasList path={`${at}.slugs.*.aliases`} onRelease={editor.releaseAlias} />
        <div className="grid gap-4 md:grid-cols-2">
          <TextField path={`${at}.i18n.*.seoTitle`} maxLength={70} />
          <MediaField path={`${at}.ogImage`} imageOnly />
          <div className="md:col-span-2"><TextField path={`${at}.i18n.*.seoDescription`} multiline maxLength={170} /></div>
        </div>
      </div>
    </>
  );
}
