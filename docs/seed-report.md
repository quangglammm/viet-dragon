# Báo cáo nhập dữ liệu gốc của website Việt Dragon

Ngày tạo: 2026-10-26. Báo cáo này được tạo tự động từ dữ liệu hiện có của website (sản phẩm, menu, bài viết, bản dịch…).

**Chưa có gì thay đổi trên website.** Đây là bản sao đưa vào cơ sở dữ liệu mới để quản trị viên chỉnh sửa về sau. Website vẫn đọc dữ liệu cũ cho đến khi bước chuyển đổi được thực hiện và kiểm tra xong.

**Thứ tự ưu tiên: tiếng Việt và English hoàn chỉnh trước, các ngôn ngữ còn lại sao chép từ English.** Phần 2 liệt kê 8 chỗ cần chủ shop quyết định cho tiếng Việt và English (quan trọng nhất là hệ thống đường dẫn theo từng ngôn ngữ). Mỗi mục đã có đề xuất; chỉ cần đánh dấu «Đồng ý» hoặc ghi cách khác. Phần 3 là tiếng Trung / Nhật / Hàn — chưa cần quyết định, chỉ cần biết. Phần 1 cho biết đã nhập những gì, phần 4 là ghi chú kỹ thuật.

## 1. Đã nhập những gì

| Mục | Số lượng |
| --- | --- |
| Danh mục | 4 |
| Sản phẩm (mỗi danh mục tính riêng) | 25 |
| Hình thức | 77 |
| Lựa chọn chất liệu của sản phẩm | 110 |
| Loại chất liệu (giấy…) dùng chung | 44 |
| Đặc điểm chất liệu (biểu tượng + mô tả) | 12 |
| Mục thông số (công nghệ in, hoàn thiện, chất liệu gợi ý) | 54 |
| Mức kích thước | 180 |
| Nhóm trong menu | 24 |
| Mục trong menu | 100 |
| Đơn vị tính | 5 |
| Sản phẩm in nhanh | 6 |
| Ảnh trưng bày | 5 |
| Bài viết blog | 6 |
| Khối văn bản giao diện (nhóm × ngôn ngữ) | 170 |
| Đường dẫn sản phẩm (5 ngôn ngữ, gồm cả đường dẫn cũ) | 413 |
| Đường dẫn hình thức / chất liệu (5 ngôn ngữ, gồm cả đường dẫn cũ) | 2.419 |
| Đường dẫn danh mục (5 ngôn ngữ, gồm cả đường dẫn cũ) | 28 |
| Đường dẫn bài viết (5 ngôn ngữ, gồm cả đường dẫn cũ) | 54 |
| Tệp ảnh và video đã đăng ký | 1.010 |
| Bản gốc lưu nguyên văn để đối chiếu | 41 |
| Phiên bản đã lưu (bản gốc + bản dịch đề xuất) | 215 |

### Mức đầy đủ theo ngôn ngữ

Số bản dịch đã có cho từng ngôn ngữ; «thiếu» là so với số bản tiếng Việt. Tiếng Việt và English phải đầy đủ trước. Tiếng Trung / Nhật / Hàn đã được bổ sung các chỗ còn trống bằng bản dịch đề xuất (phần 3). Chỗ nào còn thiếu sẽ hiện bản English (rồi tiếng Việt).

| Nội dung | Tiếng Việt | English | 中文 | 日本語 | 한국어 |
| --- | --- | --- | --- | --- | --- |
| Tiêu đề sản phẩm | 25 | 25 | 25 | 25 | 25 |
| Tên hình thức | 77 | 77 | 77 | 77 | 77 |
| Tên lựa chọn chất liệu | 110 | 110 | 110 | 110 | 110 |
| Tên loại chất liệu | 44 | 44 | 44 | 44 | 44 |
| Tên đặc điểm chất liệu | 12 | 12 | 12 | 12 | 12 |
| Mô tả đặc điểm chất liệu | 12 | 12 | 12 | 12 | 12 |
| Gạch đầu dòng mô tả / phù hợp cho | 628 | 628 | 628 | 628 | 628 |
| Tên danh mục | 4 | 4 | 4 | 4 | 4 |
| Bài viết | 6 | 6 | 6 | 6 | 6 |

## 2. Tiếng Việt và English — cần chủ shop quyết định

### Quyết định 1 — Hệ thống đường dẫn (URL) theo từng ngôn ngữ

**Hiện nay:** Mọi ngôn ngữ đang dùng chung một đường dẫn gốc tiếng Việt, chỉ khác phần đầu: `/products/marketing/to-roi`, `/en/products/marketing/to-roi`, `/zh/products/marketing/to-roi`… Các từ cố định (`products`, `blog`, `fast-print`) và tên danh mục cũng đều là tiếng Anh.

**Số liệu:**
- Đề xuất: **mỗi ngôn ngữ có đường dẫn riêng** — từ cố định, danh mục, sản phẩm, hình thức, chất liệu và bài viết. Chỉ dùng chữ Latin không dấu (a-z, 0-9, gạch nối) ở mọi ngôn ngữ, nên tiếng Trung / Nhật / Hàn dùng lại đường dẫn của English.
- Tiếng Việt vẫn là ngôn ngữ mặc định (không có tiền tố `/vi`); các ngôn ngữ khác có tiền tố (`/en`, `/zh`, `/ja`, `/ko`).

**Từ cố định** (áp dụng khi website chuyển sang đọc từ cơ sở dữ liệu):

| Trang | Tiếng Việt | English (中文 / 日本語 / 한국어 theo English) |
| --- | --- | --- |
| Sản phẩm | /san-pham | /products |
| In nhanh lấy liền | /san-pham/in-nhanh | /products/fast-print |
| Blog | /bai-viet | /blog |

**Danh mục:**

| Danh mục (mã nội bộ) | Tiếng Việt | English |
| --- | --- | --- |
| `marketing` | /tiep-thi | /marketing |
| `office` | /van-phong | /office |
| `packaging` | /bao-bi | /packaging |
| `tet` | /an-pham-tet | /tet-publications |

**25 sản phẩm** (đường dẫn đầy đủ):

| Đường dẫn hiện nay (mọi ngôn ngữ) | Tiếng Việt (mới) | English (mới) |
| --- | --- | --- |
| `/products/marketing/poster-bangron-standee` | `/san-pham/tiep-thi/poster-bangron-standee` | `/en/products/marketing/posters-banners-standees` |
| `/products/marketing/to-roi` | `/san-pham/tiep-thi/to-roi` | `/en/products/marketing/flyers-leaflets` |
| `/products/marketing/to-gap` | `/san-pham/tiep-thi/to-gap` | `/en/products/marketing/leaflets-brochures` |
| `/products/marketing/ve-tickets` | `/san-pham/tiep-thi/ve-tickets` | `/en/products/marketing/tickets-event-passes` |
| `/products/marketing/vong-tay-su-kien` | `/san-pham/tiep-thi/vong-tay-su-kien` | `/en/products/marketing/event-wristbands` |
| `/products/marketing/vouchers` | `/san-pham/tiep-thi/vouchers` | `/en/products/marketing/gift-vouchers-cards` |
| `/products/marketing/catalogues` | `/san-pham/tiep-thi/catalogues` | `/en/products/marketing/catalogues-booklets` |
| `/products/office/danh-thiep` | `/san-pham/van-phong/danh-thiep` | `/en/products/office/business-cards-namecards` |
| `/products/office/bao-thu` | `/san-pham/van-phong/bao-thu` | `/en/products/office/envelopes` |
| `/products/office/ao-thun` | `/san-pham/van-phong/ao-thun` | `/en/products/office/uniform-t-shirts` |
| `/products/office/giay-ghi-chu` | `/san-pham/van-phong/giay-ghi-chu` | `/en/products/office/block-notes-memo-pads` |
| `/products/office/giay-tieu-de` | `/san-pham/van-phong/giay-tieu-de` | `/en/products/office/letterheads` |
| `/products/office/bia-dung-ho-so` | `/san-pham/van-phong/bia-dung-ho-so` | `/en/products/office/folders-presentation-folders` |
| `/products/packaging/nhan-dan` | `/san-pham/bao-bi/nhan-dan` | `/en/products/packaging/decal-labels-stickers` |
| `/products/packaging/tui-giay` | `/san-pham/bao-bi/tui-giay` | `/en/products/packaging/paper-bags` |
| `/products/packaging/hop-giay` | `/san-pham/bao-bi/hop-giay` | `/en/products/packaging/paper-boxes-packaging` |
| `/products/packaging/mac-san-pham` | `/san-pham/bao-bi/mac-san-pham` | `/en/products/packaging/product-tags-hangtags` |
| `/products/tet/lich-tet` | `/san-pham/an-pham-tet/lich-tet` | `/en/products/tet-publications/desk-calendars` |
| `/products/tet/bao-li-xi` | `/san-pham/an-pham-tet/bao-li-xi` | `/en/products/tet-publications/red-envelopes-lucky-money` |
| `/products/tet/thiep-tet` | `/san-pham/an-pham-tet/thiep-tet` | `/en/products/tet-publications/invitation-cards` |
| `/products/tet/mac-san-pham` | `/san-pham/an-pham-tet/mac-san-pham` | `/en/products/tet-publications/product-tags-hangtags` |
| `/products/tet/vouchers` | `/san-pham/an-pham-tet/vouchers` | `/en/products/tet-publications/gift-vouchers` |
| `/products/tet/nhan-dan` | `/san-pham/an-pham-tet/nhan-dan` | `/en/products/tet-publications/decal-labels-stickers` |
| `/products/tet/to-roi` | `/san-pham/an-pham-tet/to-roi` | `/en/products/tet-publications/flyers-certificates` |
| `/products/tet/poster-bangron-standee` | `/san-pham/an-pham-tet/poster-bangron-standee` | `/en/products/tet-publications/posters-banners-standees` |

- Còn 77 hình thức, 110 lựa chọn chất liệu và 6 bài viết có đường dẫn riêng — danh sách đầy đủ ở Phụ lục A.
- Tiếng Anh do máy tạo từ tên tiếng Anh (ví dụ «Flyers & Leaflets» → `flyers-leaflets`); có thể chưa đẹp ở một vài chỗ — ghi cách sửa vào Phụ lục A.
- **Đường dẫn cũ vẫn mở được:** mọi đường dẫn đang chạy hiện nay sẽ tự chuyển hướng (mã 308) sang đường dẫn mới của đúng ngôn ngữ. Số đường dẫn cũ được giữ theo ngôn ngữ: vi: 280, en: 381, zh: 381, ja: 381, ko: 381.
- **Rủi ro cần biết:** tiếng Việt là ngôn ngữ chính và đã được Google lập chỉ mục; toàn bộ đường dẫn tiếng Việt sẽ đổi (ví dụ `/products/marketing/to-roi` → `/san-pham/tiep-thi/to-roi`). Chuyển hướng 308 giữ lại gần như toàn bộ giá trị tìm kiếm, nhưng thứ hạng có thể dao động vài tuần.

**Sau khi nhập:** Cơ sở dữ liệu đã có sẵn đường dẫn riêng cho từng ngôn ngữ (tiếng Việt giữ đường dẫn hiện nay; English tạo mới; tiếng Trung/Nhật/Hàn sao chép English) và giữ đường dẫn cũ làm đường dẫn chuyển hướng. Website chưa đổi gì.

**Đề xuất:** Đồng ý. Đổi **một lần duy nhất** khi đưa hệ thống mới vào chạy (không đổi từng phần), giữ chuyển hướng 308 lâu dài, và gửi sơ đồ trang (sitemap) mới cùng thẻ hreflang cho từng ngôn ngữ để Google hiểu các phiên bản tương ứng.

**Quyết định:** ☐ Đồng ý với đề xuất    ☐ Khác: ____________________

---

### Quyết định 2 — Kích thước và thông số in thay đổi theo ngôn ngữ và theo chất liệu

**Hiện nay:** Trang sản phẩm tự suy ra danh sách kích thước, công nghệ hoàn thiện và chất liệu gợi ý từ *tên* sản phẩm — mà tên lại đổi theo ngôn ngữ đang xem. Vì thế cùng một sản phẩm có thể hiện danh sách khác nhau tùy ngôn ngữ hoặc tùy chất liệu đang chọn.

**Số liệu:**
- Trong 4.045 lượt hiển thị thẻ chất liệu (trang × lựa chọn × ngôn ngữ), có 2.163 lượt (53%) cho kết quả khác danh sách duy nhất sẽ được lưu.
- Chia theo loại: kích thước khác 425 lượt, chất liệu gợi ý khác 1.942 lượt, hoàn thiện khác 117 lượt. (Nếu các lựa chọn trùng tên tiếng Việt chỉ tính một lần: 2.143 tổ hợp.)
- 11 sản phẩm/hình thức có kích thước đổi theo ngôn ngữ của tên; 5 danh sách thông số đổi theo ngôn ngữ.

**Sau khi nhập:** Mỗi sản phẩm và mỗi hình thức có **một** danh sách kích thước và một danh sách thông số, lấy theo tên tiếng Việt.

**Đề xuất:** Giữ như vậy. Nếu cần danh sách riêng cho từng chất liệu thì bổ sung sau, không phải làm lại dữ liệu.

**Quyết định:** ☐ Đồng ý với đề xuất    ☐ Khác: ____________________

---

### Quyết định 3 — Menu khác với danh mục sản phẩm

**Hiện nay:** Menu lớn không chỉ lấy tên và ảnh từ sản phẩm: nhiều mục có tên, ảnh hoặc nhãn «In nhanh» riêng.

**Số liệu:**
- 24 nhóm và 100 mục menu đã nhập.
- Tên riêng được lưu: 145 mục, 12 nhóm; mô tả riêng của nhóm (trang Tết): 4.
- Ảnh riêng: 19 mục, 1 nhóm; nhãn «In nhanh»: 15 mục.

**Sau khi nhập:** Chỉ những chỗ khác với sản phẩm mới được lưu riêng; phần còn lại tự lấy từ sản phẩm.

**Đề xuất:** Giữ nguyên lúc này; dọn dần những tên/ảnh riêng không cần thiết khi chỉnh menu.

**Quyết định:** ☐ Đồng ý với đề xuất    ☐ Khác: ____________________

---

### Quyết định 4 — Biểu tượng mà thẻ chất liệu hiện chưa vẽ được

**Hiện nay:** Dữ liệu dùng nhiều biểu tượng hơn số mà thẻ chất liệu biết vẽ; những lựa chọn còn lại hiện chỉ hiện một biểu tượng chung.

**Số liệu:**
- 16 biểu tượng được dùng, thẻ chỉ vẽ được 6; 10 biểu tượng không vẽ được, ảnh hưởng 29 trong 110 lựa chọn.
- Chưa vẽ được: Shield (10), Leaf (5), Square (3), Droplets (2), Eye (2), Shirt (2), SunMedium (2), Calendar (1), Tag (1), Zap (1).

**Sau khi nhập:** Tất cả biểu tượng đã có trong thư viện biểu tượng mới và được lưu theo tên; thẻ chất liệu sẽ vẽ đầy đủ khi website chuyển sang đọc từ cơ sở dữ liệu.

**Đề xuất:** Mở rộng thư viện biểu tượng (đã làm) thay vì chọn lại biểu tượng cho từng lựa chọn.

**Quyết định:** ☐ Đồng ý với đề xuất    ☐ Khác: ____________________

---

### Quyết định 5 — Hai lựa chọn có cùng đường dẫn

**Hiện nay:** Trong cùng một sản phẩm, có lựa chọn trùng đường dẫn nên chỉ một trong hai truy cập được.

**Số liệu:**
- 1 trường hợp.
  - tet/to-roi: giay-my-thuat-cao-cap-ep-kim → giay-my-thuat-cao-cap-ep-kim-2

**Sau khi nhập:** Lựa chọn thứ hai được thêm hậu tố «-2» để cả hai đều truy cập được.

**Đề xuất:** Đặt tên khác cho lựa chọn thứ hai (đường dẫn tự cập nhật, đường dẫn cũ vẫn hoạt động).

**Quyết định:** ☐ Đồng ý với đề xuất    ☐ Khác: ____________________

---

### Quyết định 6 — Đường dẫn «tự suy ra» giữa các danh mục sẽ không còn hoạt động

**Hiện nay:** Mã website hiện cố gắng đoán sản phẩm cho mọi tổ hợp danh mục + tên (ví dụ /products/office/lich-tet hiện ra sản phẩm của danh mục Tết). Không có liên kết nào trên website trỏ tới các đường dẫn đoán này.

**Số liệu:**
- Giữ lại các đường dẫn cũ/đường dẫn khác của sản phẩm trong đúng danh mục của nó (288 dòng cho cả 5 ngôn ngữ) và đường dẫn cũ của hình thức/chất liệu (1.484 dòng) — các liên kết hiện có (kể cả banner trang chủ) đều vẫn hoạt động ở mọi ngôn ngữ.
- Không nhập 147 đường dẫn đoán giữa các danh mục; chúng sẽ trả về «không tìm thấy».
  - /products/marketing/danh-thiep → office/danh-thiep
  - /products/marketing/bao-thu → office/bao-thu
  - /products/marketing/ao-thun → office/ao-thun
  - /products/marketing/giay-ghi-chu → office/giay-ghi-chu
  - … và 143 mục khác (xem Phụ lục)

**Sau khi nhập:** Các đường dẫn đoán này không còn hoạt động.

**Đề xuất:** Đồng ý. Chỉ cần giữ lại nếu bạn biết có website khác hoặc kết quả Google đang trỏ tới một đường dẫn trong danh sách (xem Phụ lục B).

**Quyết định:** ☐ Đồng ý với đề xuất    ☐ Khác: ____________________

---

### Quyết định 7 — Dữ liệu thừa: khóa dịch mồ côi, tệp tạm, ảnh không dùng

**Hiện nay:** Trong mã và thư mục ảnh còn sót những thứ không được trang nào dùng.

**Số liệu:**
- 95 khóa dịch không khớp sản phẩm/hình thức nào (ITEM_NAMES: 32/52; ITEM_DESCS: 31/51; SHAPE_DESCS: 32/103) — không được nhập.
- 3 tệp tạm/sao lưu không được đăng ký:
  - images/hero-landing-plane.prev.webp
  - images/hero-landing-plane.webp.bak
  - images/test-new-purple.png
- 606 trong 1.010 tệp ảnh/video đã đăng ký mà không sản phẩm, menu, bài viết hay đoạn mã nào nhắc tới đường dẫn — vẫn được giữ lại. (Tệp có thể vẫn được dùng nếu mã ghép tên động; vì vậy đây chỉ là danh sách để xem xét, đừng xóa hàng loạt.)

**Sau khi nhập:** Khóa dịch mồ côi và tệp tạm bị bỏ; ảnh không dùng vẫn được giữ và đăng ký để quản trị viên xem.

**Đề xuất:** Đồng ý. Việc xóa ảnh không dùng làm sau, trong trang quản lý ảnh, khi đã chắc chắn.

**Quyết định:** ☐ Đồng ý với đề xuất    ☐ Khác: ____________________

---

### Quyết định 8 — Giá, công tắc «ép kim / hai mặt» và huy hiệu: có hiển thị trên website không?

**Hiện nay:** Mã website có chỗ cho giá, công tắc ẩn ép kim/in hai mặt và huy hiệu của hình thức, nhưng không trang nào hiển thị chúng.

**Số liệu:**
- Lựa chọn có nhập giá: 0/110; có công tắc ẩn ép kim/hai mặt: 32/110.
- Hình thức có huy hiệu: 77.

**Sau khi nhập:** Các trường này được giữ trong cơ sở dữ liệu (huy hiệu theo từng ngôn ngữ) nhưng website chưa hiển thị.

**Đề xuất:** Giữ nguyên. Nếu muốn website hiển thị giá hoặc huy hiệu, báo để làm trong giai đoạn đọc dữ liệu từ cơ sở dữ liệu.

**Quyết định:** ☐ Đồng ý với đề xuất    ☐ Khác: ____________________

## 3. Tiếng Trung, tiếng Nhật, tiếng Hàn — theo English, dịch sau

**Không cần chủ shop quyết định các mục này bây giờ.** Tiếng Việt và English phải hoàn chỉnh và được duyệt trước (phần 2); ba ngôn ngữ còn lại được dựng từ English để mọi trang đều có đủ nội dung và đường dẫn.

- **Đường dẫn:** sao chép từ English (chữ Latin không dấu, giống ở mọi ngôn ngữ); biên tập viên có thể sửa sau.
- **Văn bản đã có** trong dữ liệu hiện nay (tên sản phẩm, mô tả, chất liệu…): giữ nguyên, không đổi.
- **Văn bản chưa có:** 72 đoạn trong từ điển đặc điểm chất liệu (12 đặc điểm × tên + mô tả × 3 ngôn ngữ) và 27 dòng «phù hợp cho» — đã được **dịch đề xuất bằng AI** (Phụ lục D). Các bản dịch này chưa qua người đọc bản ngữ nên được đánh dấu ở khắp nơi: lưu thành phiên bản số 2 của từng mục (kèm ghi chú «Bản dịch đề xuất (AI) — cần người bản ngữ duyệt»), bản gốc là phiên bản 1.
- Sau khi bổ sung, mức đầy đủ của tiếng Trung / Nhật / Hàn đạt 100% như tiếng Việt và English (bảng ở phần 1).

### Cùng một loại giấy nhưng tên dịch khác nhau giữa các sản phẩm

Một loại giấy dùng chung ở nhiều sản phẩm đang được dịch bằng những cách gọi khác nhau (chủ yếu tiếng Trung / Nhật / Hàn).

**Số liệu:**
- 19 cặp (loại giấy × ngôn ngữ) bị lệch.
  - Giấy loại C [zh] → C类纸 | 铜版卡纸 300-350gsm 覆膜彩盒
  - Giấy loại C [ja] → Cタイプ用紙 | コートボール紙 300-350gsm PP加工化粧箱
  - Giấy loại C [ko] → 스노우지 150gsm (대량 배포용 표준 전단지) | C타입 용지 | 스노우지 C300 (표준형) | 스노우지 150-200gsm 컬러 코팅 봉투 | 스노우지 300-350gsm (표준 홀더) | 스노우지 250-300gsm 코팅 쇼핑백 | 스노우지 300-350gsm 코팅 패키지 상자 …
  - Giấy loại F [en] → Type F Paper | Type F Paper (Uncoated Type F Paper) | Type F Paper (Type F Paper)
  - … và 15 mục khác (xem Phụ lục)

**Tiếp theo:** Tên được dùng nhiều nhất trở thành tên chung của loại giấy; tên riêng của từng sản phẩm vẫn được giữ làm tiêu đề thẻ nên website hiển thị y như cũ. Người dịch bản ngữ thống nhất sau (Phụ lục C).

### Sản phẩm ở hai danh mục dùng chung một bản dịch; tiêu đề có hai nguồn

Một số sản phẩm có ở cả danh mục thường và danh mục Tết nhưng chỉ có một bản dịch tiếng Trung/Nhật/Hàn cho cả hai; tiêu đề zh/ja/ko còn có hai nơi lưu với thứ tự ưu tiên khác nhau giữa các trang.

**Số liệu:**
- 5 sản phẩm nằm ở nhiều danh mục: poster-bangron-standee (marketing, tet); to-roi (marketing, tet); vouchers (marketing, tet); nhan-dan (packaging, tet); mac-san-pham (packaging, tet).
- 43 trường hợp (sản phẩm × ngôn ngữ) có tiêu đề ở hai nơi khác nhau.

**Tiếp theo:** Hai bản dùng chung bản dịch hiện có; khi tiêu đề có hai nguồn, nguồn nằm trong chính sản phẩm được ưu tiên. Viết nội dung riêng cho phiên bản Tết khi có người dịch.

### Cùng một cụm tiếng Việt nhưng bản dịch tiếng Nhật/Hàn khác nhau

Một số cụm thông số tiếng Việt giống hệt nhau ở các danh sách khác nhau nhưng được dịch khác nhau sang tiếng Nhật hoặc tiếng Hàn.

**Số liệu:**
- 3 cụm.
  - hoàn thiện: Cán màng mờ
  - chất liệu gợi ý: Giấy Kraft
  - chất liệu gợi ý: Giấy Mỹ thuật

**Tiếp theo:** Mỗi bản dịch là một mục thông số riêng, nên website hiển thị y như cũ. Gộp thành một bản dịch khi có người dịch bản ngữ.

### Gạch đầu dòng «phù hợp cho» tiếng Trung/Nhật/Hàn chỉ có một dòng tóm tắt

Ba lựa chọn của sản phẩm Tờ rơi Tết có ba gạch đầu dòng «phù hợp cho» ở tiếng Việt và tiếng Anh, nhưng tiếng Trung / Nhật / Hàn chỉ có một dòng gộp cả ba ý.

**Số liệu:**
- 3 danh sách bị lệch số dòng giữa các ngôn ngữ.
  - tet/to-roi Giấy loại C 250-300gsm (phù hợp cho): vi=3 en=3 zh=1 ja=1 ko=1
  - tet/to-roi Giấy loại F 200-250gsm (phù hợp cho): vi=3 en=3 zh=1 ja=1 ko=1
  - tet/to-roi Giấy Mỹ Thuật Cao Cấp Ép Kim (phù hợp cho): vi=3 en=3 zh=1 ja=1 ko=1

**Tiếp theo:** Dòng tóm tắt được thay bằng ba dòng dịch sát nghĩa (27 đoạn, Phụ lục D). Dòng tóm tắt gốc nằm trong phiên bản 1 và trong bản lưu gốc, khôi phục được bất cứ lúc nào.

### Bản dịch đề xuất bằng AI

Các bản dịch trong Phụ lục D dùng tạm cho đến khi có người bản ngữ duyệt (có thể sửa ngay trong trang quản trị).

**Quyết định:** ☐ Dùng tạm các bản dịch đề xuất    ☐ Không dùng (hiện bản English)    ☐ Đã có người bản ngữ duyệt: ____________________

## 4. Ghi chú kỹ thuật (không cần quyết định)

- Cách diễn đạt giá «In nhanh» (chữ «Chỉ từ», «From», «〜»…) không phải dữ liệu, sẽ chuyển vào bản dịch giao diện:
  - vi: Chỉ từ {price}
  - en: From {price}
  - zh: 低至 {price}
  - ja: {price}〜
  - ko: 최저 {price}

### Ghi chú khác

- **Số biểu tượng đặc điểm không khớp số gạch đầu dòng mô tả (biểu tượng thừa hoặc thiếu)** — 7:
  - marketing/poster-bangron-standee Băng rôn Hiflex (đặc điểm)
  - marketing/poster-bangron-standee Decal Lưới (đặc điểm)
  - tet/mac-san-pham Giấy Couche 300gsm Cán Màng Mờ (đặc điểm)
  - tet/to-roi Giấy Couche 150gsm (Lấy Nhanh) (đặc điểm)
  - tet/to-roi Giấy Couche 300gsm Cán Màng Mờ (đặc điểm)
  - … và 2 mục khác (xem Phụ lục)

## Phụ lục — danh sách đầy đủ

### Phụ lục A — đường dẫn mới của hình thức, lựa chọn chất liệu và bài viết (quyết định 1)

Đường dẫn tiếng Trung / Nhật / Hàn giống English. Ghi cách sửa bên cạnh dòng nào chưa vừa ý.

**Hình thức** (77):

| Sản phẩm | Tiếng Việt | English |
| --- | --- | --- |
| marketing/poster-bangron-standee | `decal-kho-lon` | `large-format-vinyl-decals` |
| marketing/poster-bangron-standee | `pp-boi-format` | `pp-mounted-on-foam-board` |
| marketing/poster-bangron-standee | `hashtag-cam-tay` | `handheld-event-hashtags` |
| marketing/poster-bangron-standee | `hashtag-tay-cam-roi` | `detachable-handle-hashtags` |
| marketing/poster-bangron-standee | `bang-treo` | `hanging-boards-wobblers` |
| marketing/poster-bangron-standee | `tranh-canvas` | `high-quality-canvas-prints` |
| marketing/to-roi | `to-roi-gia-re` | `budget-promotion-flyers` |
| marketing/to-roi | `to-roi-so-luong-it` | `short-run-digital-flyers` |
| marketing/to-roi | `to-roi-so-luong-lon` | `bulk-offset-flyers` |
| marketing/to-roi | `to-roi-cao-cap` | `premium-luxury-flyers` |
| marketing/to-gap | `to-gap-so-luong-it` | `short-run-folded-brochures` |
| marketing/to-gap | `to-gap-ba` | `tri-fold-brochures` |
| marketing/to-gap | `to-gap-doi-a4` | `bi-fold-a4-leaflets` |
| marketing/to-gap | `to-gap-cao-cap` | `premium-luxury-brochures` |
| marketing/ve-tickets | `ve-moi-su-kien` | `event-invitation-passes` |
| marketing/ve-tickets | `vong-tay-su-kien` | `event-wristbands` |
| marketing/vouchers | `phieu-qua-tang-pho-thong` | `standard-gift-vouchers` |
| marketing/vouchers | `gift-vouchers` | `luxury-gift-vouchers` |
| marketing/vouchers | `the-tich-diem` | `loyalty-stamp-cards` |
| marketing/vouchers | `the-cao-khuyen-mai` | `scratch-off-promo-cards` |
| marketing/catalogues | `catalogue-tieu-chuan` | `standard-product-catalogues` |
| marketing/catalogues | `catalogue-gia-re` | `economy-budget-catalogues` |
| marketing/catalogues | `catalogue-cao-cap` | `premium-luxury-catalogues` |
| marketing/catalogues | `profile-company` | `company-profile-booklets` |
| marketing/catalogues | `cam-nang-cam-tay` | `pocket-handbooks-guides` |
| office/danh-thiep | `danh-thiep-chuan` | `standard-business-cards` |
| office/danh-thiep | `bo-goc-chuan` | `standard-rounded-corner-cards` |
| office/danh-thiep | `highlight` | `spot-uv-highlight-cards` |
| office/danh-thiep | `vuong-bo-goc` | `square-rounded-corner-cards` |
| office/danh-thiep | `vuong` | `square-business-cards` |
| office/danh-thiep | `gap-doi` | `folded-business-cards` |
| office/danh-thiep | `dap-noi-chim` | `embossed-debossed-cards` |
| office/danh-thiep | `ky-thuat-so` | `digital-express-business-cards` |
| office/danh-thiep | `thong-minh` | `smart-nfc-business-cards` |
| office/bao-thu | `bao-thu-lay-ngay` | `express-fast-envelopes` |
| office/bao-thu | `bao-thu-nho` | `small-envelopes-12x22cm` |
| office/bao-thu | `bao-thu-trung` | `medium-envelopes-16x23cm` |
| office/bao-thu | `bao-thu-lon` | `large-envelopes-25x35cm` |
| office/bao-thu | `bao-thu-cua-so` | `clear-window-envelopes` |
| office/ao-thun | `ao-thun-co-tru` | `polo-collar-uniform-shirts` |
| office/ao-thun | `ao-thun-co-tron` | `round-neck-uniform-t-shirts` |
| office/giay-ghi-chu | `giay-ghi-chu-block` | `desk-memo-block-notes` |
| office/giay-tieu-de | `giay-tieu-de-it` | `short-run-digital-letterheads` |
| office/giay-tieu-de | `giay-tieu-de-lon` | `bulk-offset-letterheads` |
| office/bia-dung-ho-so | `bia-ho-so-cao-cap` | `premium-luxury-folders` |
| office/bia-dung-ho-so | `bia-ho-so-1-tay-gap` | `1-pocket-presentation-folders` |
| office/bia-dung-ho-so | `bia-ho-so-2-tay-gap` | `2-pocket-presentation-folders` |
| packaging/nhan-dan | `sticker-sheets` | `kiss-cut-sticker-sheets` |
| packaging/nhan-dan | `decal-uv-dtf` | `3d-raised-uv-dtf-decals` |
| packaging/nhan-dan | `decal-tem-be` | `destructible-tamper-warranty-seals` |
| packaging/tui-giay | `tui-giay-chuan` | `standard-paper-shopping-bags` |
| packaging/tui-giay | `tui-giay-quai-hot-xoai` | `die-cut-handle-bags` |
| packaging/tui-giay | `tui-giay-co-nap` | `flap-closure-paper-bags` |
| packaging/tui-giay | `tui-giay-ep-kim` | `foil-stamped-luxury-bags` |
| packaging/tui-giay | `tui-giay-banh-mi` | `bread-bakery-bags` |
| packaging/tui-giay | `tui-giay-co-san` | `in-stock-ready-made-bags` |
| packaging/hop-giay | `hop-giay-thong-dung` | `standard-folding-cartons` |
| packaging/mac-san-pham | `mac-pho-thong` | `standard-hangtags` |
| packaging/mac-san-pham | `mac-cao-cap` | `premium-luxury-hangtags` |
| packaging/mac-san-pham | `tag-thoi-trang` | `fashion-apparel-tags` |
| packaging/mac-san-pham | `tag-trang-suc` | `jewelry-accessory-tags` |
| packaging/mac-san-pham | `tag-cam-on` | `thank-you-gift-tags` |
| tet/lich-tet | `lich-de-ban` | `desk-calendars` |
| tet/lich-tet | `lich-ban-2026` | `desk-calendars-2026` |
| tet/lich-tet | `lich-nam-cham` | `flexible-magnetic-photo-calendars` |
| tet/bao-li-xi | `bao-li-xi-chuan` | `standard-red-envelopes` |
| tet/bao-li-xi | `bao-li-xi-2026` | `year-of-the-horse-2026-packets` |
| tet/bao-li-xi | `bao-li-xi-ep-kim` | `foil-stamped-luxury-packets` |
| tet/thiep-tet | `thiep-su-kien` | `event-gala-invitations` |
| tet/mac-san-pham | `tag-san-pham` | `product-tags` |
| tet/mac-san-pham | `tag-cam-on` | `thank-you-gift-tags` |
| tet/vouchers | `phieu-qua-tang-pho-thong` | `standard-gift-vouchers` |
| tet/to-roi | `to-roi-so-luong-it` | `short-run-digital-flyers` |
| tet/to-roi | `bang-khen` | `certificates-of-merit-awards` |
| tet/to-roi | `vong-tay-su-kien` | `event-wristbands` |
| tet/poster-bangron-standee | `hashtag-cam-tay` | `handheld-event-hashtags` |
| tet/poster-bangron-standee | `hashtag-tay-cam-roi` | `detachable-handle-hashtags` |

**Lựa chọn chất liệu** (110):

| Sản phẩm | Tiếng Việt | English |
| --- | --- | --- |
| marketing/poster-bangron-standee | `poster-chat-lieu-pp` | `pp-film-polypropylene` |
| marketing/poster-bangron-standee | `bang-ron-hiflex` | `hiflex-pvc-banner` |
| marketing/poster-bangron-standee | `decal-luoi` | `one-way-perforated-vinyl` |
| marketing/poster-bangron-standee | `backlit-film` | `backlit-lightbox-film` |
| marketing/to-roi | `giay-loai-c` | `type-c-paper` |
| marketing/to-roi | `giay-loai-f` | `type-f-paper` |
| marketing/to-roi | `giay-kraft-co-dien-than-thien` | `kraft-paper-vintage-eco-friendly` |
| marketing/to-roi | `giay-my-thuat-sang-trong-dang-cap` | `art-paper-premium-textured` |
| marketing/to-roi | `nhua-chong-nuoc-sieu-ben-khong-rach` | `waterproof-plastic-tear-resistant` |
| marketing/to-gap | `giay-loai-c` | `type-c-paper` |
| marketing/to-gap | `giay-my-thuat` | `art-paper-premium-textured` |
| marketing/to-gap | `giay-loai-i` | `type-i-paper` |
| marketing/to-gap | `giay-kraft` | `kraft-paper-vintage-eco-friendly` |
| marketing/ve-tickets | `giay-loai-c` | `type-c-paper` |
| marketing/ve-tickets | `giay-loai-f` | `type-f-paper-uncoated-ford` |
| marketing/ve-tickets | `nhua-pvc` | `pvc-plastic-waterproof-tear-proof` |
| marketing/ve-tickets | `nhua-dai` | `tyvek-synthetic-plastic` |
| marketing/ve-tickets | `vai` | `woven-satin-fabric` |
| marketing/ve-tickets | `silicone` | `silicone-rubber` |
| marketing/vong-tay-su-kien | `nhua-dai` | `tyvek-synthetic-plastic` |
| marketing/vong-tay-su-kien | `vai` | `woven-satin-fabric` |
| marketing/vong-tay-su-kien | `silicone` | `silicone-rubber` |
| marketing/vouchers | `giay-loai-c` | `type-c-paper` |
| marketing/vouchers | `giay-loai-i` | `type-i-paper` |
| marketing/vouchers | `giay-my-thuat` | `fine-art-paper` |
| marketing/vouchers | `giay-kraft` | `kraft-paper` |
| marketing/vouchers | `nhua-cung-pvc` | `rigid-pvc-plastic` |
| marketing/catalogues | `giay-loai-c` | `type-c-paper` |
| marketing/catalogues | `giay-loai-i` | `type-i-paper` |
| marketing/catalogues | `giay-my-thuat` | `fine-art-paper` |
| marketing/catalogues | `giay-loai-f` | `type-f-paper` |
| office/danh-thiep | `giay-loai-c` | `type-c-paper` |
| office/danh-thiep | `giay-loai-f` | `type-f-paper` |
| office/danh-thiep | `giay-my-thuat` | `luxury-art-paper` |
| office/danh-thiep | `giay-nhua-sieu-ben` | `waterproof-synthetic-plastic-card` |
| office/bao-thu | `giay-loai-f` | `type-f-paper` |
| office/bao-thu | `giay-loai-c` | `type-c-paper` |
| office/bao-thu | `giay-my-thuat-cao-cap-econowhite-modigliani` | `luxury-art-paper-econowhite-modigliani` |
| office/bao-thu | `giay-kraft-tu-nhien-eco-rustic` | `natural-kraft-paper-180-250gsm` |
| office/ao-thun | `vai-cotton` | `cotton-fabric` |
| office/ao-thun | `vai-ca-sau` | `pique-fabric-lacoste` |
| office/ao-thun | `vai-thun-lanh` | `cool-spandex-fabric` |
| office/giay-ghi-chu | `giay-loai-f` | `type-f-paper-ford` |
| office/giay-ghi-chu | `giay-my-thuat` | `fine-art-paper` |
| office/giay-ghi-chu | `giay-kraft` | `kraft-paper` |
| office/giay-ghi-chu | `nhua-pet` | `pet-plastic-film` |
| office/giay-tieu-de | `giay-loai-f` | `type-f-paper-ford` |
| office/giay-tieu-de | `giay-my-thuat` | `fine-art-paper` |
| office/giay-tieu-de | `giay-kraft` | `kraft-paper` |
| office/bia-dung-ho-so | `giay-loai-c` | `type-c-paper` |
| office/bia-dung-ho-so | `giay-loai-f` | `type-f-paper` |
| office/bia-dung-ho-so | `giay-my-thuat-cao-cap` | `luxury-art-paper` |
| packaging/nhan-dan | `nhan-decal-giay` | `paper-decal-labels` |
| packaging/nhan-dan | `nhan-decal-nhua` | `plastic-pvc-decal-labels` |
| packaging/nhan-dan | `nhan-decal-giay-kraft` | `kraft-paper-decal-labels` |
| packaging/nhan-dan | `nhan-decal-giay-my-thuat` | `fine-art-paper-decal-labels` |
| packaging/nhan-dan | `nhan-decal-xi-bac-vang` | `metallic-silver-gold-decals` |
| packaging/tui-giay | `giay-loai-c` | `type-c-paper` |
| packaging/tui-giay | `giay-loai-i` | `type-i-paper` |
| packaging/tui-giay | `giay-my-thuat-nham-cao-cap` | `luxury-textured-art-paper-bag` |
| packaging/tui-giay | `tui-giay-kraft` | `natural-eco-kraft-paper` |
| packaging/hop-giay | `giay-loai-c` | `type-c-paper` |
| packaging/hop-giay | `giay-loai-i` | `type-i-paper` |
| packaging/hop-giay | `hop-giay-carton` | `corrugated-carton-box` |
| packaging/hop-giay | `hop-giay-kraft` | `natural-kraft-250-350gsm-eco-box` |
| packaging/mac-san-pham | `giay-loai-c` | `type-c-paper` |
| packaging/mac-san-pham | `giay-loai-f` | `type-f-paper` |
| packaging/mac-san-pham | `giay-loai-i` | `type-i-paper` |
| packaging/mac-san-pham | `mac-giay-my-thuat-nham-cao-cap` | `luxury-art-paper-hang-tag` |
| tet/lich-tet | `lich-de-ban-giay-ford-de-ghi-chu` | `ford-230-250gsm-writable-tet-calendar` |
| tet/lich-tet | `lich-giay-my-thuat-cao-cap` | `luxury-art-paper-calendar` |
| tet/lich-tet | `giay-couche-250gsm-de-boi-simili-linen` | `couche-250gsm-rigid-simili-base` |
| tet/bao-li-xi | `giay-loai-c` | `type-c-paper` |
| tet/bao-li-xi | `giay-loai-f` | `type-f-paper` |
| tet/bao-li-xi | `giay-my-thuat-do-van-nham-sang-trong` | `luxury-red-textured-art-paper` |
| tet/bao-li-xi | `kraft-150gsm-li-xi-co-dien-than-thien` | `kraft-150gsm-vintage-eco-red-envelope` |
| tet/thiep-tet | `giay-loai-c` | `type-c-paper` |
| tet/thiep-tet | `giay-loai-f` | `type-f-paper` |
| tet/thiep-tet | `giay-my-thuat-van-nham-sang-trong` | `luxury-textured-art-paper-greeting-card` |
| tet/mac-san-pham | `giay-couche-300gsm-can-mang-mo` | `couche-300gsm-matte-laminated` |
| tet/mac-san-pham | `giay-kraft-nau-vintage-300gsm` | `natural-kraft-paper-300gsm` |
| tet/mac-san-pham | `giay-my-thuat-do-anh-kim-ep-kim` | `premium-art-red-foil-stamped` |
| tet/vouchers | `giay-loai-c` | `type-c-paper` |
| tet/vouchers | `giay-loai-i` | `type-i-paper` |
| tet/vouchers | `giay-my-thuat` | `fine-art-paper` |
| tet/vouchers | `giay-kraft` | `kraft-paper` |
| tet/vouchers | `nhua-cung-pvc` | `rigid-pvc-plastic` |
| tet/nhan-dan | `nhan-decal-giay` | `paper-decal-labels` |
| tet/nhan-dan | `nhan-decal-nhua` | `plastic-pvc-decal-labels` |
| tet/nhan-dan | `nhan-decal-giay-kraft` | `kraft-paper-decal-labels` |
| tet/nhan-dan | `nhan-decal-giay-my-thuat` | `fine-art-paper-decal-labels` |
| tet/nhan-dan | `nhan-decal-xi-bac-vang` | `metallic-silver-gold-decals` |
| tet/to-roi | `giay-loai-c` | `type-c-paper` |
| tet/to-roi | `giay-loai-f` | `type-f-paper` |
| tet/to-roi | `giay-kraft-co-dien-than-thien` | `kraft-paper-vintage-eco-friendly` |
| tet/to-roi | `giay-my-thuat-sang-trong-dang-cap` | `art-paper-premium-textured` |
| tet/to-roi | `nhua-chong-nuoc-sieu-ben-khong-rach` | `waterproof-plastic-tear-resistant` |
| tet/to-roi | `giay-couche-150gsm-lay-nhanh` | `couche-150gsm-fast-print` |
| tet/to-roi | `giay-couche-300gsm-can-mang-mo` | `couche-300gsm-matte-laminated` |
| tet/to-roi | `giay-my-thuat-cao-cap-ep-kim` | `fine-art-paper-with-gold-foil` |
| tet/to-roi | `giay-loai-c-250-300gsm` | `type-c-paper-250-300gsm` |
| tet/to-roi | `giay-loai-f-200-250gsm` | `type-f-paper-200-250gsm` |
| tet/to-roi | `giay-my-thuat-cao-cap-ep-kim-2` | `premium-art-paper-with-foil` |
| tet/to-roi | `nhua-dai` | `tyvek-synthetic-plastic` |
| tet/to-roi | `vai` | `woven-satin-fabric` |
| tet/to-roi | `silicone` | `silicone-rubber` |
| tet/poster-bangron-standee | `poster-chat-lieu-pp` | `pp-film-polypropylene` |
| tet/poster-bangron-standee | `bang-ron-hiflex` | `hiflex-pvc-banner` |
| tet/poster-bangron-standee | `decal-luoi` | `one-way-perforated-vinyl` |
| tet/poster-bangron-standee | `backlit-film` | `backlit-lightbox-film` |

**Bài viết** (6):

| Hiện nay (tiếng Việt) | Tiếng Việt (mới) | English (mới) |
| --- | --- | --- |
| `/blog/may-in-uv-the-he-moi` | `/bai-viet/may-in-uv-the-he-moi` | `/en/blog/new-generation-uv-printer-investment-quality-upgrade` |
| `/blog/bo-nhan-dien-thuong-hieu-startup` | `/bai-viet/bo-nhan-dien-thuong-hieu-startup` | `/en/blog/complete-brand-identity-for-a-tech-startup` |
| `/blog/5-loi-thuong-gap-khi-chuan-bi-file-in` | `/bai-viet/5-loi-thuong-gap-khi-chuan-bi-file-in` | `/en/blog/5-common-mistakes-when-preparing-print-files` |
| `/blog/bao-bi-fnb-local-brand` | `/bai-viet/bao-bi-fnb-local-brand` | `/en/blog/packaging-project-for-a-local-f-b-brand` |
| `/blog/viet-dragon-mo-rong-binh-duong` | `/bai-viet/viet-dragon-mo-rong-binh-duong` | `/en/blog/viet-dragon-opens-new-facility-in-binh-duong` |
| `/blog/chon-chat-lieu-in-phu-hop` | `/bai-viet/chon-chat-lieu-in-phu-hop` | `/en/blog/choosing-the-right-print-material-for-each-product` |

### Phụ lục B — dữ liệu thừa (quyết định 6 và 7)

### Đường dẫn đoán giữa các danh mục không còn hoạt động (147)

- /products/marketing/danh-thiep → office/danh-thiep
- /products/marketing/bao-thu → office/bao-thu
- /products/marketing/ao-thun → office/ao-thun
- /products/marketing/giay-ghi-chu → office/giay-ghi-chu
- /products/marketing/giay-tieu-de → office/giay-tieu-de
- /products/marketing/bia-dung-ho-so → office/bia-dung-ho-so
- /products/marketing/nhan-dan → packaging/nhan-dan
- /products/marketing/tui-giay → packaging/tui-giay
- /products/marketing/hop-giay → packaging/hop-giay
- /products/marketing/mac-san-pham → packaging/mac-san-pham
- /products/marketing/lich-tet → tet/lich-tet
- /products/marketing/bao-li-xi → tet/bao-li-xi
- /products/marketing/thiep-tet → tet/thiep-tet
- /products/marketing/namecards → office/danh-thiep
- /products/marketing/card → office/danh-thiep
- /products/marketing/envelopes → office/bao-thu
- /products/marketing/envelope → office/bao-thu
- /products/marketing/tshirts → office/ao-thun
- /products/marketing/notes → office/giay-ghi-chu
- /products/marketing/notepad → office/giay-ghi-chu
- /products/marketing/letterheads → office/giay-tieu-de
- /products/marketing/letterhead → office/giay-tieu-de
- /products/marketing/folders → office/bia-dung-ho-so
- /products/marketing/folder → office/bia-dung-ho-so
- /products/marketing/labels → packaging/nhan-dan
- /products/marketing/decal → packaging/nhan-dan
- /products/marketing/bags → packaging/tui-giay
- /products/marketing/paper-bag → packaging/tui-giay
- /products/marketing/boxes → packaging/hop-giay
- /products/marketing/paper-box → packaging/hop-giay
- /products/marketing/tags → packaging/mac-san-pham
- /products/marketing/tag → packaging/mac-san-pham
- /products/marketing/calendars → tet/lich-tet
- /products/marketing/calendar → tet/lich-tet
- /products/marketing/lixi → tet/bao-li-xi
- /products/marketing/li-xi → tet/bao-li-xi
- /products/marketing/invitations → tet/thiep-tet
- /products/marketing/thiep-moi → tet/thiep-tet
- /products/marketing/thiep-chuc-mung → tet/thiep-tet
- /products/office/poster-bangron-standee → marketing/poster-bangron-standee
- /products/office/to-roi → marketing/to-roi
- /products/office/to-gap → marketing/to-gap
- /products/office/ve-tickets → marketing/ve-tickets
- /products/office/vong-tay-su-kien → marketing/vong-tay-su-kien
- /products/office/vouchers → marketing/vouchers
- /products/office/catalogues → marketing/catalogues
- /products/office/nhan-dan → packaging/nhan-dan
- /products/office/tui-giay → packaging/tui-giay
- /products/office/hop-giay → packaging/hop-giay
- /products/office/mac-san-pham → packaging/mac-san-pham
- /products/office/lich-tet → tet/lich-tet
- /products/office/bao-li-xi → tet/bao-li-xi
- /products/office/thiep-tet → tet/thiep-tet
- /products/office/posters-standee → marketing/poster-bangron-standee
- /products/office/poster-bang-ron-standee → marketing/poster-bangron-standee
- /products/office/flyers → marketing/to-roi
- /products/office/leaflets-brochures → marketing/to-gap
- /products/office/tickets → marketing/ve-tickets
- /products/office/labels → packaging/nhan-dan
- /products/office/decal → packaging/nhan-dan
- /products/office/bags → packaging/tui-giay
- /products/office/paper-bag → packaging/tui-giay
- /products/office/boxes → packaging/hop-giay
- /products/office/paper-box → packaging/hop-giay
- /products/office/tags → packaging/mac-san-pham
- /products/office/tag → packaging/mac-san-pham
- /products/office/calendars → tet/lich-tet
- /products/office/calendar → tet/lich-tet
- /products/office/lixi → tet/bao-li-xi
- /products/office/li-xi → tet/bao-li-xi
- /products/office/invitations → tet/thiep-tet
- /products/office/thiep-moi → tet/thiep-tet
- /products/office/catalogue → marketing/catalogues
- /products/office/catalogue-camnang → marketing/catalogues
- /products/office/thiep-chuc-mung → tet/thiep-tet
- /products/packaging/poster-bangron-standee → marketing/poster-bangron-standee
- /products/packaging/to-roi → marketing/to-roi
- /products/packaging/to-gap → marketing/to-gap
- /products/packaging/ve-tickets → marketing/ve-tickets
- /products/packaging/vong-tay-su-kien → marketing/vong-tay-su-kien
- /products/packaging/vouchers → marketing/vouchers
- /products/packaging/catalogues → marketing/catalogues
- /products/packaging/danh-thiep → office/danh-thiep
- /products/packaging/bao-thu → office/bao-thu
- /products/packaging/ao-thun → office/ao-thun
- /products/packaging/giay-ghi-chu → office/giay-ghi-chu
- /products/packaging/giay-tieu-de → office/giay-tieu-de
- /products/packaging/bia-dung-ho-so → office/bia-dung-ho-so
- /products/packaging/lich-tet → tet/lich-tet
- /products/packaging/bao-li-xi → tet/bao-li-xi
- /products/packaging/thiep-tet → tet/thiep-tet
- /products/packaging/posters-standee → marketing/poster-bangron-standee
- /products/packaging/poster-bang-ron-standee → marketing/poster-bangron-standee
- /products/packaging/flyers → marketing/to-roi
- /products/packaging/leaflets-brochures → marketing/to-gap
- /products/packaging/tickets → marketing/ve-tickets
- /products/packaging/namecards → office/danh-thiep
- /products/packaging/card → office/danh-thiep
- /products/packaging/envelopes → office/bao-thu
- /products/packaging/envelope → office/bao-thu
- /products/packaging/tshirts → office/ao-thun
- /products/packaging/notes → office/giay-ghi-chu
- /products/packaging/notepad → office/giay-ghi-chu
- /products/packaging/letterheads → office/giay-tieu-de
- /products/packaging/letterhead → office/giay-tieu-de
- /products/packaging/folders → office/bia-dung-ho-so
- /products/packaging/folder → office/bia-dung-ho-so
- /products/packaging/calendars → tet/lich-tet
- /products/packaging/calendar → tet/lich-tet
- /products/packaging/lixi → tet/bao-li-xi
- /products/packaging/li-xi → tet/bao-li-xi
- /products/packaging/invitations → tet/thiep-tet
- /products/packaging/thiep-moi → tet/thiep-tet
- /products/packaging/catalogue → marketing/catalogues
- /products/packaging/catalogue-camnang → marketing/catalogues
- /products/packaging/thiep-chuc-mung → tet/thiep-tet
- /products/tet/to-gap → marketing/to-gap
- /products/tet/ve-tickets → marketing/ve-tickets
- /products/tet/vong-tay-su-kien → marketing/vong-tay-su-kien
- /products/tet/catalogues → marketing/catalogues
- /products/tet/danh-thiep → office/danh-thiep
- /products/tet/bao-thu → office/bao-thu
- /products/tet/ao-thun → office/ao-thun
- /products/tet/giay-ghi-chu → office/giay-ghi-chu
- /products/tet/giay-tieu-de → office/giay-tieu-de
- /products/tet/bia-dung-ho-so → office/bia-dung-ho-so
- /products/tet/tui-giay → packaging/tui-giay
- /products/tet/hop-giay → packaging/hop-giay
- /products/tet/leaflets-brochures → marketing/to-gap
- /products/tet/tickets → marketing/ve-tickets
- /products/tet/namecards → office/danh-thiep
- /products/tet/card → office/danh-thiep
- /products/tet/envelopes → office/bao-thu
- /products/tet/envelope → office/bao-thu
- /products/tet/tshirts → office/ao-thun
- /products/tet/notes → office/giay-ghi-chu
- /products/tet/notepad → office/giay-ghi-chu
- /products/tet/letterheads → office/giay-tieu-de
- /products/tet/letterhead → office/giay-tieu-de
- /products/tet/folders → office/bia-dung-ho-so
- /products/tet/folder → office/bia-dung-ho-so
- /products/tet/bags → packaging/tui-giay
- /products/tet/paper-bag → packaging/tui-giay
- /products/tet/boxes → packaging/hop-giay
- /products/tet/paper-box → packaging/hop-giay
- /products/tet/catalogue → marketing/catalogues
- /products/tet/catalogue-camnang → marketing/catalogues

### Khóa dịch mồ côi (95)

- ITEM_NAMES: card
- ITEM_NAMES: brochure
- ITEM_NAMES: catalogue
- ITEM_NAMES: folder
- ITEM_NAMES: form
- ITEM_NAMES: notepad
- ITEM_NAMES: menu
- ITEM_NAMES: calendar
- ITEM_NAMES: photobook
- ITEM_NAMES: thiep-ca-nhan
- ITEM_NAMES: tranh-canvas
- ITEM_NAMES: ky-yeu
- ITEM_NAMES: paper-bag
- ITEM_NAMES: paper-box
- ITEM_NAMES: box
- ITEM_NAMES: decal
- ITEM_NAMES: stamp
- ITEM_NAMES: label
- ITEM_NAMES: tag
- ITEM_NAMES: envelope
- ITEM_NAMES: flyer
- ITEM_NAMES: voucher
- ITEM_NAMES: letterhead
- ITEM_NAMES: calendars
- ITEM_NAMES: lixi
- ITEM_NAMES: invitations
- ITEM_NAMES: tags
- ITEM_NAMES: labels
- ITEM_NAMES: flyers
- ITEM_NAMES: posters-standee
- ITEM_NAMES: li-xi
- ITEM_NAMES: hop-qua-tet
- ITEM_DESCS: card
- ITEM_DESCS: brochure
- ITEM_DESCS: catalogue
- ITEM_DESCS: folder
- ITEM_DESCS: form
- ITEM_DESCS: notepad
- ITEM_DESCS: menu
- ITEM_DESCS: calendar
- ITEM_DESCS: photobook
- ITEM_DESCS: thiep-ca-nhan
- ITEM_DESCS: tranh-canvas
- ITEM_DESCS: ky-yeu
- ITEM_DESCS: paper-bag
- ITEM_DESCS: paper-box
- ITEM_DESCS: box
- ITEM_DESCS: decal
- ITEM_DESCS: stamp
- ITEM_DESCS: label
- ITEM_DESCS: tag
- ITEM_DESCS: envelope
- ITEM_DESCS: flyer
- ITEM_DESCS: voucher
- ITEM_DESCS: letterhead
- ITEM_DESCS: calendars
- ITEM_DESCS: lixi
- ITEM_DESCS: invitations
- ITEM_DESCS: tags
- ITEM_DESCS: labels
- ITEM_DESCS: flyers
- ITEM_DESCS: li-xi
- ITEM_DESCS: hop-qua-tet
- SHAPE_DESCS: banner-hiflex
- SHAPE_DESCS: standee-cuon
- SHAPE_DESCS: standee-chu-x
- SHAPE_DESCS: poster-pp
- SHAPE_DESCS: standee-de-nuoc
- SHAPE_DESCS: hanger-quang-cao
- SHAPE_DESCS: tranh-canvas-su-kien
- SHAPE_DESCS: to-roi-a5
- SHAPE_DESCS: to-roi-a4
- SHAPE_DESCS: to-roi-offset
- SHAPE_DESCS: to-gap-doi
- SHAPE_DESCS: to-gap-a4
- SHAPE_DESCS: ve-vao-cong
- SHAPE_DESCS: ve-vip
- SHAPE_DESCS: ve-vong-tay
- SHAPE_DESCS: voucher-don
- SHAPE_DESCS: voucher-cuon
- SHAPE_DESCS: voucher-kem-bao-thu
- SHAPE_DESCS: the-cao
- SHAPE_DESCS: danh-thiep-bo-goc
- SHAPE_DESCS: danh-thiep-ep-kim
- SHAPE_DESCS: danh-thiep-phu-uv
- SHAPE_DESCS: danh-thiep-vuong
- SHAPE_DESCS: danh-thiep-gap-doi
- SHAPE_DESCS: danh-thiep-dap-noi
- SHAPE_DESCS: danh-thiep-in-nhanh
- SHAPE_DESCS: danh-thiep-thong-minh
- SHAPE_DESCS: catalogue-a4
- SHAPE_DESCS: catalogue-bam-kim
- SHAPE_DESCS: catalogue-may-chi
- SHAPE_DESCS: profile-nang-luc
- SHAPE_DESCS: catalogue-bo-tui

### Tệp tạm không đăng ký (3)

- images/hero-landing-plane.prev.webp
- images/hero-landing-plane.webp.bak
- images/test-new-purple.png

### Ảnh/video đã đăng ký nhưng chưa thấy nơi nào nhắc tới (606)

- images/category/anphamkhac.webp
- images/category/baolixicon.webp
- images/category/canhan.webp
- images/category/quatang.webp
- images/footer-bg-mobile.webp
- images/footer-bg-seamless.webp
- images/footer-bg-wide.webp
- images/footer-bg.webp
- images/footer-emblem-3d.webp
- images/footer-emblem-clean.webp
- images/footer-emblem-test.png
- images/footer-shadow-bg.webp
- images/footer-tagline-3d.webp
- images/footer-tagline-clean.webp
- images/footer-tagline-raw.png
- images/footer-wall-bg.webp
- images/footer-wall-clean.png
- images/hero-landing-plane.img2.webp
- images/hero-landing-plane.webp
- images/hero/slide-2.jpeg
- images/hero/slide1.webp
- images/hero/slide2.webp
- images/partner/_orig/doitac1.webp
- images/partner/_orig/doitac2.webp
- images/partner/_orig/doitac3.webp
- images/partner/_orig/doitac4.webp
- images/partner/_orig/doitac5.webp
- images/partner/_orig/doitac6.webp
- images/partner/logoweb-original.webp
- images/partner/logoweb.webp
- images/partner/test_doitac2.webp
- images/portfolio/pf4.jpeg
- images/portfolio/pf4.webp
- images/product/anphamkhac.webp
- images/product/aopolo2.webp
- images/product/aopolo3.webp
- images/product/aothunnonsukien.webp
- images/product/art-foil2.webp
- images/product/art-foil3.webp
- images/product/art1.webp
- images/product/art2.webp
- images/product/art4.webp
- images/product/bag-art-foil1.webp
- images/product/bag-art-foil2.webp
- images/product/bag-art-foil3.webp
- images/product/bag-art1.webp
- images/product/bag-art2.webp
- images/product/bag-art3.webp
- images/product/bag-couche-foil1.webp
- images/product/bag-couche-foil2.webp
- images/product/bag-couche-foil3.webp
- images/product/bag-couche1.webp
- images/product/bag-couche2.webp
- images/product/bag-couche3.webp
- images/product/bag-ivory-foil1.webp
- images/product/bag-ivory-foil2.webp
- images/product/bag-ivory-foil3.webp
- images/product/bag-ivory1.webp
- images/product/bag-ivory2.webp
- images/product/bag-ivory3.webp
- images/product/bag-kraft-foil1.webp
- images/product/bag-kraft-foil2.webp
- images/product/bag-kraft-foil3.webp
- images/product/bag-kraft2.webp
- images/product/bag-logo1.webp
- images/product/bag-logo2.webp
- images/product/bag-logo3.webp
- images/product/banner-catalogue.jpg
- images/product/biaboi.webp
- images/product/biacungkyyeu2.webp
- images/product/biacungmenu.webp
- images/product/biacungmenu3.webp
- images/product/biadakyyeu2.webp
- images/product/biadakyyeu3.webp
- images/product/biagap.webp
- images/product/biagap1.webp
- images/product/biagap3.webp
- images/product/bieumau1.webp
- images/product/binhgiunhiet.webp
- images/product/binhgiunhietlaser2.webp
- images/product/binhgiunhietlaser3.webp
- images/product/binhgiunhietuv2.webp
- images/product/binhgiunhietuv3.webp
- images/product/blacklitfilm2.webp
- images/product/box-board-foil1.webp
- images/product/box-board-foil2.webp
- images/product/box-board-foil3.webp
- images/product/box-board2.webp
- images/product/box-board3.webp
- images/product/box-couche-foil1.webp
- images/product/box-couche-foil2.webp
- images/product/box-couche-foil3.webp
- images/product/box-couche1.webp
- images/product/box-couche2.webp
- images/product/box-couche3.webp
- images/product/box-ivory-foil1.webp
- images/product/box-ivory-foil2.webp
- images/product/box-ivory-foil3.webp
- images/product/box-ivory1.webp
- images/product/box-ivory2.webp
- images/product/box-ivory3.webp
- images/product/box-kraft-foil1.webp
- images/product/box-kraft-foil2.webp
- images/product/box-kraft-foil3.webp
- images/product/box-kraft2.webp
- images/product/box-kraft3.webp
- images/product/box-rigid-foil1.webp
- images/product/box-rigid-foil2.webp
- images/product/box-rigid-foil3.webp
- images/product/box-rigid1.webp
- images/product/c150.webp
- images/product/c200-c250.webp
- images/product/c300.webp
- images/product/c3002.webp
- images/product/calander-ford-foil1.webp
- images/product/calander-ford-foil2.webp
- images/product/calander-ford-foil3.webp
- images/product/calander-ford1.webp
- images/product/calander-ford2.webp
- images/product/calander-ford3.webp
- images/product/calendar-embossed1.webp
- images/product/calendar-embossed2.webp
- images/product/calendar-embossed3.webp
- images/product/calendar-embossed4.webp
- images/product/calendar-wall-foil1.webp
- images/product/calendar-wall-foil2.webp
- images/product/calendar-wall-foil3.webp
- images/product/calendar-wall1.webp
- images/product/calendar-wall4.webp
- images/product/calendar-wall5.webp
- images/product/calendar-wall6.webp
- images/product/calender-art-2.webp
- images/product/calender-art-3.webp
- images/product/calender-art-foil4.webp
- images/product/calender-art-foil5.webp
- images/product/calender-art-foil6.webp
- images/product/calender-art1.webp
- images/product/calender-art2.webp
- images/product/calender-art3.webp
- images/product/calender-desk-foil1.webp
- images/product/calender-desk-foil2.webp
- images/product/calender-desk-foil3.webp
- images/product/calender-desk1.webp
- images/product/calender-desk2.webp
- images/product/calender-desk3.webp
- images/product/calendertet-a-foil1.webp
- images/product/calendertet-a-foil2.webp
- images/product/calendertet-a-foil3.webp
- images/product/calendertet-a1.webp
- images/product/calendertet-a2.webp
- images/product/calendertet-a3.webp
- images/product/calendertet-board1.webp
- images/product/calendertet-board2.webp
- images/product/calendertet-board3.webp
- images/product/calendertet-sheet1.webp
- images/product/calendertet-sheet2.webp
- images/product/calendertet-sheet3.webp
- images/product/calendertet-vip2.webp
- images/product/calendertet-vip3.webp
- images/product/calendertetvip1.webp
- images/product/calndertet-ford1.webp
- images/product/calndertet-ford2.webp
- images/product/calndertet-ford3.webp
- images/product/canhan.webp
- images/product/carbon.webp
- images/product/carbonless.webp
- images/product/card-art-foil1.webp
- images/product/card-art-foil3.webp
- images/product/card-art-foil4.webp
- images/product/card-art1.webp
- images/product/card-art2.webp
- images/product/card-art3.webp
- images/product/card-c300-3.webp
- images/product/card-c300-foil1.webp
- images/product/card-c300-foil2.webp
- images/product/card-c300-foil3.webp
- images/product/card-digital1.webp
- images/product/card-digital2.webp
- images/product/card-digital3.webp
- images/product/card-digital4.webp
- images/product/card-embossed-foil1.webp
- images/product/card-embossed-foil2.webp
- images/product/card-embossed-foil3.webp
- images/product/card-embossed1.webp
- images/product/card-embossed2.webp
- images/product/card-embossed3.webp
- images/product/card-f300-1.png
- images/product/card-f300-2.webp
- images/product/card-f300-3.webp
- images/product/card-f300-foil3.webp
- images/product/card-f300-foil4.webp
- images/product/card-f300-foil5.webp
- images/product/card-f300.webp
- images/product/card-item-folder-c300-3.webp
- images/product/card-item-folder-c300-4.webp
- images/product/card-item-folder-c300-5.webp
- images/product/card-item-folder-c300-foil1.webp
- images/product/card-item-folder-c300-foil3.webp
- images/product/card-item-folder-c300-foil4.webp
- images/product/card-item-folder-c300-foil5.webp
- images/product/card-item-folder-ford300-1.webp
- images/product/card-item-folder-ford300-4.webp
- images/product/card-item-folder-ford300-5.webp
- images/product/card-item-folder-ford300-6.webp
- images/product/card-item-folder-ford300-foil1.webp
- images/product/card-item-folder-ford300-foil2.webp
- images/product/card-item-folder-ford300-foil3.webp
- images/product/card-pearl3.webp
- images/product/card-plastic2.webp
- images/product/card-plastic3.webp
- images/product/cardart.webp
- images/product/carton-foil.webp
- images/product/cartonkyyeu.webp
- images/product/catalogue-PUR1.webp
- images/product/catalogue-PUR2.webp
- images/product/catalogue-PUR3.webp
- images/product/catalogue-foil1.webp
- images/product/catalogue-foil2.webp
- images/product/catalogue-foil3.webp
- images/product/catalogue-ford1.webp
- images/product/catalogue-ford2.webp
- images/product/catalogue-ford3.webp
- images/product/catalogue-saddle-1.webp
- images/product/catalogue-saddle-2.webp
- images/product/catalogue-saddle-3.webp
- images/product/catalogue-saddle-foil3.webp
- images/product/catalogue-wire1.webp
- images/product/catalogue-wire2.webp
- images/product/catalogue-wire3.webp
- images/product/cmyk.webp
- images/product/couche-glossy.png
- images/product/couche.webp
- images/product/couche1.webp
- images/product/da.webp
- images/product/dapnoi-foil.webp
- images/product/dapnoi.webp
- images/product/decal-foil1.webp
- images/product/decal-foil2.webp
- images/product/decal-foil3.webp
- images/product/decal-ford1.webp
- images/product/decal-ford2.webp
- images/product/decal-ford3.webp
- images/product/decal-laminate1.webp
- images/product/decal-laminate2.webp
- images/product/decal-laminate3.webp
- images/product/decal-pvc1.webp
- images/product/decal-pvc2.webp
- images/product/decal-pvc3.webp
- images/product/decal-white1.webp
- images/product/decal-white2.webp
- images/product/decal-white3.webp
- images/product/decaltrangsua.webp
- images/product/decaltrongsuot.webp
- images/product/digital.webp
- images/product/envelope-art-foil1.webp
- images/product/envelope-art-foil2.webp
- images/product/envelope-art-foil3.webp
- images/product/envelope-art1.webp
- images/product/envelope-art2.webp
- images/product/envelope-art3.webp
- images/product/envelope-kraft-foil1.webp
- images/product/envelope-kraft-foil2.webp
- images/product/envelope-kraft-foil3.webp
- images/product/envelope-kraft1.webp
- images/product/envelope-kraft2.webp
- images/product/envelope-kraft3.webp
- images/product/envelope-mail1.webp
- images/product/envelope-mail2.webp
- images/product/envelope-mail3.webp
- images/product/evelope-couche-foil1.webp
- images/product/evelope-couche-foil2.webp
- images/product/evelope-couche-foil3.webp
- images/product/evelope-couche1.webp
- images/product/evelope-couche2.webp
- images/product/evelope-couche3.webp
- images/product/flyer-art-foil1.webp
- images/product/flyer-art-foil2.webp
- images/product/flyer-art-foil3.webp
- images/product/flyer-art1.webp
- images/product/flyer-couche-foil1.webp
- images/product/flyer-couche-foil2.webp
- images/product/flyer-couche-foil3.webp
- images/product/flyer-couche1.webp
- images/product/flyer-couche2.webp
- images/product/flyer-couche3.webp
- images/product/flyer-ford2.webp
- images/product/flyer-kraft1.webp
- images/product/flyer-kraft2.webp
- images/product/flyer-kraft3.webp
- images/product/flyer-pvc1.webp
- images/product/flyer-pvc2.webp
- images/product/flyer-pvc3.webp
- images/product/flyerart2.webp
- images/product/flyerart3.webp
- images/product/flyerford2.webp
- images/product/flyerford3.webp
- images/product/flyernhua.webp
- images/product/foil.webp
- images/product/ford-foil.webp
- images/product/ford.webp
- images/product/ford70-8-gsm.webp
- images/product/form-bink.webp
- images/product/form-book.webp
- images/product/form-book2.webp
- images/product/form-book3.webp
- images/product/form-book4.webp
- images/product/form-carbonless4.webp
- images/product/form-carbonless5.webp
- images/product/form-number1.webp
- images/product/form-number2.webp
- images/product/form-number3.webp
- images/product/gaykeonhiet.webp
- images/product/gayloxo1.webp
- images/product/gayloxonote.webp
- images/product/giayghichu-giayloaif.webp
- images/product/hologram.webp
- images/product/hopquatet-carton-foil1.webp
- images/product/hopquatet-carton-foil2.webp
- images/product/hopquatet-carton-foil3.webp
- images/product/hopquatet-carton1.webp
- images/product/hopquatet-carton2.webp
- images/product/hopquatet-carton3.webp
- images/product/hopquatet-couche-foil1.webp
- images/product/hopquatet-couche-foil2.webp
- images/product/hopquatet-couche-foil3.webp
- images/product/hopquatet-couche1.webp
- images/product/hopquatet-couche2.webp
- images/product/hopquatet-couche3.webp
- images/product/hopquatet-ivory-foil1.webp
- images/product/hopquatet-ivory-foil2.webp
- images/product/hopquatet-ivory-foil3.webp
- images/product/hopquatet-ivory1.webp
- images/product/hopquatet-ivory2.webp
- images/product/hopquatet-ivory3.webp
- images/product/hopquatet-uv1.webp
- images/product/hopquatet-uv2.webp
- images/product/hopquatet-uv3.webp
- images/product/hopqutet-kraft1.webp
- images/product/hopqutet-kraft2.webp
- images/product/hopqutet-kraft3.webp
- images/product/huyhieu2.webp
- images/product/huyhieu3.webp
- images/product/innhanh.webp
- images/product/inox304.webp
- images/product/iteam-brochure-custom1.webp
- images/product/iteam-brochure-custom2.webp
- images/product/iteam-brochure-custom3.webp
- images/product/item-brochure-digital1.webp
- images/product/item-brochure-digital2.webp
- images/product/item-brochure-digital3.webp
- images/product/item-brochure-ford1.webp
- images/product/item-brochure-ford2.webp
- images/product/item-brochure-ford3.webp
- images/product/item-brochure-gate1.webp
- images/product/item-brochure-gate2.webp
- images/product/item-brochure-gate3.webp
- images/product/item-brochure-standard-1.webp
- images/product/item-brochure-standard-2.webp
- images/product/item-brochure-standard-3.webp
- images/product/item-folder-UV2.webp
- images/product/item-folder-UV3.webp
- images/product/item-folder-UV4.webp
- images/product/item-folder-art-foil1.webp
- images/product/item-folder-art-foil2.webp
- images/product/item-folder-art-foil3.webp
- images/product/item-folder-art1.webp
- images/product/item-folder-art2.webp
- images/product/item-folder-art3.webp
- images/product/item-folder-double-pocket-foil1.webp
- images/product/item-folder-double-pocket-foil2.webp
- images/product/item-folder-double-pocket-foil3.webp
- images/product/item-folder-double-pocket1.webp
- images/product/item-folder-double-pocket2.webp
- images/product/item-folder-double-pocket3.webp
- images/product/item-form-carbonless1.webp
- images/product/item-form-carbonless2.webp
- images/product/item-form-carbonless3.webp
- images/product/item-form-digital1.webp
- images/product/item-form-digital2.webp
- images/product/item-form-digital3.webp
- images/product/item-form-ford8.webp
- images/product/item-form-ford9.webp
- images/product/ivory.webp
- images/product/kraft-foil.webp
- images/product/kraftnote.webp
- images/product/kyyeu.webp
- images/product/kyyeubiakraft.webp
- images/product/lable-PVC2.webp
- images/product/lable-PVC3.webp
- images/product/lable-art1.webp
- images/product/lable-art2.webp
- images/product/lable-art3.webp
- images/product/lable-couche2.webp
- images/product/lable-couche3.webp
- images/product/lable-ford1.webp
- images/product/lable-ford2.webp
- images/product/lable-ford3.webp
- images/product/lable-luxury1.webp
- images/product/lable-luxury2.webp
- images/product/lable-luxury3.webp
- images/product/lichin3d.webp
- images/product/lixi-3d1.webp
- images/product/lixi-3d2.webp
- images/product/lixi-3d3.webp
- images/product/lixi-art1.webp
- images/product/lixi-art2.webp
- images/product/lixi-art3.webp
- images/product/lixi-couche-foil1.webp
- images/product/lixi-couche-foil2.webp
- images/product/lixi-couche-foil3.webp
- images/product/lixi-couche1.webp
- images/product/lixi-couche2.webp
- images/product/lixi-couche3.webp
- images/product/lixi-ford1.webp
- images/product/lixi-ford2.webp
- images/product/lixi-ford3.webp
- images/product/lixi-kraft1.webp
- images/product/lixi-kraft2.webp
- images/product/lixi-kraft3.webp
- images/product/lustre.webp
- images/product/lustre2.webp
- images/product/lustre3.webp
- images/product/macart.webp
- images/product/maccouche.webp
- images/product/macford.webp
- images/product/macivory.webp
- images/product/menu-bound1.webp
- images/product/menu-bound2.webp
- images/product/menu-bound3.webp
- images/product/menu-c300-foil1.webp
- images/product/menu-c300-foil2.webp
- images/product/menu-c300-foil3.webp
- images/product/menu-c3001.webp
- images/product/menu-c3002.webp
- images/product/menu-c3003.webp
- images/product/menu-ford-foil1.webp
- images/product/menu-ford-foil2.webp
- images/product/menu-ford-foil3.webp
- images/product/menu-ford1.webp
- images/product/menu-ford2.webp
- images/product/menu-ford3.webp
- images/product/menu-laminate1.webp
- images/product/menu-laminate2.webp
- images/product/menu-laminate3.webp
- images/product/menu-plastic1.webp
- images/product/menu-plastic2.webp
- images/product/menu-plastic3.webp
- images/product/menubia.webp
- images/product/menuc300.webp
- images/product/menunhua.webp
- images/product/mica.webp
- images/product/mockhoa.webp
- images/product/mockhoamica2.webp
- images/product/mockhoamica3.webp
- images/product/nhanart.webp
- images/product/nonkaki2.webp
- images/product/nonkaki3.webp
- images/product/note-bound1.webp
- images/product/note-bound2.webp
- images/product/note-bound3.webp
- images/product/note-couche1.webp
- images/product/note-couche3.webp
- images/product/note-couche4.webp
- images/product/note-ford-foil1.webp
- images/product/note-ford-foil2.webp
- images/product/note-ford-foil3.webp
- images/product/note-ford3.webp
- images/product/note-ford4.webp
- images/product/note-ford5.webp
- images/product/note-kraft1.webp
- images/product/note-kraft2.webp
- images/product/note-kraft3.webp
- images/product/note-sticky1.webp
- images/product/note-sticky2.webp
- images/product/note-sticky3.webp
- images/product/paperart-foil.webp
- images/product/paperart.webp
- images/product/pearl.webp
- images/product/pearl4.webp
- images/product/pearl5.webp
- images/product/photobook.webp
- images/product/photobookart2.webp
- images/product/photobookart3.webp
- images/product/photobookcouche.webp
- images/product/photobookcouche2.webp
- images/product/photobookcouche3.webp
- images/product/plastic.webp
- images/product/postercouche2.webp
- images/product/postercouche3.webp
- images/product/posterpp2.webp
- images/product/posterpp3.webp
- images/product/posterquangcao.webp
- images/product/pp.webp
- images/product/quatang.webp
- images/product/ruotford.webp
- images/product/sokyyeucarton2.webp
- images/product/soquatangda2.webp
- images/product/soquatangda3.webp
- images/product/soquatangloxo2.webp
- images/product/soquatangloxo3.webp
- images/product/sotayquatang.webp
- images/product/standee-banner.webp
- images/product/standeechan.webp
- images/product/standeechan2.webp
- images/product/standeechan3.webp
- images/product/standeecuonnhom.webp
- images/product/standeecuonnhom2.webp
- images/product/standeecuonnhom3.webp
- images/product/tag-art-foil1.webp
- images/product/tag-art-foil2.webp
- images/product/tag-art-foil3.webp
- images/product/tag-art1.webp
- images/product/tag-art2.webp
- images/product/tag-art3.webp
- images/product/tag-couche-foil1.webp
- images/product/tag-couche-foil2.webp
- images/product/tag-couche-foil3.webp
- images/product/tag-couche2.webp
- images/product/tag-couche3.webp
- images/product/tag-foil1.webp
- images/product/tag-foil2.webp
- images/product/tag-foil3.webp
- images/product/tag-ford-foil1.webp
- images/product/tag-ford-foil2.webp
- images/product/tag-ford-foil3.webp
- images/product/tag-ford1.webp
- images/product/tag-ford2.webp
- images/product/tag-ford3.webp
- images/product/tag-ivory-foil1.webp
- images/product/tag-ivory-foil2.webp
- images/product/tag-ivory-foil3.webp
- images/product/tag-ivory1.webp
- images/product/tag-ivory2.webp
- images/product/tag-ivory3.webp
- images/product/tem-anti1.webp
- images/product/tem-anti2.webp
- images/product/tem-anti3.webp
- images/product/tem-couche-foil1.webp
- images/product/tem-couche-foil2.webp
- images/product/tem-couche-foil3.webp
- images/product/tem-couche4.webp
- images/product/tem-couche5.webp
- images/product/tem-couche6.webp
- images/product/tem-foil4.webp
- images/product/tem-foil5.webp
- images/product/tem-foil6.webp
- images/product/tem-ford-foil1.webp
- images/product/tem-ford-foil2.webp
- images/product/tem-ford-foil3.webp
- images/product/tem-ford4.webp
- images/product/tem-ford5.webp
- images/product/tem-ford6.webp
- images/product/tem-tamper1.webp
- images/product/tem-tamper2.webp
- images/product/tem-tamper3.webp
- images/product/temcouche.webp
- images/product/temford.webp
- images/product/temniemphong.webp
- images/product/thenhua.webp
- images/product/thenhuaatm2.webp
- images/product/thenhuaatm3.webp
- images/product/thenhuatrongsuot.webp
- images/product/thenhuatrongsuot2.webp
- images/product/thenhuatrongsuot3.webp
- images/product/thiepcuoiart.webp
- images/product/thiepcuoiart2.webp
- images/product/thiepcuoiart3.webp
- images/product/thiepcuoiart4.webp
- images/product/thiepcuoic3002.webp
- images/product/thiepcuoic3003.webp
- images/product/thieptet-art-foil2.webp
- images/product/thieptet-art-foil3.webp
- images/product/thieptet-art2.webp
- images/product/thieptet-art3.webp
- images/product/thieptet-couche-foil2.webp
- images/product/thieptet-couche-foil3.webp
- images/product/thieptet-couche1.webp
- images/product/thieptet-couche2.webp
- images/product/thieptet-couche3.webp
- images/product/thieptet-embossed2.webp
- images/product/thieptet-embossed3.webp
- images/product/thieptet-ford-foil2.webp
- images/product/thieptet-ford-foil3.webp
- images/product/thieptet-ford2.webp
- images/product/thieptet-ford3.webp
- images/product/thieptet-kraft-foil2.webp
- images/product/thieptet-kraft-foil3.webp
- images/product/vaicasau.webp
- images/product/vaikaki.webp
- images/product/vd-item-bag.jpeg
- images/product/vd-item-brochure.jpeg
- images/product/vd-item-calendar.jpeg
- images/product/vd-item-flyer.jpeg
- images/product/vd-item-form.jpg
- images/product/vd-item-hopquatet.jpeg
- images/product/vd-item-lichtet.jpg
- images/product/vd-item-menu.jpeg
- images/product/vd-item-notepad.jpeg
- images/product/vd-item-stamp.jpg
- images/product/vd-item-thieptet.jpg
- images/product/weddingcard.webp
- images/service/vd-svc-consult.jpg
- images/service/vd-svc-delivery.jpg
- images/service/vd-svc-design.jpg
- images/service/vd-svc-sample.jpg
- uploads/bieumau.webp

### Phụ lục C — tiếng Trung / Nhật / Hàn

### Loại giấy có tên dịch khác nhau (19)

- Giấy loại C [zh] → C类纸 | 铜版卡纸 300-350gsm 覆膜彩盒
- Giấy loại C [ja] → Cタイプ用紙 | コートボール紙 300-350gsm PP加工化粧箱
- Giấy loại C [ko] → 스노우지 150gsm (대량 배포용 표준 전단지) | C타입 용지 | 스노우지 C300 (표준형) | 스노우지 150-200gsm 컬러 코팅 봉투 | 스노우지 300-350gsm (표준 홀더) | 스노우지 250-300gsm 코팅 쇼핑백 | 스노우지 300-350gsm 코팅 패키지 상자 | 스노우지 300-350gsm 표준 의류 행택 | 스노우지 250g 내지 & 삼각대 하드보드 레자/린넨 합지 (탁상달력) | 스노우지 150gsm 코팅 (표준 세뱃돈 봉투) | 스노우지 300gsm 코팅 새해 연하장 | 스노우지 300g 양면 무광 코팅 (프리미엄 의류 행택/카드) | 스노우지 150g 디지털 당일 급행 인쇄 (신년 휴무 공지/전단지)
- Giấy loại F [en] → Type F Paper | Type F Paper (Uncoated Type F Paper) | Type F Paper (Type F Paper)
- Giấy Mỹ Thuật [vi] → Giấy Mỹ Thuật | Giấy mỹ thuật
- Giấy Mỹ Thuật [en] → Art Paper (Premium & Textured) | Fine Art Paper | Luxury Art Paper
- Giấy Mỹ Thuật [zh] → 高级艺术纸（原生纹理·沉稳典雅） | 特种艺术纸（纹理质感·轻奢典雅） | 特种艺术纸 | 特种艺术纸（纹理典雅） | 特种艺术纸 Fine Art Paper
- Giấy Mỹ Thuật [ja] → 高級ファインペーパー（特殊紙・風合い重視） | 高級ファインペーパー | 高級ファインアート紙（風合い紙） | 高級ファインペーパー（特殊紙）
- Giấy Mỹ Thuật [ko] → 최고급 수입 명품지 (자연스러운 엠보 질감) | 최고급 수입 명품지 (자연스러운 엠보 텍스처) | 최고급 수입 명품지 | 고급 수입 예술지 (질감지) | 고급 수입지 / 특수지 (Fine Art)
- Giấy loại I [zh] → I类纸 | 单铜白卡 Ivory 300-350gsm（医药化妆品级） | 超厚白卡 Ivory 300-350gsm（挺括硬挺）
- Giấy loại I [ja] → Iタイプ用紙 | 高級白板紙 300-350gsm（医薬品・化粧品規格）
- Giấy Kraft [en] → Kraft Paper (Vintage & Eco-friendly) | Kraft Paper
- Giấy Kraft [zh] → 环保牛皮纸 Kraft（复古原生态） | 环保牛皮纸 Kraft Paper
- Giấy Kraft [ja] → クラフト紙（ヴィンテージ・エコナチュラル） | クラフト紙（ヴィンテージ・エコ）
- Giấy Kraft [ko] → 친환경 크라프트지 (빈티지 내추럴 감성) | 크라프트지 (친환경 빈티지)
- Giấy Mỹ Thuật Cao Cấp Ép Kim [en] → Fine Art Paper with Gold Foil | Premium Art Paper with Foil
- Giấy Mỹ Thuật Cao Cấp Ép Kim [zh] → 高档特种艺术纸 + 3D立体烫金 (年终表彰荣誉证书) | 高端进口特种艺术纸 + 3D烫金（顶级年终荣誉证书）
- Giấy Mỹ Thuật Cao Cấp Ép Kim [ja] → 最高級アート紙 + 3D金箔押し（年末表彰状・ディプロマ） | 最高級アート紙 + 3D金箔押し（プレミアム表彰状）
- Giấy Mỹ Thuật Cao Cấp Ép Kim [ko] → 최고급 파인아트 수입지 + 3D 골드박 후가공 (종무식 표창장/수료증) | 최고급 수입 예술지 + 3D 금박 (프리미엄 VIP 표창장)

### Phụ lục D — bản dịch đề xuất bằng AI (99 đoạn)

**Đặc điểm chất liệu** (12 đặc điểm):

| Mục | Tiếng Việt (nguồn) | 中文 | 日本語 | 한국어 | Người bản ngữ đã duyệt |
| --- | --- | --- | --- | --- | --- |
| `glossy-coat` — tên | Bóng Gương | 亮面涂层 | グロスコート | 유광 코팅 | ☐ |
| `glossy-coat` — mô tả | Bề mặt tráng phủ bóng, phản chiếu ánh sáng sắc nét như gương. | 表面涂布光泽层，光线反射清晰如镜面。 | 表面に光沢コートを施し、鏡のようにくっきりと光を反射します。 | 표면에 광택 코팅을 입혀 거울처럼 선명하게 빛을 반사합니다. | ☐ |
| `smooth-base` — tên | Nền Mịn | 平滑底纸 | なめらかな紙面 | 매끄러운 바탕 | ☐ |
| `smooth-base` — mô tả | Nền giấy mịn, không lộ vân giấy. | 纸面平滑细腻，看不出纸张纹路。 | 紙目が目立たない、なめらかな下地です。 | 종이 결이 보이지 않는 매끄러운 바탕입니다. | ☐ |
| `foil-accent` — tên | Ép Kim | 烫金点缀 | 箔押しのアクセント | 박 포인트 | ☐ |
| `foil-accent` — mô tả | Chi tiết ép kim ánh kim được dập lên bề mặt. | 在表面烫印金属箔细节。 | 表面に金属箔を押して、華やかなアクセントを加えます。 | 표면에 금속 박을 눌러 찍어 포인트를 더합니다. | ☐ |
| `natural-grain` — tên | Vân Giấy Tự Nhiên | 天然纸纹 | 自然な紙目 | 자연스러운 종이 결 | ☐ |
| `natural-grain` — mô tả | Bề mặt nhám với vân giấy mịn, tự nhiên. | 哑光表面，带有细腻自然的纸张纹理。 | きめ細かな自然な紙目を持つ、マットな質感です。 | 고운 종이 결이 살아 있는 무광 표면입니다. | ☐ |
| `soft-light` — tên | Ánh Sáng Dịu | 柔和漫射光 | やわらかな拡散光 | 부드러운 확산광 | ☐ |
| `soft-light` — mô tả | Ánh sáng khuếch tán đều trên bề mặt, không chói, không phản quang. | 光线在表面均匀漫射，不眩光、不反光。 | 光が表面で均一に拡散し、まぶしさや映り込みがありません。 | 빛이 표면에 고르게 퍼져 눈부심이나 반사가 없습니다. | ☐ |
| `textured-art` — tên | Vân Mỹ Thuật | 艺术纹理纸 | 風合いのあるアート紙 | 질감 있는 아트지 | ☐ |
| `textured-art` — mô tả | Vân giấy đặc trưng mang lại cảm giác nghệ thuật, sang trọng khi chạm vào. | 独特的触感纹理，带来手工艺术般的高级质感。 | はっきりとした手触りの紙質が、職人的で上質な印象を与えます。 | 뚜렷한 촉감의 종이 질감으로 수공예적이고 고급스러운 느낌을 줍니다. | ☐ |
| `metallic-shine` — tên | Ánh Ngọc Trai | 珠光金属光泽 | パールメタリックの輝き | 펄 메탈릭 광택 | ☐ |
| `metallic-shine` — mô tả | Bề mặt ánh ngọc trai sang trọng, chuyển màu tinh tế dưới ánh sáng. | 细腻的珠光质感，随光线变化呈现柔美色泽。 | ほのかな真珠光沢が、光の角度で美しく表情を変えます。 | 은은한 진주빛 광택이 빛에 따라 아름답게 변합니다. | ☐ |
| `waterproof-durability` — tên | Chống Nước & Siêu Bền | 防水塑料材质 | 防水プラスチック | 방수 플라스틱 | ☐ |
| `waterproof-durability` — mô tả | Chất liệu nhựa tổng hợp chống rách và chống nước 100%. | 耐撕裂，100% 防水的合成基材。 | 破れにくく、100%防水の合成素材です。 | 찢어짐에 강하고 100% 방수되는 합성 소재입니다. | ☐ |
| `embossed-depth` — tên | Dập Nổi / Dập Chìm | 3D 压凸工艺 | 3Dエンボス加工 | 3D 엠보싱 | ☐ |
| `embossed-depth` — mô tả | Kỹ thuật dập nổi/dập chìm tạo độ sâu 3D cho logo và chi tiết điểm nhấn. | 为标志和重点图案打造可触摸的立体浮雕效果。 | ロゴやポイント部分に、触れて分かる立体的な凹凸を加えます。 | 로고와 포인트 부분에 손으로 느껴지는 입체 양각·음각을 더합니다. | ☐ |
| `digital-precision` — tên | In Nhanh Kỹ Thuật Số | 快速数码印刷 | スピードデジタル印刷 | 빠른 디지털 인쇄 | ☐ |
| `digital-precision` — mô tả | In kỹ thuật số tốc độ cao, chuẩn màu sắc với thời gian hoàn thành nhanh chóng. | 高速数码印刷，色彩鲜明，交付迅速。 | 高速のデジタル印刷で、色鮮やかに短納期で仕上げます。 | 고속 디지털 인쇄로 선명한 색상과 짧은 제작 기간을 제공합니다. | ☐ |
| `thick-weight` — tên | Định Lượng Dày Dặn | 厚实卡纸 | 厚手のカードストック | 두꺼운 카드지 | ☐ |
| `thick-weight` — mô tả | Độ dày định lượng cao tạo cảm giác cứng cáp, chắc chắn khi cầm. | 高克重纸张挺括厚实，手感扎实高档。 | 重みのある厚紙が、しっかりとした上質な手触りを生みます。 | 묵직한 평량의 종이가 단단하고 고급스러운 촉감을 줍니다. | ☐ |
| `eco-friendly` — tên | Thân Thiện Môi Trường | 环保材质 | 環境にやさしい素材 | 친환경 소재 | ☐ |
| `eco-friendly` — mô tả | Chất liệu giấy tự nhiên, dễ tái chế và thân thiện với môi trường. | 可生物降解、可回收的纸张，支持可持续发展。 | 生分解性でリサイクル可能な紙素材で、サステナビリティに貢献します。 | 생분해와 재활용이 가능한 종이로 지속 가능성을 지원합니다. | ☐ |

**Gạch đầu dòng «phù hợp cho»** (thay cho dòng tóm tắt gốc):

| Mục | Tiếng Việt (nguồn) | 中文 | 日本語 | 한국어 | Người bản ngữ đã duyệt |
| --- | --- | --- | --- | --- | --- |
| tet/to-roi — Giấy loại C 250-300gsm (dòng 1) | Bằng khen vinh danh nhân viên xuất sắc tại tiệc tất niên Year End Party | 公司年终晚宴（Year End Party）优秀员工表彰奖状 | 年末パーティー（Year End Party）で贈る優秀社員の表彰状 | 송년 파티(Year End Party)에서 우수 직원을 시상하는 표창장 | ☐ |
| tet/to-roi — Giấy loại C 250-300gsm (dòng 2) | Giấy chứng nhận hoàn thành khóa đào tạo và bằng tri ân đối tác | 培训结业证书及合作伙伴感谢状 | 研修修了証書と、パートナー企業への感謝状 | 교육 수료증 및 파트너사 감사장 | ☐ |
| tet/to-roi — Giấy loại C 250-300gsm (dòng 3) | In số lượng lớn bằng khen chính thức cho lễ tổng kết toàn công ty | 用于全公司总结表彰大会的大批量正式奖状印刷 | 全社の総括式典向けに、公式の表彰状を大量印刷 | 전사 결산·시상식용 공식 표창장 대량 인쇄 | ☐ |
| tet/to-roi — Giấy loại F 200-250gsm (dòng 1) | Bằng khen phong cách cổ điển trang trọng với font chữ thư pháp truyền thống | 采用传统书法字体、庄重古典风格的奖状 | 伝統的な書道書体を用いた、格式ある古典的スタイルの表彰状 | 전통 서예체를 사용한 격조 있는 고전풍 표창장 | ☐ |
| tet/to-roi — Giấy loại F 200-250gsm (dòng 2) | Giấy chứng nhận tốt nghiệp khóa học và bằng hoàn thành chương trình đào tạo | 课程毕业证书及培训项目结业证书 | コースの修了証書および研修プログラムの修了認定証 | 과정 수료증 및 교육 프로그램 이수 증명서 | ☐ |
| tet/to-roi — Giấy loại F 200-250gsm (dòng 3) | Bằng khen cần chữ ký tay và đóng dấu đỏ bảo đảm mực thấm đều sắc nét | 需要手写签名和盖红章、要求墨水吸收均匀清晰的奖状 | 手書きの署名と朱印が必要で、インクが均一ににじまず吸収される表彰状 | 손글씨 서명과 붉은 직인이 필요해 잉크가 고르고 선명하게 스며들어야 하는 표창장 | ☐ |
| tet/to-roi — Giấy Mỹ Thuật Cao Cấp Ép Kim (dòng 1) | Bằng khen VIP tại Gala tất niên, giải thưởng cống hiến trọn đời cho doanh nghiệp | 年终盛典（Gala）VIP 荣誉奖状及企业终身贡献奖 | 年末ガラのVIP表彰状、および企業への生涯功労賞 | 연말 갈라 VIP 표창장 및 기업 평생 공로상 | ☐ |
| tet/to-roi — Giấy Mỹ Thuật Cao Cấp Ép Kim (dòng 2) | Giấy chứng nhận Đối tác Vàng và tri ân ban lãnh đạo xuất sắc | 金牌合作伙伴认证及优秀领导层致谢状 | ゴールドパートナー認定証、および優れた経営陣への感謝状 | 골드 파트너 인증서 및 우수 경영진 감사장 | ☐ |
| tet/to-roi — Giấy Mỹ Thuật Cao Cấp Ép Kim (dòng 3) | Bằng khen giới hạn kỷ niệm dấu mốc quan trọng của công ty | 纪念公司重要里程碑的限量版奖状 | 会社の重要な節目を記念する限定版の表彰状 | 회사의 중요한 이정표를 기념하는 한정판 상장 | ☐ |
