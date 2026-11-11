# Admin — Hướng dẫn kiểm thử thủ công

Cách chạy website trên máy tính cá nhân và kiểm thử thủ công từng phần của hệ thống quản trị (Admin CMS) trước khi triển khai bất kỳ nội dung nào lên môi trường thực tế.
Dự kiến mất **khoảng 2 tiếng** cho một lượt kiểm thử toàn diện (danh sách kiểm tra ở phần 4 là phần dài nhất). Bạn có thể tạm dừng sau bất kỳ phần nào và tiếp tục sau: dữ liệu vẫn được lưu trong cơ sở dữ liệu kiểm thử cho đến khi bạn xóa nó.

- Các nhãn trên màn hình được trích dẫn chính xác như xuất hiện trên giao diện tiếng Việt: «Chỉnh sửa», «Xuất bản…».
- Mỗi dòng trong danh sách kiểm tra tuân theo định dạng **Thao tác (Do) → Kết quả mong đợi (Expect)**. Đánh dấu vào ô (`- [x]`) trong quá trình thực hiện; hãy sao chép tệp này trước nếu bạn muốn giữ một bản sạch cho các lượt kiểm thử tiếp theo.
- Thẻ vai trò: **[admin]**, **[editor]**, **[visitor]** cho biết ai là người thực hiện bước đó. *Visitor* (khách truy cập) là cửa sổ riêng tư/ẩn danh (incognito) chưa đăng nhập.
- Mọi thao tác ở đây đều thực hiện ở môi trường local. Không có bất kỳ nội dung nào trong hướng dẫn này tác động đến máy chủ production, website đang chạy thật hay cơ sở dữ liệu dev hàng ngày của bạn.

---

## 0. Trước khi bắt đầu

Bạn cần:

- Docker Desktop đang chạy, và đã hoàn tất `pnpm install` trong thư mục dự án.
- **Chrome** (hoặc Firefox). Tính năng Xem trước (Preview) thiết lập một cookie mà trình duyệt chỉ chấp nhận trên `http://localhost` thông thường ở Chrome/Firefox, không hỗ trợ trên Safari.
- Đã **cho phép** cửa sổ bật lên (pop-up) đối với `localhost:3000` (tính năng Xem trước sẽ mở một tab mới).
- Một trình duyệt thứ hai hoặc profile trình duyệt khác (dành cho các bài test phối hợp giữa hai người dùng), kèm theo một cửa sổ ẩn danh (dành cho góc nhìn của khách truy cập).
- Cửa sổ dòng lệnh (terminal) mở tại thư mục dự án. Các lệnh bên dưới mặc định bạn đang đứng tại thư mục này.

**Nguyên tắc cốt lõi đằng sau thiết lập này:** nhật ký hoạt động (`audit_log`) không bao giờ có thể chỉnh sửa hay làm trống, và tài khoản người dùng chỉ có thể bị vô hiệu hóa chứ không bao giờ bị xóa. Do đó **mỗi tài khoản thử nghiệm bạn tạo sẽ lưu lại trong cơ sở dữ liệu mãi mãi.**
Đó là lý do hướng dẫn này sử dụng một **cơ sở dữ liệu dùng tạm có tên `vd_manual`** mà bạn sẽ xóa bỏ (drop) khi hoàn tất, thay vì dùng cơ sở dữ liệu dev hàng ngày `vietdragon`.

---

## 1. Khởi động server local — từng bước

### 1.1 Khởi động container cơ sở dữ liệu

```sh
docker compose -f compose.dev.yaml up -d
docker compose -f compose.dev.yaml ps          # đợi cho đến khi "db" báo (healthy)
```

(`compose.dev.yaml` đọc `POSTGRES_PASSWORD` từ tệp `.env` của bạn.)

### 1.2 Tạo cơ sở dữ liệu dùng tạm và trỏ terminal vào đó

```sh
docker compose -f compose.dev.yaml exec -T db psql -U vietdragon -d postgres -c "create database vd_manual"

# Tạo chuỗi URL từ tệp .env mà KHÔNG in mật khẩu ra màn hình, và lưu vào tệp cấu hình phụ trợ riêng:
URL=$(grep '^DATABASE_URL=' .env | cut -d= -f2-)
printf 'export DATABASE_URL="%s/vd_manual"\n' "${URL%/*}" > ~/.vd-manual.env
chmod 600 ~/.vd-manual.env
source ~/.vd-manual.env

echo "${DATABASE_URL##*/}"                      # phải in ra:  vd_manual
```

Lý do cơ chế này hoạt động: `pnpm dev`, `pnpm seed` và `pnpm admin:create` có đọc `.env`, nhưng **không bao giờ ghi đè biến môi trường bạn đã export sẵn trong terminal**, do đó tất cả các lệnh đều sẽ dùng `vd_manual` và không tác động đến `vietdragon`.
**Mỗi tab terminal mới cần chạy `source ~/.vd-manual.env` một lần** trước khi chạy bất kỳ lệnh `pnpm` nào bên dưới. Nếu sau này có dấu hiệu dùng nhầm cơ sở dữ liệu, hãy chạy lại lệnh `echo` ở trên để kiểm tra.

### 1.3 Tạo các bảng và nạp dữ liệu nội dung thật của website

```sh
pnpm db:migrate
pnpm seed
```

`pnpm seed` kết thúc với dòng chữ `Seeded. Revision 1 of every entity was written.` (Lệnh này cũng ghi lại tệp `docs/seed-report.md` local; điều đó hoàn toàn bình thường.)
Cơ sở dữ liệu lúc này đã chứa toàn bộ danh mục thực tế: 4 danh mục, 25 sản phẩm với 77 hình thức và 110 tùy chọn chất liệu, 44 chất liệu, 6 bài viết blog, 4 menu và toàn bộ văn bản giao diện, bằng năm ngôn ngữ.

*Tùy chọn, mất khoảng 5 giây — sao lưu một bản sạch cho phần 6 hoặc để bắt đầu lại nhanh chóng:*

```sh
docker compose -f compose.dev.yaml exec -T db pg_dump -U vietdragon -Fc vd_manual > ~/vd-manual-seed.dump
```

### 1.4 Tạo tài khoản quản trị viên (admin) đầu tiên

```sh
pnpm admin:create
```

Lệnh sẽ hỏi bốn mục trực tiếp trên terminal: `Email:`, `Full name:`, `New password:` và `Repeat password:` (mật khẩu bị ẩn khi nhập, **tối thiểu 12 ký tự**).
Hãy nhập dạng như `admin@example.test`. Tài khoản này **không** bị bắt buộc phải đổi mật khẩu ở lần đăng nhập đầu tiên.

### 1.5 Khởi động website và trang quản trị

```sh
pnpm dev
```

Đợi thông báo `Ready`, sau đó mở **http://localhost:3000** — gõ chính xác địa chỉ này.
**Không dùng `http://127.0.0.1:3000`**: chức năng đăng nhập kiểm tra địa chỉ trình duyệt khớp với `SITE_URL=http://localhost:3000`, nếu khác sẽ báo lỗi.

- Trang web công khai: http://localhost:3000 (Tiếng Việt), http://localhost:3000/en (Tiếng Anh)
- Trang quản trị: http://localhost:3000/admin/login — đăng nhập bằng tài khoản tạo ở mục 1.4.
- Lần đầu truy cập vào mỗi trang trong `pnpm dev` sẽ hơi chậm (do Next.js biên dịch theo yêu cầu - on demand). Đây không phải là lỗi; tốc độ thực tế sẽ được đánh giá ở bản chạy thử dạng production ở phần 6.

### 1.6 Tạo tài khoản thứ hai (đây cũng chính là bài test C1)

Đăng nhập với tư cách admin, mở mục «Người Dùng», và tạo một **biên tập viên (editor)** — bạn cần tài khoản này để kiểm tra phân quyền. Chi tiết xem tại mục C1 bên dưới.

### 1.7 Những gì lần chạy local này *không* kiểm thử

| Chưa bao gồm ở đây | Được kiểm thử tại |
|---|---|
| Gửi email tư vấn thực tế (chưa cấu hình SMTP: thông tin khách gửi form chỉ **ghi log trên terminal `pnpm dev`**, số điện thoại được che bớt) | Cần cấu hình mail thật khi deploy |
| Danh sách đường dẫn admin được Caddy cho phép (các đường dẫn ngoài danh sách sẽ trả về 404) | Phần 6 |
| Cookie chỉ hoạt động qua HTTPS, hệ thống file server chỉ đọc (read-only), tệp tải lên nằm trên volume riêng | Phần 6 |
| Sao lưu (backup) và phục hồi (restore) | Phần 6 |
| Tốc độ thực tế (bộ nhớ đệm cache, ISR) | Phần 6 |

### 1.8 Quên mật khẩu, bị khóa tài khoản, bắt đầu lại từ đầu

- Quên mật khẩu hoặc bị khóa: chạy `pnpm admin:reset-password someone@example.test` (nhập mật khẩu mới tại dấu nhắc ẩn; lệnh sẽ hủy các phiên đang mở và gỡ bỏ trạng thái khóa).
- Bắt đầu lại từ đầu: thực hiện phần 7 (xóa database), sau đó lặp lại các bước 1.2 – 1.4.

---

## 2. Tạo các tệp thử nghiệm để kiểm tra tính năng tải ảnh (upload)

Chạy tập lệnh này một lần. Lệnh sẽ tạo các ảnh hợp lệ để tải lên và các tệp **bắt buộc phải bị từ chối**. Chạy phần lệnh Node từ thư mục gốc của dự án (sử dụng thư viện xử lý ảnh có sẵn của dự án).

```sh
mkdir -p /tmp/vd-manual-fixtures

node -e '
const sharp = require("sharp");
const out = "/tmp/vd-manual-fixtures/";
const make = (name, w, h, bg, fmt) => sharp({ create: { width: w, height: h, channels: 3, background: bg } })[fmt]().toFile(out + name);
Promise.all([
  make("red-1200x800.jpg", 1200, 800, { r: 200, g: 40, b: 40 }, "jpeg"),
  make("green-800x800.png", 800, 800, { r: 30, g: 160, b: 80 }, "png"),
  make("blue-900x600.jpg", 900, 600, { r: 30, g: 80, b: 200 }, "jpeg"),
  make("huge-4200x3000.jpg", 4200, 3000, { r: 240, g: 180, b: 20 }, "jpeg"),
]).then(() => console.log("pictures ready"));
'

cd /tmp/vd-manual-fixtures
cp red-1200x800.jpg red-copy-of-the-same-picture.jpg
printf '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><script>alert(1)</script></svg>' > evil.svg
printf '<html><body><script>alert(1)</script></body></html>' > html-pretending-to-be-a-photo.jpg
echo "just some text" > notes.txt
head -c 11534338 /dev/zero > too-big-11mb.jpg
ls -la
```

Trong hộp thoại chọn tệp trên macOS, nhấn **Cmd+Shift+G** và gõ `/tmp/vd-manual-fixtures` để tìm đến thư mục này (trên Windows / Linux, hãy chọn thư mục tương ứng).

---

## 3. Phân vai kiểm thử

| Vai trò trong bài test | Nơi thao tác | Tài khoản |
|---|---|---|
| **Admin** | Cửa sổ trình duyệt chính | Tài khoản tạo ở mục 1.4 |
| **Editor** | Trình duyệt thứ hai (hoặc profile Chrome khác) | Tài khoản tạo ở mục C1 |
| **Visitor** | Cửa sổ riêng tư / ẩn danh | Không đăng nhập |

---

## 4. Danh sách kiểm tra (Checklist)

### A. Đăng nhập và phiên làm việc (Session)

- [ ] **[visitor]** Truy cập `http://localhost:3000/admin/content/product` khi chưa đăng nhập → bạn được chuyển đến trang đăng nhập và địa chỉ có chứa `?next=`. Sau khi đăng nhập thành công, bạn sẽ được đưa quay trở lại đúng trang ban đầu.
- [ ] **[visitor]** Đăng nhập với mật khẩu sai → hiển thị thông báo màu đỏ: *Email hoặc mật khẩu không đúng.* Thử với một email hoàn toàn không tồn tại trong hệ thống → hiển thị thông báo **giống hệt** (hệ thống không bao giờ tiết lộ email nào đã có tài khoản).
- [ ] **[editor]** *Khóa tài khoản (Lockout)* — hai cơ chế bảo vệ cùng hoạt động, vì vậy hãy thử thao tác này trên **một email bịa ra hoặc tài khoản editor, tuyệt đối không thử trên tài khoản admin duy nhất**. Nhập sai mật khẩu **5 lần liên tiếp**: mỗi lần đều nhận thông báo mật khẩu sai bình thường. Đến lần thứ **6** liên tiếp ngay sau đó, yêu cầu bị chặn bởi bộ giới hạn theo địa chỉ IP ("too many requests": 5 yêu cầu đăng nhập mỗi phút từ một máy tính). **Chờ 1 phút**, thử lại → lúc này cơ chế khóa tài khoản thực sự kích hoạt: *Quá nhiều lần đăng nhập sai. Vui lòng thử lại sau.* kèm thời gian còn lại (lần khóa đầu tiên kéo dài 5 phút tính từ lần thất bại thứ năm; mỗi lần khóa tiếp theo nhân đôi thời gian, tối đa 24 giờ). Trạng thái khóa áp dụng theo email, vì vậy ngay cả khi nhập *đúng* mật khẩu lúc này cũng bị từ chối. Lệnh `pnpm admin:reset-password <email>` sẽ giải phóng trạng thái khóa. (Một email bịa ra cũng nhận xử lý y hệt, nên cơ chế khóa không làm lộ việc tài khoản có tồn tại hay không).
- [ ] **[admin]** Đăng nhập với mật khẩu đúng → bạn được chuyển đến trang «Tài Khoản Của Tôi».
- [ ] **[editor]** *Đăng nhập lần đầu với tài khoản mới* (được tạo ở mục C1): bạn không thể mở bất kỳ trang quản trị nào; bạn được chuyển thẳng đến trang đổi mật khẩu với thông báo: *Đây là lần đăng nhập đầu tiên hoặc mật khẩu của bạn vừa được quản trị viên đặt lại…*
- [ ] **[editor]** Tại trang đổi mật khẩu (nút «Đổi Mật Khẩu»): ít hơn 12 ký tự → *Mật khẩu phải có từ 12 đến 128 ký tự.*; trùng mật khẩu hiện tại → *Mật khẩu mới phải khác mật khẩu hiện tại.*; không khớp ở «Nhập lại mật khẩu mới» → *Mật khẩu nhập lại không khớp.*; nhập hợp lệ sẽ cho phép vào hệ thống và chuyển đến «Tài Khoản Của Tôi». Hộp kiểm «Đăng xuất khỏi các thiết bị khác sau khi đổi mật khẩu» được đánh dấu mặc định. Cho đến khi bạn đổi mật khẩu xong, **mọi** địa chỉ `/admin/...` khác đều chuyển hướng bạn quay lại trang này.
- [ ] **[admin]** Bấm «Thoát» ở thanh bên (sidebar) → bạn được đưa về trang đăng nhập. *Hành vi đã biết:* nút Quay lại (Back) của trình duyệt có thể hiển thị lại trang admin trước đó **từ bộ nhớ đệm (cache) của trình duyệt** (trình duyệt không gửi yêu cầu lên server). Tải lại trang (F5/Reload), hoặc nhấp vào bất kỳ đâu → bạn sẽ ở trang đăng nhập, và không có dữ liệu mới nào được tải khi đã đăng xuất. Chỉ coi là lỗi nếu sau khi **tải lại trang** mà vẫn hiển thị dữ liệu admin.
- [ ] **[admin]** Nút chuyển đổi ở sidebar «Giao diện sáng» / «Giao diện tối» chuyển đổi giữa chế độ sáng và tối mượt mà, không bị chớp giật (flash) khi tải lại trang.
- [ ] **[visitor]** Trong cửa sổ ẩn danh, mở `http://localhost:3000/api/admin/content/product` → nhận phản hồi lỗi định dạng JSON (mã 401 Unauthorized), không lộ dữ liệu.

### B. «Tài Khoản Của Tôi» — trang cá nhân

- [ ] **[admin]** Trang hiển thị «Thông tin tài khoản» (họ tên, email, vai trò «Quản trị viên») và thẻ «Đổi mật khẩu».
- [ ] **[admin]** Mục «Phiên đăng nhập đang hoạt động» liệt kê mọi phiên đăng nhập của tài khoản này kèm thông tin trình duyệt và hệ điều hành (ví dụ: *Chrome trên macOS*), địa chỉ IP, thời gian đăng nhập và thời gian hết hạn (phiên tồn tại trong 12 giờ). Phiên hiện tại được đánh dấu **«Thiết bị này»**. Đăng nhập cùng tài khoản admin đó trên trình duyệt thứ hai → danh sách hiển thị 2 phiên. Bấm «Thu hồi» ở phiên kia (hoặc nút «Đăng xuất các thiết bị khác» ở trên cùng) → trình duyệt thứ hai sẽ bị đăng xuất ngay ở lần bấm chuột tiếp theo.
- [ ] **[admin]** Đổi mật khẩu của chính bạn (mật khẩu hiện tại / mới / nhập lại) → thành công; phiên trên trình duyệt khác sẽ bị chấm dứt nếu tích chọn ô «Đăng xuất khỏi các thiết bị khác…». Đăng nhập lại với mật khẩu mới.

### C. «Người Dùng» (Người Dùng & Phân Quyền) — chỉ dành cho Quản trị viên (Admin)

- [ ] **C1 [admin]** Bấm «Tạo tài khoản» → hộp thoại «Tạo tài khoản mới» hiện ra với các trường «Họ tên», «Email đăng nhập», «Vai trò» (chọn **«Biên tập viên»**; tùy chọn còn lại là «Quản trị viên»). Sau khi tạo, hộp thoại «Đã tạo tài khoản» sẽ hiển thị «Mật khẩu tạm thời cho …» **duy nhất một lần**, kèm nút «Sao chép» → «Đã chép» và nút «Tôi đã lưu mật khẩu». Khi đóng hộp thoại này, mật khẩu tạm thời sẽ không thể xem lại được nữa.
- [ ] **[admin]** Thẻ thông tin của người dùng mới hiển thị nhãn «Chờ đổi mật khẩu»; sau khi họ đăng nhập và đổi mật khẩu, nhãn chuyển thành «Đang hoạt động».
- [ ] **[admin]** Trên thẻ của editor, đổi lựa chọn trong menu thả xuống **«Vai trò»** → hộp thoại «Đổi vai trò» giải thích rằng quản trị viên có quyền quản lý người dùng và xem nhật ký; xác nhận → thông báo *Đã đổi vai trò.* Đổi lại vai trò như cũ.
- [ ] **[admin]** Bấm «Đặt lại mật khẩu» → hộp thoại thông báo: *Mọi phiên đăng nhập của họ sẽ bị đăng xuất và họ phải đổi mật khẩu khi đăng nhập lại.*; xác nhận → một mật khẩu tạm thời mới hiển thị một lần («Đã đặt lại mật khẩu») và thẻ người dùng hiển thị lại nhãn «Chờ đổi mật khẩu». Editor bắt buộc phải đổi mật khẩu ở lần đăng nhập tiếp theo.
- [ ] **[admin]** Bấm «Thu hồi phiên» → editor bị đăng xuất trên mọi thiết bị nhưng vẫn có thể đăng nhập lại bình thường.
- [ ] **[admin]** Bấm «Vô hiệu hóa» (hộp thoại thông báo: *Tài khoản và lịch sử không bị xóa*; có thể điền ô «Lý do (không bắt buộc)») → thông báo *Đã vô hiệu hóa tài khoản.* và thẻ hiển thị trạng thái «Đã vô hiệu hóa» kèm «Lý do: …». Trình duyệt của editor bị đăng xuất ngay lập tức, và nếu cố đăng nhập lại sẽ nhận thông báo: *Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.* Bấm «Kích hoạt lại» để khôi phục quyền truy cập (*Đã kích hoạt lại tài khoản …*).
- [ ] **[admin]** Thẻ tài khoản của chính bạn được đánh dấu nhãn «Bạn» và **không có** các nút đổi vai trò, đặt lại mật khẩu hay vô hiệu hóa (hệ thống hướng dẫn bạn vào «Tài Khoản Của Tôi»).
- [ ] **[editor]** Thanh bên (sidebar) của editor hoàn toàn không có mục «Người Dùng» và «Nhật Ký Hoạt Động». Nếu tự gõ `/admin/users` hoặc `/admin/audit` trên thanh địa chỉ, editor sẽ bị chuyển hướng về «Tài Khoản Của Tôi» kèm thông báo: *Tài khoản của bạn không có quyền truy cập trang vừa rồi.*
- [ ] *Tùy chọn — Độ tươi của phiên làm việc (Session freshness).* Các hành động nhạy cảm (đổi vai trò, đặt lại mật khẩu, vô hiệu hóa) yêu cầu phiên đăng nhập phải được tạo cách đây dưới 15 phút; nếu phiên cũ hơn, hệ thống sẽ yêu cầu đăng nhập lại («Đăng nhập lại»). Để kiểm tra mà không cần đợi, hãy làm già hóa phiên của admin trong database:
  ```sh
  docker compose -f compose.dev.yaml exec -T db psql -U vietdragon -d vd_manual -c \
    "update session set created_at = now() - interval '20 minutes' where user_id = (select id from app_user where email = 'admin@example.test')"
  ```
  Sau đó bấm thử «Vô hiệu hóa» tài khoản editor → bạn sẽ được yêu cầu đăng nhập lại, và sau khi đăng nhập lại thao tác sẽ thực hiện thành công.

### D. «Nhật Ký Hoạt Động» — chỉ dành cho Quản trị viên (Admin)

- [ ] Sau khi thực hiện các mục A–C, bảng nhật ký («Thời gian», «Người thực hiện», «Hành động», «Đối tượng», «Chi tiết») sẽ hiển thị các bản ghi theo thứ tự mới nhất trước: «Đăng nhập», «Đăng nhập sai» (chi tiết *failures: N*), «Khóa tài khoản tạm thời» (chi tiết *lockLevel: 1 · lockedUntil: …*), «Đăng xuất», «Đổi mật khẩu», «Tạo tài khoản», «Đổi vai trò», «Vô hiệu hóa tài khoản», «Kích hoạt lại tài khoản», «Đặt lại mật khẩu», «Thu hồi phiên đăng nhập» — mỗi bản ghi đều gắn đúng người thực hiện. Các lượt đăng nhập thất bại với email không tồn tại cũng được ghi nhận đầy đủ.
- [ ] Menu thả xuống «Hành động» liệt kê toàn bộ 19 loại hành động (các hành động ở trên cộng thêm «Nhập dữ liệu gốc của website», «Xuất bản nội dung», «Khôi phục phiên bản nội dung», «Hủy bản nháp», «Xóa nội dung», «Gỡ đường dẫn cũ», «Tải ảnh lên thư viện», «Xóa ảnh khỏi thư viện»). Chọn một hành động, hoặc nhập email vào ô «Người thực hiện (email)», sau đó bấm «Lọc» sẽ thu hẹp danh sách; bấm «Xóa lọc» sẽ đặt lại như cũ; nếu không có kết quả khớp sẽ hiển thị *Không có bản ghi nào khớp bộ lọc.*
- [ ] Phân trang hoạt động tốt («Trước» và nút trang tiếp theo) khi số hàng vượt quá một trang.
- [ ] Tuyệt đối không có cách nào chỉnh sửa hay xóa một hàng nhật ký (đây là thiết kế có chủ đích — trang có ghi rõ nhật ký chỉ ghi thêm / append-only).
- [ ] *Quay lại trang này sau khi hoàn thành các phần E–G:* Các hành động «Xuất bản nội dung», «Khôi phục phiên bản nội dung», «Hủy bản nháp», «Xóa nội dung», «Tải ảnh lên thư viện» và «Xóa ảnh khỏi thư viện» đều xuất hiện với đúng người thực hiện. (Việc tự động lưu bản nháp / autosave được chủ ý **không** ghi vào nhật ký).

### E. Vòng đời biên tập nội dung (Editor lifecycle)

Hãy làm quen quy trình một lần trên **«Đơn vị tính»** (loại nội dung nhỏ gọn nhất: «Cái», «Cuốn», «Hộp», «Tem», «Tờ»), sau đó lặp lại các thao tác tương tự trên các loại nội dung khác ở phần F. Sidebar → «Đơn vị tính».
Sẽ có hai đơn vị tính được sử dụng: **«Hộp»** (đơn vị có sẵn; tên của nó xuất hiện trên trang «In nhanh lấy liền» của website dưới dạng giá như *Chỉ từ 120.000đ/Hộp*, nên thay đổi sẽ nhìn thấy được ngay ngoài web) và một **đơn vị tính mới do bạn tạo** (để kiểm tra việc tạo mới, xác thực hợp lệ và xóa).

- [ ] **Danh sách.** Bảng có các cột «Tên», «Mã», «Trạng thái» (màu xanh `v1` = phiên bản đã xuất bản; màu hổ phách «Chưa xuất bản» = chưa từng xuất bản), «Cập nhật». Ô lọc «Lọc theo tên hoặc mã…» giúp thu hẹp danh sách hàng. Các đơn vị tính nạp sẵn từ seed hiển thị `v1`.
- [ ] **Chế độ chỉ đọc cho đến khi bạn yêu cầu chỉnh sửa.** Mở mục «Hộp»: màn hình hiển thị chip «Đã xuất bản · phiên bản 1», các tab ngôn ngữ (đều đạt 100%) và dòng thông báo: *Đang xem nội dung đã xuất bản. Bấm «Chỉnh sửa» để tạo bản nháp; website không đổi cho đến khi bạn xuất bản.* Không thể gõ vào trường tên. Bấm «Chỉnh sửa» → xuất hiện thêm chip thứ hai «Đang có bản nháp» và trường nhập liệu được mở khóa.
- [ ] **Tự động lưu (Autosave).** Đổi tên tiếng Việt thành `Hộp (thử)` → dòng trạng thái nhỏ dưới tiêu đề hiển thị «Có thay đổi chưa lưu…» → «Đang lưu…» → «Đã lưu lúc HH:MM». **Tải lại trang** → bản nháp vẫn còn đó («Đang có bản nháp», nội dung vừa nhập được giữ nguyên).
- [ ] **Xem trước (Preview).** Bấm «Xem trước» → **một** tab mới mở ra đúng trang web nơi dữ liệu này được sử dụng — ở đây là `/san-pham/in-nhanh` — với thanh thông báo trên đầu: *Đang xem bản nháp · 1 đang hiển thị* và dòng giá hiển thị *Chỉ từ 120.000đ/Hộp (thử)*. Bấm «Xem trước» lần nữa → tab này được **tái sử dụng** chứ không mở thêm tab mới. Mở `http://localhost:3000/san-pham/in-nhanh` trong cửa sổ **khách truy cập (visitor)** → vẫn hiển thị *…/Hộp*, không có thanh xem trước (khách vãng lai luôn thấy nội dung đã xuất bản chính thức). Bấm «Thoát xem trước» trên thanh thông báo để rời chế độ xem trước. *(Nếu tab bị chặn bạn sẽ thấy «Trình duyệt đã chặn cửa sổ mới…» — hãy cho phép pop-up và bấm lại).*
- [ ] **Xuất bản.** Bấm «Xuất bản…» → hộp thoại «Xuất bản» liệt kê các thay đổi và có ô «Ghi chú cho lịch sử (không bắt buộc)» — nhập vào `thử nghiệm`. Xác nhận bằng nút «Xuất bản» → chip đổi thành «Đã xuất bản · phiên bản 2», và cửa sổ của **khách truy cập (visitor)** hiển thị *…/Hộp (thử)* sau khi tải lại. Hàng của đơn vị tính này trong danh sách giờ đây hiển thị `v2`.
- [ ] **Lịch sử.** Thẻ «Lịch sử» → bấm «Xem lịch sử»: hiển thị *Phiên bản 2 · Cập nhật … · <tên bạn> · thử nghiệm* và *Phiên bản 1 · Nhập dữ liệu gốc … · Hệ thống · Dữ liệu gốc của website*. Bấm «So sánh» ở phiên bản 1 (hộp thoại «So sánh với phiên bản 1») sẽ liệt kê chi tiết từng trường thay đổi: *Sửa — Tên đơn vị (vi): Hộp → Hộp (thử)*. Bấm «Khôi phục» ở phiên bản 1 sẽ mở phiên bản đó **dưới dạng một bản nháp mới**: xuất hiện các chip «Đang có bản nháp» và «Khôi phục từ phiên bản 1», trường nhập liệu hiển thị `Hộp`, **và ngoài website vẫn hiển thị `Hộp (thử)`** cho đến khi bạn bấm xuất bản. Trong khi đang mở một bản nháp, nút «Khôi phục» sẽ bị mờ đi (tooltip giải thích: *Hãy xuất bản hoặc hủy bản nháp đang mở trước.*).
- [ ] **Hủy bản nháp.** Bấm «Hủy bản nháp» → hộp thoại thông báo: *Nội dung đang hiển thị trên website không bị ảnh hưởng.* Bấm «Giữ bản nháp» để quay lại; bấm «Hủy bản nháp» để xác nhận và bạn sẽ quay về giao diện chỉ đọc của bản đã xuất bản. *(Đưa mục «Hộp» về trạng thái bạn mong muốn: khôi phục phiên bản 1 rồi xuất bản, hoặc giữ nguyên tùy ý).*
- [ ] **Tạo mới [editor hoặc admin].** Bấm «Tạo đơn vị mới» → hộp thoại «Tạo đơn vị mới» yêu cầu nhập «Tên tiếng Việt *», «Tên tiếng Anh» (*Cần có trước khi xuất bản; có thể bổ sung sau.*) và «Mã» (tự động gợi ý từ tên, ví dụ `test-don-vi`; định dạng chữ thường, số và dấu gạch ngang, **không thể thay đổi sau này**). Chỉ nhập `Test đơn vị` → bấm «Tạo» → bạn được đưa vào trang chỉnh sửa với các chip «Chưa xuất bản» và «Đang có bản nháp». Mục này chưa hề xuất hiện ngoài website.
- [ ] **Xác thực dữ liệu (Validation).** Trên đơn vị tính mới đó, hộp cảnh báo màu vàng **«Cần bổ sung (1)»** đã liệt kê sẵn: *Tên đơn vị (en): Bắt buộc có nội dung tiếng Anh.*, và nút «Xuất bản…» bị làm mờ (tooltip thông báo: *Cần lưu xong và bổ sung đủ nội dung trước khi xuất bản.*). Bấm vào dòng trong hộp cảnh báo → tab **English** tự động mở ra («English 0%») và con trỏ chuột nhảy vào trường nhập liệu. Nhập `Test unit` → hộp cảnh báo biến mất và nút «Xuất bản…» sáng lên. Bấm xuất bản → chuyển thành «Đã xuất bản · phiên bản 1».
- [ ] **Đa ngôn ngữ.** Tiếng Việt **và** Tiếng Anh là hai ngôn ngữ bắt buộc để có thể xuất bản; việc để trống 中文 (tiếng Trung), 日本語 (tiếng Nhật), 한국어 (tiếng Hàn) hoàn toàn được phép (ngoài website sẽ tự động dùng nội dung tiếng Anh thay thế cho các ngôn ngữ này). Các tab hiển thị tỷ lệ % đã dịch.
- [ ] **Xung đột: Hai người cùng sửa một bản nháp.** Admin mở mục «Cái» → bấm «Chỉnh sửa» → gõ `Cái (A)` (đợi hiển thị «Đã lưu»). Trên trình duyệt của **editor**, mở mục «Cái»: editor **tiếp tục chỉnh sửa trên chính bản nháp đó** (các chip «Đang có bản nháp», trường nhập liệu đã có sẵn chữ `Cái (A)`); editor gõ tiếp thành `Cái (B)`. Quay lại trình duyệt của admin và gõ tiếp → trạng thái chuyển thành *Người khác vừa sửa bản nháp này* và một hộp cảnh báo màu vàng xuất hiện: ***Người khác vừa lưu bản nháp này, hoặc bản nháp không còn nữa.*** kèm hai nút: «Tải bản nháp mới nhất» (tải về `Cái (B)`, nội dung admin vừa gõ sau cùng sẽ bị mất) và «Giữ bản của tôi, ghi đè». Thử cả hai lựa chọn ở các lần khác nhau. Kết thúc bằng thao tác «Hủy bản nháp».
- [ ] **Xóa — với vai trò editor.** Trên đơn vị tính thử nghiệm vừa tạo: thẻ **«Sử dụng & xóa»** thông báo *Chỉ xóa được khi không còn nơi nào dùng đến.* và đối với editor sẽ ghi *Chỉ quản trị viên mới xóa được nội dung.* — hoàn toàn **không có** nút xóa.
- [ ] **Xóa — với vai trò admin.** Thẻ này trên tài khoản admin có nút «Xóa vĩnh viễn» → hộp thoại «Xóa vĩnh viễn?» hiện ra (*«Test đơn vị» sẽ bị xóa khỏi website. Lịch sử vẫn được giữ để khôi phục.*; các nút «Không xóa» / «Xóa vĩnh viễn») → bạn quay lại danh sách và hàng đó đã biến mất.
- [ ] **Từ chối xóa khi đang được sử dụng.** Mở mục «Hộp» (đang được các mục trong «In nhanh lấy liền» sử dụng): thẻ thông báo *Đang được dùng ở 1 nơi đang hiển thị và 0 bản nháp.* Thử bấm «Xóa vĩnh viễn» → xác nhận → không có gì bị xóa và thẻ báo lỗi: *Vẫn đang được dùng (1 mục đang hiển thị, 0 bản nháp). Hãy gỡ nó khỏi các mục đó trước.*
- [ ] **Các loại nội dung có trạng thái** (sản phẩm, bài viết, «In nhanh lấy liền»): thẻ ghi rõ mục này phải được lưu trữ trước — chuyển «Trạng thái» thành «Đã lưu trữ», xuất bản, và chỉ sau đó admin mới có thể xóa vĩnh viễn.

### F. Chi tiết từng loại nội dung

Có thể kiểm tra theo bất kỳ thứ tự nào. Nút «Tạo … mới» chỉ xuất hiện ở các loại có ghi chú **tạo mới**; hệ thống đã nạp sẵn 25 sản phẩm, 6 bài viết, 44 chất liệu và 4 menu.

- [ ] **«Sản phẩm»** (tạo mới, xóa). Mở một sản phẩm; 6 tab gồm «Thông tin chung», «Đường dẫn & SEO», «Hình thức», «Chất liệu», «Kích thước», «Thông số». Mỗi tab sẽ hiển thị số lượng lỗi nếu có vấn đề cần bổ sung.
  - [ ] Sửa tên ở tiếng Việt và tiếng Anh → xem trước → xuất bản → trang sản phẩm ngoài website thay đổi: `http://localhost:3000/san-pham/an-pham-tet/bao-li-xi` (và `/en/products/an-pham-tet/bao-li-xi`).
  - [ ] «Hình thức» (shapes) và «Chất liệu» (options): thêm mới, xóa bớt, sắp xếp lại thứ tự, đổi giá, thêm gạch đầu dòng mô tả, chọn ảnh từ thư viện. Mỗi lần thêm mới sẽ mở ra một thẻ riêng.
  - [ ] «Đường dẫn & SEO»: mỗi ngôn ngữ có địa chỉ riêng; việc thay đổi slug tiếng Việt của một sản phẩm **đã xuất bản** và xuất bản lại sẽ khiến địa chỉ **cũ** tự động chuyển hướng (308 redirect) về địa chỉ mới. Địa chỉ cũ được liệt kê ở chế độ chỉ đọc; nút «Gỡ» chỉ xuất hiện khi không có bản nháp nào đang mở và chỉ dành cho người có quyền xuất bản → hộp thoại «Gỡ đường dẫn cũ?» (*Giữ lại* / «Gỡ đường dẫn») → sau khi gỡ, địa chỉ cũ sẽ trả về lỗi 404.
  - [ ] Chuyển sản phẩm sang danh mục khác và xuất bản: toàn bộ các địa chỉ cũ vẫn tiếp tục hoạt động chuyển hướng bình thường.
  - [ ] «Tạo sản phẩm mới»: chọn danh mục và điền tên tiếng Việt và tiếng Anh → điền các thông tin còn lại → xuất bản → trang sản phẩm mở được tại địa chỉ mới (chưa nằm trong menu nào cho đến khi bạn thêm vào trong mục «Menu»).
- [ ] **«Danh mục»** (4 danh mục, không thể xóa). Đổi tên một slug → cảnh báo hiện ra nhắc rằng thao tác này sẽ làm thay đổi địa chỉ của toàn bộ sản phẩm trong danh mục đó ở ngôn ngữ tương ứng (các địa chỉ cũ vẫn tiếp tục hoạt động chuyển hướng).
- [ ] **«Menu»** (4 menu — «Tiếp thị», «Văn phòng», «Bao bì», «Ấn phẩm Tết»; không thể xóa, không thể tạo mới). Mega-menu của từng danh mục: «Cột N» → sản phẩm (mỗi thẻ hiển thị ví dụ: *Bao Lì Xì — 3 mục*) → các mục con («Hình thức» hoặc «Chất liệu»). Thử các thao tác: «Thêm cột», «Thêm sản phẩm vào cột này», «Thêm mục», «Chuyển sang cột khác», «Gỡ sản phẩm khỏi menu», «Xóa mục», «Xóa cột» (hộp thoại «Xóa cột?»). Một cột trống hiển thị *Cột này chưa có sản phẩm nào…* và sẽ không được lưu. Xuất bản → thanh menu trên website thay đổi.
- [ ] **«Bài viết»** (tạo mới, xóa). Tiêu đề và nội dung theo từng ngôn ngữ, định dạng văn bản thuần/markdown, chuyên mục («Chuyên mục»), ngày đăng, thời gian đọc, ảnh bìa. Bài viết mới xuất hiện tại `http://localhost:3000/bai-viet/<slug-cua-bai>` và nằm ở danh sách blog với thứ tự mới nhất xếp đầu. Chuyển trạng thái sang «Đã lưu trữ» và xuất bản → địa chỉ bài viết đó sẽ trả về 404.
- [ ] **«Chất liệu»**, **«Đặc điểm (biểu tượng)»**, **«Đơn vị tính»**, **«Thông số in»**, **«Chuyên mục bài viết»** (đều có thể tạo mới, xóa). Tạo một mục, sử dụng nó trong một sản phẩm hoặc bài viết, sau đó thử xóa nó → hệ thống từ chối xóa kèm số lượng nơi đang sử dụng. Mục «Thông số in» còn yêu cầu chọn «Loại thông số» khi tạo mới.
- [ ] **«In nhanh lấy liền»** (tạo mới, xóa). Chỉnh sửa giá và đơn vị tính → trang `http://localhost:3000/san-pham/in-nhanh` hiển thị dòng giá mới theo từng ngôn ngữ.
- [ ] **«Ảnh mẫu trang sản phẩm»** (tạo mới, xóa). Thêm hoặc đổi ảnh → thư viện trưng bày ảnh mẫu trên trang `http://localhost:3000/san-pham` thay đổi.
- [ ] **«Văn bản giao diện»** (30 nhóm; không tạo mới, không xóa). Chọn một nhóm, sửa **một** văn bản trong **một** ngôn ngữ, xuất bản → văn bản giao diện trên website thay đổi chỉ trong ngôn ngữ đó. Giữ nguyên mọi biến `{variable}` có trong văn bản tiếng Việt; nếu xóa biến sẽ bị từ chối lưu. Việc để trống một văn bản ở 中文/日本語/한국어 đồng nghĩa với việc "dùng văn bản tiếng Anh".

### G. «Thư viện ảnh» — Thư viện hình ảnh

- [ ] **[editor]** Trong database mới, lưới hiển thị thông báo *Chưa có ảnh nào được tải lên…*. Tải lên cùng lúc các file `red-1200x800.jpg`, `green-800x800.png`, `blue-900x600.jpg` (bằng nút «Chọn ảnh từ máy» hoặc kéo thả vào) → mỗi file một dòng kết quả, đều báo *— đã thêm vào thư viện.*; dòng tóm tắt ghi *Đã xử lý 3/3 ảnh.* và ba ô ảnh xuất hiện. *(Danh sách kết quả sẽ tiếp tục dài ra cho đến khi bạn bấm «Xóa danh sách» — hãy bấm nút này giữa các bước để giao diện gọn gàng).*
- [ ] **[editor]** Tải lên `huge-4200x3000.jpg` → được chấp nhận (ghi chú trên trang cho biết ảnh được chuyển thành định dạng WebP, tự động thu nhỏ nếu cạnh dài vượt quá 3000 px, và loại bỏ dữ liệu GPS). Bộ lọc thư mục lúc này hiển thị `uploads/2026 (4)`.
- [ ] **[editor]** Tải lên lại tệp `red-1200x800.jpg`, và tệp `red-copy-of-the-same-picture.jpg` (cùng nội dung ảnh nhưng khác tên file) → mỗi dòng đều báo: *— ảnh này đã có trong thư viện, không lưu thêm bản nữa.* và **không có thêm ô ảnh mới nào** xuất hiện (chống trùng lặp).
- [ ] **[editor]** Tải lên các file `evil.svg`, `html-pretending-to-be-a-photo.jpg`, `notes.txt` → xuất hiện ba dòng cảnh báo từ chối màu đỏ, không có file nào được thêm: *«evil.svg» là ảnh SVG: không nhận vì có thể chứa mã chạy trên trang…*, *«html-pretending-to-be-a-photo.jpg»: Đây là tệp HTML/XML, không phải ảnh…* (server phân tích nội dung thực của file chứ không nhìn vào phần mở rộng của tên file), *«notes.txt» không phải ảnh được hỗ trợ…*
- [ ] **[editor]** Tải lên `too-big-11mb.jpg` → bị từ chối ngay **trước khi** gửi lên server: *«too-big-11mb.jpg» nặng 11 MB, vượt giới hạn 10 MB. Hãy thu nhỏ ảnh rồi tải lên lại.*
- [ ] Các bộ lọc: «Đã tải lên» (mặc định) / «Tất cả ảnh» / «Có sẵn của website»; «Tất cả thư mục» + chọn một thư mục; gõ một phần tên file và bấm «Tìm». Nút «Mở ảnh» sẽ mở ảnh đó trong tab mới.
- [ ] **Bộ chọn ảnh (Media picker).** Trong một giao diện biên tập (ví dụ chọn ảnh bìa bài viết), mở bộ chọn ảnh → hiển thị đầy đủ các bộ lọc tương tự; với vai trò editor bạn có thể bấm «Tải ảnh lên» trực tiếp từ hộp thoại này và ảnh mới sẽ được điền vào ô ngay lập tức. Tự động lưu, xem trước và xuất bản → ảnh xuất hiện ngoài website.
- [ ] **[editor]** Các ô ảnh của editor chỉ có nút «Mở ảnh», không có nút «Xóa». **[admin]** Các ô ảnh của admin có thêm nút «Xóa» → hộp thoại «Xóa ảnh khỏi thư viện?» (*Ảnh bị xóa khỏi máy chủ, không khôi phục được.*, kèm đường dẫn file; các nút «Giữ lại» / «Xóa ảnh»). Với ảnh chưa được sử dụng ở đâu, ảnh sẽ bị xóa (ô ảnh biến mất và URL của ảnh trả về 404). Với ảnh đang được một bài viết hoặc sản phẩm sử dụng, thao tác xóa **bị từ chối** kèm số liệu cụ thể (đang hiển thị chính thức hay trong bản nháp) và hộp thoại vẫn mở — hãy chọn thử một ảnh làm ảnh bìa bài viết, xuất bản rồi thử xóa để kiểm chứng.
- [ ] Ảnh có sẵn mặc định của hệ thống («Có sẵn của website») không ai có quyền xóa.

### H. Kiểm tra website công khai sau khi xuất bản — **[visitor]**

- [ ] Thay đổi đã xuất bản ở mục E/F hiển thị ngay sau khi F5 bình thường, không cần khởi động lại bất kỳ dịch vụ nào, và chỉ hiển thị đúng ngôn ngữ đã sửa.
- [ ] Trình chuyển đổi ngôn ngữ trên thanh điều hướng chuyển đúng đến **cùng một trang** ở ngôn ngữ khác (đúng địa chỉ URL riêng của ngôn ngữ đó), áp dụng từ trang chủ, trang sản phẩm, trang bài viết cho đến trang «In nhanh lấy liền».
- [ ] Địa chỉ URL cũ của sản phẩm tự động chuyển hướng về địa chỉ hiện tại (xem mục F «Đường dẫn & SEO»); một địa chỉ chưa từng tồn tại sẽ hiển thị trang 404 thân thiện đúng ngôn ngữ.
- [ ] Nút báo giá «Nhận Báo Giá» mở form yêu cầu; nhập số điện thoại di động Việt Nam hợp lệ và gửi đi sẽ hiển thị thông báo cảm ơn. **Trong terminal đang chạy `pnpm dev`**, bạn sẽ thấy một dòng JSON kết thúc bằng: *"msg":"consult lead not emailed: SMTP is not configured"* với số điện thoại được che bớt thành dạng `0901***567` (vì ở môi trường local chưa có mail server).
- [ ] Số điện thoại không đúng định dạng (ví dụ `123`) sẽ bị form từ chối (server phản hồi: *Số điện thoại không hợp lệ*).
- [ ] Truy cập `http://localhost:3000/sitemap.xml` và `/robots.txt` tải bình thường; sitemap liệt kê các trang bạn đã xuất bản và không có các bản nháp.

### I. Bảng tổng hợp phân quyền theo vai trò

Đánh dấu vào từng ô khi bạn xác minh xong.

| Thao tác | Quản trị viên (Admin) | Biên tập viên (Editor) |
|---|---|---|
| Tạo mới, chỉnh sửa, xem trước, hủy bản nháp | [ ] Có | [ ] Có |
| Xuất bản, khôi phục phiên bản | [ ] Có | [ ] Có |
| «Xóa vĩnh viễn» (delete) | [ ] Có | [ ] Không — hiển thị thông báo |
| Gỡ đường dẫn cũ («Gỡ») | [ ] Có | [ ] Có |
| Tải ảnh lên thư viện | [ ] Có | [ ] Có |
| Xóa ảnh khỏi thư viện | [ ] Có | [ ] Không |
| «Người Dùng» (tạo, phân vai trò, đặt lại mật khẩu, vô hiệu hóa) | [ ] Có | [ ] Không — bị chuyển hướng |
| «Nhật Ký Hoạt Động» | [ ] Có | [ ] Không — bị chuyển hướng |
| Tài khoản cá nhân: đổi mật khẩu, thu hồi phiên | [ ] Có | [ ] Có |

---

## 5. Vị trí các trang và đường dẫn

| Mục | Địa chỉ |
|---|---|
| Đăng nhập | `/admin/login` |
| Tài khoản cá nhân / Đổi mật khẩu | `/admin/account` · `/admin/account/password` |
| Quản lý người dùng · Nhật ký hoạt động | `/admin/users` · `/admin/audit` |
| Thư viện ảnh | `/admin/media` |
| Danh sách quản lý nội dung | `/admin/content/<type>` trong đó `<type>` là: `product`, `category`, `menu`, `post`, `material`, `trait`, `unit`, `spec-item`, `post-category`, `fast-print-item`, `showcase-item`, `site-message` |
| Một số trang công khai tiêu biểu cần xem | `/` · `/en` · `/san-pham` · `/san-pham/an-pham-tet/bao-li-xi` · `/san-pham/an-pham-tet/lich-tet` · `/bai-viet` · `/bai-viet/bao-bi-fnb-local-brand` · `/san-pham/in-nhanh` |

---

## 6. Tùy chọn: Kiểm tra tương tự trên stack mô phỏng production

Lệnh `pnpm dev` không hoàn toàn phản ánh môi trường thực tế khi triển khai. Phần này sẽ chạy các image container thực tế đứng sau Caddy qua HTTPS ngay trên máy tính của bạn, giúp kiểm thử những điều môi trường dev không làm được: danh sách đường dẫn admin được Caddy cho phép, cookie bảo mật HTTPS, tải file lên một container ở chế độ chỉ đọc (read-only), sao lưu và phục hồi. **Lần build đầu tiên mất khoảng 7 phút.** Cần tệp seed dump đã tạo từ bước 1.3 (`~/vd-manual-seed.dump`).

```sh
SP=~/vd-local-stack ; mkdir -p $SP
cat > $SP/stack.env <<EOF
SITE_ADDRESS=localhost
SITE_URL=https://localhost:8443
POSTGRES_PASSWORD=$(openssl rand -hex 24)
APP_DB_PASSWORD=$(openssl rand -hex 24)
BETTER_AUTH_SECRET=$(openssl rand -hex 32)
SMTP_HOST=x
SMTP_USER=x
SMTP_PASS=x
HTTP_PORT=8080
HTTPS_PORT=8443
APP_TAG=local
EOF
chmod 600 $SP/stack.env
dc() { docker compose --env-file $SP/stack.env -p vdlocal "$@"; }     # định nghĩa lại trong mỗi terminal mới

dc --profile tools build            # ~7 phút cho lần chạy đầu
dc up -d                            # database, migrations, app, Caddy, backup
dc stop app
dc --profile tools run --rm -v ~/vd-manual-seed.dump:/import/seed.dump:ro restore --dump /import/seed.dump   # nạp nội dung website
dc up -d
dc --profile tools run --rm admin-cli create       # tạo admin đầu tiên (4 câu hỏi tương tự như trước)
```

Mở **https://localhost:8443** — trình duyệt sẽ cảnh báo về chứng chỉ bảo mật (do Caddy tự sinh chứng chỉ tự ký cho `localhost`); hãy chọn tiếp tục truy cập. Sau đó lặp lại bất kỳ bài test nào trong phần 4 bạn quan tâm, và bổ sung thêm các mục sau:

- [ ] `https://localhost:8443/admin/login` mở được; `https://localhost:8443/admin/blog` và `/admin/bat-ky-duong-dan-nao-khac` trả về **404** (Caddy chỉ cho phép các đường dẫn admin hợp lệ đã biết đi qua).
- [ ] Đăng nhập hoạt động bình thường, và các trình biên tập, Xem trước (Preview) cùng Thư viện ảnh hoạt động y hệt như môi trường dev. (Form yêu cầu tư vấn sẽ báo lỗi ở đây do `SMTP_HOST=x` không phải mail server thật. Điều này hoàn toàn đúng như dự kiến.)
- [ ] Tải lên một bức ảnh, xuất bản một sản phẩm sử dụng ảnh đó → ảnh hiển thị ngoài website; khởi động lại toàn bộ stack bằng lệnh `dc down` rồi `dc up -d` → ảnh, sản phẩm và phiên đăng nhập của bạn vẫn còn nguyên.
- [ ] Sao lưu (Backup): lệnh `dc exec backup backup` kết thúc với dòng chữ `verified`; `dc exec backup ls /backups` hiển thị các tệp bản sao lưu. Sửa đổi một nội dung trong admin, sau đó chạy `dc stop app` và `dc --profile tools run --rm restore latest` rồi `dc up -d` → nội dung vừa sửa bị hủy bỏ, toàn bộ dữ liệu trở về trạng thái bản sao lưu.
- [ ] Kiểm tra Response Headers: `curl -skI https://localhost:8443/ | grep -iE 'strict-transport|x-frame|content-security|permissions-policy'` hiển thị mỗi header đúng một lần duy nhất.

Dọn dẹp sau khi kiểm thử xong (thao tác này xóa dữ liệu của stack mô phỏng, không ảnh hưởng đến database dev của bạn):

```sh
dc --profile tools down -v
docker rmi viet-dragon-app:local viet-dragon-tools:local viet-dragon-backup:local
rm -rf ~/vd-local-stack
```

---

## 7. Dừng và dọn dẹp môi trường

```sh
# Dừng dev server bằng tổ hợp phím Ctrl+C trong terminal đang chạy, sau đó:
docker compose -f compose.dev.yaml exec -T db psql -U vietdragon -d postgres -c "drop database if exists vd_manual with (force)"
rm -f ~/.vd-manual.env ~/vd-manual-seed.dump
rm -rf /tmp/vd-manual-fixtures
docker compose -f compose.dev.yaml stop
```

Cơ sở dữ liệu dev hàng ngày `vietdragon` của bạn (nằm trong Docker volume `viet-dragon_pgdata_dev`) không hề bị ảnh hưởng bởi bất kỳ thao tác nào ở trên. Để kiểm thử lại sau này, chỉ cần thực hiện lại các bước 1.1 – 1.5.

---

## 8. Khi gặp sự cố

**Hãy ghi lại rõ ràng cho từng vấn đề:** địa chỉ trang gặp lỗi, các bước tái hiện chính xác, thông báo bằng tiếng Việt bạn nhìn thấy (sao chép nguyên văn), thao tác bằng tài khoản nào (admin hay editor), và log hiển thị trong terminal đang chạy `pnpm dev` tại thời điểm đó (các lỗi sẽ hiện màu đỏ ở đây). Chụp ảnh màn hình cũng rất hữu ích. Mở Developer Tools của trình duyệt (F12) → tab Console để xem các lỗi màu đỏ.

**Những hiện tượng trông giống lỗi nhưng thực tế là hành vi đúng:**

| Bạn nhìn thấy | Nguyên nhân |
|---|---|
| Đăng nhập thất bại kèm lỗi 403 / origin error | Bạn đang mở bằng `127.0.0.1` hoặc cổng khác; phải dùng chính xác `http://localhost:3000` |
| «Xem trước» báo trình duyệt đã chặn cửa sổ mới | Hãy cho phép mở pop-up đối với localhost, sau đó bấm lại nút xem trước |
| Chế độ Xem trước hiển thị website trực tiếp, không có thanh thông báo | Bạn chưa đăng nhập trên cửa sổ đó, hoặc tài khoản chưa đổi mật khẩu tạm thời |
| Nút Back của trình duyệt vẫn hiển thị trang admin sau khi đã đăng xuất | Do bộ nhớ đệm (cache) cục bộ của trình duyệt; tải lại trang sẽ đưa bạn về trang đăng nhập (xem mục A) |
| Form đăng nhập giữ nguyên (hoặc báo "quá nhiều lần thử") sau vài lần đăng nhập liên tiếp | Do cơ chế giới hạn tần suất theo IP: 5 yêu cầu đăng nhập mỗi phút từ một máy tính, **mọi** lượt thử đều được tính, bao gồm cả những lần đăng nhập thành công của tài khoản khác. Chờ 1 phút |
| Tài khoản bị khóa | Nhập sai mật khẩu 5 lần liên tiếp sẽ khóa email đó trong 5 phút (thời gian nhân đôi ở các lần sau); dùng lệnh `pnpm admin:reset-password` để mở khóa |
| Mỗi trang đều tải chậm ở lần truy cập đầu tiên | Do môi trường `pnpm dev` biên dịch mã nguồn theo yêu cầu (on-demand compilation) |
| Lệnh `git status` hiển thị file `AGENTS.md` bị thay đổi sau khi chạy `pnpm dev` | Dev server của Next.js 16.4 tự động chèn một đoạn ngắn "This is NOT the Next.js you know" vào `AGENTS.md` và tự thêm lại nếu bị xóa. Điều này vô hại (nó chỉ lặp lại lưu ý ở đầu file). Bạn có thể commit nó trong lần commit tiếp theo, hoặc chạy `git checkout -- AGENTS.md` trước khi commit |
| Form yêu cầu tư vấn báo đã gửi, nhưng không nhận được email | Môi trường local không có mail server; thông tin khách hàng được ghi log trong terminal dev |
| Nút «Khôi phục» bị mờ không bấm được | Đang có một bản nháp mở; hãy xuất bản hoặc hủy bản nháp đó trước |
| Nút «Xuất bản…» bị mờ không bấm được | Bản nháp vẫn đang trong quá trình tự lưu, hoặc hộp «Cần bổ sung» đang liệt kê các trường bắt buộc cần điền |
| Không thể xóa một sản phẩm hoặc bài viết | Mục đó bắt buộc phải được lưu trữ trước (chuyển «Trạng thái» thành «Đã lưu trữ» và xuất bản) |
| Không thể xóa một tài khoản thử nghiệm | Đây là thiết kế có chủ đích — tài khoản chỉ có thể bị vô hiệu hóa; các tài khoản này sẽ tự động biến mất khi bạn xóa cơ sở dữ liệu `vd_manual` |
