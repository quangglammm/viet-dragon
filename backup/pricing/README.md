# Thư Mục Backup: Bảng Giá & In Nhanh (Fast Print)

Thư mục này lưu trữ toàn bộ mã nguồn và dữ liệu liên quan đến **Bảng giá / In Nhanh** được sao lưu theo yêu cầu của khách hàng:

1. **`fast-print.json`**: Dữ liệu bảng giá gốc (đầy đủ giá `fromPrice`, đơn vị tính `unit`, mô tả 5 thứ tiếng).
2. **`fast-print.ts`**: Nguồn dữ liệu legacy gốc từ dự án.
3. **`fast-print-page/`**:
   - `page.tsx`: Route trang `/products/fast-print`.
   - `FastPrintClient.tsx`: Giao diện hiển thị các thẻ in nhanh kèm giá và nút liên hệ.

---

### Cách Khôi Phục Lại (Khi Cần Dùng):
1. Copy thư mục `fast-print-page` trở lại: `app/[locale]/products/fast-print`
2. Copy file `fast-print.json` trở lại: `lib/mock-data/fast-print.json`
3. Đăng ký lại `mockFastPrint` trong `lib/mock-data/index.ts`
