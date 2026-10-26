# Admin — manual testing guide

How to run the site on your own computer and walk through every part of the admin by hand before anything is deployed.
Plan on **about 2 hours** for a full pass (the checklist in section 4 is the long part). You can stop after any area and carry on later: the data stays in your test database until you drop it.

- Screen labels are quoted exactly as they appear on screen, in Vietnamese: «Chỉnh sửa», «Xuất bản…». Everything else is in English.
- Each checklist line is **Do → Expect**. Tick the box (`- [x]`) as you go; copy this file first if you want a clean copy for the next round.
- Tags: **[admin]**, **[editor]**, **[visitor]** say who does the step. A *visitor* is a private/incognito window that is not signed in.
- Everything here is local. Nothing in this guide touches a server, the live website or your everyday dev database.

---

## 0. Before you start

You need:

- Docker Desktop running, and `pnpm install` done in the repository.
- **Chrome** (or Firefox). The Preview feature sets a cookie that browsers only accept on plain `http://localhost` in Chrome/Firefox, not in Safari.
- Pop-ups **allowed** for `localhost:3000` (Preview opens a new tab).
- A second browser or browser profile (for the two-people tests), plus a private window (for the visitor view).
- A terminal in the repository folder. The commands below assume you are in it.

**The one rule behind the setup:** the activity log (`audit_log`) can never be edited or emptied, and user accounts can only be deactivated, never deleted. So **every test account you create stays in the database forever.**
That is why this guide uses a **throwaway database called `vd_manual`** that you drop at the end, instead of your everyday dev database `vietdragon`.

---

## 1. Start the local server — step by step

### 1.1 Start the database container

```sh
docker compose -f compose.dev.yaml up -d
docker compose -f compose.dev.yaml ps          # wait until "db" says (healthy)
```

(`compose.dev.yaml` reads `POSTGRES_PASSWORD` from your `.env`.)

### 1.2 Create the throwaway database and point your terminal at it

```sh
docker compose -f compose.dev.yaml exec -T db psql -U vietdragon -d postgres -c "create database vd_manual"

# Build its URL from your .env WITHOUT printing the password, and keep it in a private helper file:
URL=$(grep '^DATABASE_URL=' .env | cut -d= -f2-)
printf 'export DATABASE_URL="%s/vd_manual"\n' "${URL%/*}" > ~/.vd-manual.env
chmod 600 ~/.vd-manual.env
source ~/.vd-manual.env

echo "${DATABASE_URL##*/}"                      # must print:  vd_manual
```

Why this works: `pnpm dev`, `pnpm seed` and `pnpm admin:create` read `.env`, but **never overwrite a variable you already exported**, so they all use `vd_manual` and leave `vietdragon` alone.
**Every new terminal tab needs `source ~/.vd-manual.env` once** before running any `pnpm` command below. If something later seems to be using the wrong database, run the `echo` line again.

### 1.3 Create the tables and load the real site content

```sh
pnpm db:migrate
pnpm seed
```

`pnpm seed` ends with `Seeded. Revision 1 of every entity was written.` (It also rewrites the local `docs/seed-report.md`; that is normal.)
The database now holds the real catalog: 4 categories, 25 products with 77 shapes and 110 material options, 44 materials, 6 blog posts, 4 menus and all the interface texts, in five languages.

*Optional, 5 seconds — keep a clean copy for section 6 or for starting over quickly:*

```sh
docker compose -f compose.dev.yaml exec -T db pg_dump -U vietdragon -Fc vd_manual > ~/vd-manual-seed.dump
```

### 1.4 Create the first admin account

```sh
pnpm admin:create
```

It asks four things at a real terminal: `Email:`, `Full name:`, `New password:` and `Repeat password:` (the password is hidden, **at least 12 characters**).
Use something like `admin@example.test`. This account is **not** forced to change its password at first sign-in.

### 1.5 Start the website and the admin

```sh
pnpm dev
```

Wait for `Ready`, then open **http://localhost:3000** — type exactly that address.
**Do not use `http://127.0.0.1:3000`**: sign-in checks that the browser's address matches `SITE_URL=http://localhost:3000` and answers an error otherwise.

- The public site: http://localhost:3000 (Vietnamese), http://localhost:3000/en
- The admin: http://localhost:3000/admin/login — sign in with the account from 1.4.
- The first visit to every page is slow in `pnpm dev` (it compiles on demand). That is not a bug; judge speed on the production-shaped run in section 6.

### 1.6 Create the second account (this is also test C1)

Sign in as the admin, open «Người Dùng», and create an **editor** — you need one for the permission tests. Details in C1 below.

### 1.7 What this local run does *not* test

| Not covered here | Covered in |
|---|---|
| Sending the consultation e-mail (no SMTP: the lead is only **logged in the `pnpm dev` terminal**, phone number masked) | needs real mail settings at deploy time |
| Caddy's admin path allow-list (paths off the list answer 404) | section 6 |
| HTTPS-only cookies, the read-only server filesystem, uploads on a volume | section 6 |
| Backups and restore | section 6 |
| Real speed (caches, ISR) | section 6 |

### 1.8 Forgotten password, locked out, start over

- Forgot or locked out: `pnpm admin:reset-password someone@example.test` (new password at the hidden prompt; it ends their sessions and lifts a lock).
- Start over from nothing: do section 7 (drop the database), then repeat 1.2 – 1.4.

---

## 2. Test files for the upload checks

Run this once. It makes pictures to upload and files that **must be refused**. Run the Node part from the repository folder (it uses the project's own image library).

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

In a file chooser on macOS press **Cmd+Shift+G** and type `/tmp/vd-manual-fixtures` to get to them.

---

## 3. Who is who

| Role in the tests | Where | Account |
|---|---|---|
| **Admin** | your main browser window | the account from 1.4 |
| **Editor** | a second browser (or a Chrome profile) | created in C1 |
| **Visitor** | a private/incognito window | not signed in |

---

## 4. The checklist

### A. Sign-in and session

- [ ] **[visitor]** Open `http://localhost:3000/admin/content/product` while signed out → you land on the login page and the address contains `?next=`. After signing in you arrive back where you were headed.
- [ ] **[visitor]** Sign in with a wrong password → a red notice *Email hoặc mật khẩu không đúng.* Try an e-mail that does not exist at all → the **identical** message (it never reveals which addresses have an account).
- [ ] **[editor]** *Lockout* — two protections work together, so do this on a **made-up e-mail or the editor account, never the only admin**. Give a wrong password **five times in a row**: each answer is the ordinary wrong-password notice. The **sixth** attempt, straight away, is refused by the per-address limiter ("too many requests": 5 sign-in requests a minute from one computer). **Wait one minute**, try again → now the real lock: *Quá nhiều lần đăng nhập sai. Vui lòng thử lại sau.* with the time left (the first lock lasts 5 minutes from the fifth failure; each further lock doubles it, up to 24 hours). The lock applies to the e-mail, so even the *correct* password is refused meanwhile. `pnpm admin:reset-password <email>` lifts it. (A made-up e-mail gets exactly the same treatment, so the lock never reveals whether an account exists.)
- [ ] **[admin]** Sign in with the right password → you land on «Tài Khoản Của Tôi».
- [ ] **[editor]** *First sign-in of a new account* (created in C1): you cannot open any admin page; you are sent to the password-change page, which says *Đây là lần đăng nhập đầu tiên hoặc mật khẩu của bạn vừa được quản trị viên đặt lại…*
- [ ] **[editor]** On that page (button «Đổi Mật Khẩu»): fewer than 12 characters → *Mật khẩu phải có từ 12 đến 128 ký tự.*; the same as the current one → *Mật khẩu mới phải khác mật khẩu hiện tại.*; a mismatch in «Nhập lại mật khẩu mới» → *Mật khẩu nhập lại không khớp.*; a good one lets you in and lands on «Tài Khoản Của Tôi». The box «Đăng xuất khỏi các thiết bị khác sau khi đổi mật khẩu» is ticked by default. Until you change it, **every** other `/admin/...` address sends you back to this page.
- [ ] **[admin]** Use «Thoát» in the sidebar → you land on the login page. *Known behaviour:* the browser's Back button may show the previous admin page again **from the browser's memory** (it does not ask the server). Reload it, or click anything → you are on the login page, and no new data is ever loaded while signed out. Flag it only if a **reload** still shows admin data.
- [ ] **[admin]** The sidebar toggles «Giao diện sáng» / «Giao diện tối» switch light and dark without a flash on reload.
- [ ] **[visitor]** In a private window open `http://localhost:3000/api/admin/content/product` → a JSON error (401), not data.

### B. «Tài Khoản Của Tôi» — your own account

- [ ] **[admin]** The page shows «Thông tin tài khoản» (name, e-mail, role «Quản trị viên») and a «Đổi mật khẩu» card.
- [ ] **[admin]** «Phiên đăng nhập đang hoạt động» lists every sign-in of this account with the browser and system (e.g. *Chrome trên macOS*), the address, the sign-in time and the expiry (sessions last 12 hours). The current one is marked **«Thiết bị này»**. Sign in as the same admin in a second browser → the list shows two. «Thu hồi» on the other one (or «Đăng xuất các thiết bị khác» at the top) → that browser is signed out on its next click.
- [ ] **[admin]** Change your own password (current / new / repeat) → success; the other browser's session ends if the «Đăng xuất khỏi các thiết bị khác…» box was ticked. Sign in again with the new password.

### C. «Người Dùng» (Người Dùng & Phân Quyền) — admin only

- [ ] **C1 [admin]** «Tạo tài khoản» → dialog «Tạo tài khoản mới» with «Họ tên», «Email đăng nhập», «Vai trò» (choose **«Biên tập viên»**; the other option is «Quản trị viên»). After creating, the dialog «Đã tạo tài khoản» shows «Mật khẩu tạm thời cho …» **once**, with «Sao chép» → «Đã chép» and the button «Tôi đã lưu mật khẩu». Close it and the password cannot be shown again.
- [ ] **[admin]** The new user's card shows «Chờ đổi mật khẩu»; after they sign in and change it, «Đang hoạt động».
- [ ] **[admin]** On the editor's card change the **«Vai trò»** drop-down → the dialog «Đổi vai trò» explains that an admin can manage users and see the log; confirm → *Đã đổi vai trò.* Change it back.
- [ ] **[admin]** «Đặt lại mật khẩu» → the dialog says *Mọi phiên đăng nhập của họ sẽ bị đăng xuất và họ phải đổi mật khẩu khi đăng nhập lại.*; confirm → a new temporary password is shown once («Đã đặt lại mật khẩu») and the card shows «Chờ đổi mật khẩu» again. The editor must change it at the next sign-in.
- [ ] **[admin]** «Thu hồi phiên» → the editor is signed out on every device but can sign in again.
- [ ] **[admin]** «Vô hiệu hóa» (the dialog says *Tài khoản và lịch sử không bị xóa*; optionally fill «Lý do (không bắt buộc)») → *Đã vô hiệu hóa tài khoản.* and the card shows «Đã vô hiệu hóa» with «Lý do: …». The editor's browser is signed out at once, and trying to sign in gives *Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.* «Kích hoạt lại» restores access (*Đã kích hoạt lại tài khoản …*).
- [ ] **[admin]** Your own card is marked «Bạn» and has **no** buttons for role change, reset or deactivation (it points you to «Tài Khoản Của Tôi»).
- [ ] **[editor]** The sidebar shows no «Người Dùng» and no «Nhật Ký Hoạt Động». Typing `/admin/users` or `/admin/audit` in the address bar sends you to «Tài Khoản Của Tôi» with *Tài khoản của bạn không có quyền truy cập trang vừa rồi.*
- [ ] *Optional — session freshness.* Sensitive actions (role change, reset password, deactivate) need a session younger than 15 minutes; an older one is asked to sign in again («Đăng nhập lại»). To see it without waiting, age the admin's session:
  ```sh
  docker compose -f compose.dev.yaml exec -T db psql -U vietdragon -d vd_manual -c \
    "update session set created_at = now() - interval '20 minutes' where user_id = (select id from app_user where email = 'admin@example.test')"
  ```
  Then try «Vô hiệu hóa» on the editor → you are asked to sign in again, and after doing so the action works.

### D. «Nhật Ký Hoạt Động» — activity log, admin only

- [ ] After sections A–C the table («Thời gian», «Người thực hiện», «Hành động», «Đối tượng», «Chi tiết») shows, newest first: «Đăng nhập», «Đăng nhập sai» (detail *failures: N*), «Khóa tài khoản tạm thời» (detail *lockLevel: 1 · lockedUntil: …*), «Đăng xuất», «Đổi mật khẩu», «Tạo tài khoản», «Đổi vai trò», «Vô hiệu hóa tài khoản», «Kích hoạt lại tài khoản», «Đặt lại mật khẩu», «Thu hồi phiên đăng nhập» — each with the right person. Failed attempts on an e-mail that does not exist are logged too.
- [ ] The «Hành động» drop-down lists all 19 kinds (the ones above plus «Nhập dữ liệu gốc của website», «Xuất bản nội dung», «Khôi phục phiên bản nội dung», «Hủy bản nháp», «Xóa nội dung», «Gỡ đường dẫn cũ», «Tải ảnh lên thư viện», «Xóa ảnh khỏi thư viện»). Choosing one, or typing an e-mail into «Người thực hiện (email)», then «Lọc» narrows the list; «Xóa lọc» restores it; with no match you see *Không có bản ghi nào khớp bộ lọc.*
- [ ] Paging works («Trước» and the next button) once there are more rows than one page.
- [ ] There is no way to edit or delete a row (that is intended — the page says the log is append-only).
- [ ] *Come back to this page after sections E–G:* «Xuất bản nội dung», «Khôi phục phiên bản nội dung», «Hủy bản nháp», «Xóa nội dung», «Tải ảnh lên thư viện» and «Xóa ảnh khỏi thư viện» are there with the right person. (Autosaves of a draft are deliberately **not** logged.)

### E. The editor lifecycle

Learn it once on **«Đơn vị tính»** (units — the smallest type: «Cái», «Cuốn», «Hộp», «Tem», «Tờ»), then repeat the same moves on the other types in section F. Sidebar → «Đơn vị tính».
Two units are used: **«Hộp»** (existing; its name appears on the website's «In nhanh lấy liền» page as prices like *Chỉ từ 120.000đ/Hộp*, so a change is visible to visitors) and a **new unit you create** (to test creation, validation and deletion).

- [ ] **List.** The table has «Tên», «Mã», «Trạng thái» (green `v1` = published version; amber «Chưa xuất bản» = never published), «Cập nhật». The filter box «Lọc theo tên hoặc mã…» narrows the rows. Seeded units show `v1`.
- [ ] **Read-only until you ask.** Open «Hộp»: it shows the chip «Đã xuất bản · phiên bản 1», the language tabs (all 100%) and this notice: *Đang xem nội dung đã xuất bản. Bấm «Chỉnh sửa» để tạo bản nháp; website không đổi cho đến khi bạn xuất bản.* The name field cannot be typed in. Click «Chỉnh sửa» → a second chip «Đang có bản nháp» appears and the field unlocks.
- [ ] **Autosave.** Change the Vietnamese name to `Hộp (thử)` → the small status under the title shows «Có thay đổi chưa lưu…» → «Đang lưu…» → «Đã lưu lúc HH:MM». **Reload the page** → the draft is still there («Đang có bản nháp», your text kept).
- [ ] **Preview.** Click «Xem trước» → **one** new tab opens on the page where this record is used — here `/san-pham/in-nhanh` — with the bar *Đang xem bản nháp · 1 đang hiển thị* and the price line reading *Chỉ từ 120.000đ/Hộp (thử)*. Click «Xem trước» again → the **same** tab is reused. Open `http://localhost:3000/san-pham/in-nhanh` in the **visitor** window → it still says *…/Hộp*, with no bar (visitors always see the published site). «Thoát xem trước» in the bar leaves preview. *(If the tab is blocked you see «Trình duyệt đã chặn cửa sổ mới…» — allow pop-ups and click again.)*
- [ ] **Publish.** «Xuất bản…» → the dialog «Xuất bản» lists what changes and has «Ghi chú cho lịch sử (không bắt buộc)» — write `thử nghiệm`. Confirm with «Xuất bản» → the chip becomes «Đã xuất bản · phiên bản 2», and the **visitor** window shows *…/Hộp (thử)* after a refresh. The unit's list row now says `v2`.
- [ ] **History.** The «Lịch sử» card → «Xem lịch sử»: *Phiên bản 2 · Cập nhật … · <your name> · thử nghiệm* and *Phiên bản 1 · Nhập dữ liệu gốc … · Hệ thống · Dữ liệu gốc của website*. «So sánh» on version 1 (modal «So sánh với phiên bản 1») lists the change field by field: *Sửa — Tên đơn vị (vi): Hộp → Hộp (thử)*. «Khôi phục» on version 1 opens it **as a new draft**: chips «Đang có bản nháp» and «Khôi phục từ phiên bản 1», the field shows `Hộp`, **and the website still says `Hộp (thử)`** until you publish. While a draft is open, «Khôi phục» is greyed out (tooltip *Hãy xuất bản hoặc hủy bản nháp đang mở trước.*).
- [ ] **Discard.** «Hủy bản nháp» → the dialog says *Nội dung đang hiển thị trên website không bị ảnh hưởng.* «Giữ bản nháp» backs out; «Hủy bản nháp» confirms and you are back in the read-only published view. *(Put «Hộp» back the way you like: restore version 1 and publish, or leave it.)*
- [ ] **Create [editor or admin].** «Tạo đơn vị mới» → the dialog «Tạo đơn vị mới» asks «Tên tiếng Việt *», «Tên tiếng Anh» (*Cần có trước khi xuất bản; có thể bổ sung sau.*) and «Mã» (suggested from the name, e.g. `test-don-vi`; lower-case, digits and dashes, **cannot be changed later**). Type only `Test đơn vị` → «Tạo» → you land in its editor with chips «Chưa xuất bản» and «Đang có bản nháp». It is not on the website.
- [ ] **Validation.** On that new unit the yellow box **«Cần bổ sung (1)»** already lists *Tên đơn vị (en): Bắt buộc có nội dung tiếng Anh.*, and «Xuất bản…» is greyed out (tooltip *Cần lưu xong và bổ sung đủ nội dung trước khi xuất bản.*). Click the line in the box → the **English** tab opens («English 0%») and the field is focused. Type `Test unit` → the box disappears and «Xuất bản…» turns on. Publish it → «Đã xuất bản · phiên bản 1».
- [ ] **Languages.** Vietnamese **and** English are required to publish; leaving 中文, 日本語, 한국어 empty is allowed (the website shows the English text for them). The tabs show a % translated.
- [ ] **Two people, one draft.** Admin opens «Cái» → «Chỉnh sửa» → types `Cái (A)` (wait for «Đã lưu»). In the **editor's** browser open «Cái»: the editor **resumes the same draft** (chips «Đang có bản nháp», field already says `Cái (A)`); the editor types `Cái (B)`. Back in the admin browser type again → the status turns to *Người khác vừa sửa bản nháp này* and a yellow box appears: ***Người khác vừa lưu bản nháp này, hoặc bản nháp không còn nữa.*** with two buttons: «Tải bản nháp mới nhất» (loads `Cái (B)`, your last typing is lost) and «Giữ bản của tôi, ghi đè». Try both on separate rounds. Finish with «Hủy bản nháp».
- [ ] **Delete — as the editor.** On the new test unit: the card **«Sử dụng & xóa»** says *Chỉ xóa được khi không còn nơi nào dùng đến.* and, for an editor, *Chỉ quản trị viên mới xóa được nội dung.* — there is **no** delete button.
- [ ] **Delete — as the admin.** The same card has «Xóa vĩnh viễn» → the dialog «Xóa vĩnh viễn?» (*«Test đơn vị» sẽ bị xóa khỏi website. Lịch sử vẫn được giữ để khôi phục.*; buttons «Không xóa» / «Xóa vĩnh viễn») → you are back on the list and the row is gone.
- [ ] **Delete refusal.** Open «Hộp» (it is used by «In nhanh lấy liền» items): the card says *Đang được dùng ở 1 nơi đang hiển thị và 0 bản nháp.* Try «Xóa vĩnh viễn» → confirm → nothing is deleted and the card shows *Vẫn đang được dùng (1 mục đang hiển thị, 0 bản nháp). Hãy gỡ nó khỏi các mục đó trước.*
- [ ] **Types with a status** (products, posts, «In nhanh lấy liền»): the card says the item must be archived first — set «Trạng thái» to «Đã lưu trữ», publish, and only then can the admin delete it.

### F. Each content type

Any order is fine. «Tạo … mới» exists only for the types marked **create**; 25 products, 6 posts, 44 materials and 4 menus are seeded.

- [ ] **«Sản phẩm»** (create, delete). Open one; the six tabs are «Thông tin chung», «Đường dẫn & SEO», «Hình thức», «Chất liệu», «Kích thước», «Thông số». A tab shows a count when it has problems.
  - [ ] Edit the name in Vietnamese and English → preview → publish → the product page changes: `http://localhost:3000/san-pham/an-pham-tet/bao-li-xi` (and `/en/products/an-pham-tet/bao-li-xi`).
  - [ ] «Hình thức» (shapes) and «Chất liệu» (options): add one, remove one, reorder, change a price, add a bullet, choose a photo from the library. Each addition opens its own card.
  - [ ] «Đường dẫn & SEO»: each language has its own address; changing the Vietnamese slug of a **published** product and publishing makes the **old** address redirect (308) to the new one. The old address is listed read-only; «Gỡ» appears only when no draft is open and only for people who may publish → modal «Gỡ đường dẫn cũ?» (*Giữ lại* / «Gỡ đường dẫn») → afterwards the old address answers 404.
  - [ ] Moving the product to another category and publishing keeps every old address working.
  - [ ] «Tạo sản phẩm mới»: pick the category and give Vietnamese and English names → fill the rest → publish → the page opens at its new address (it is not in any menu until you add it in «Menu»).
- [ ] **«Danh mục»** (4, not deletable). Rename a slug → a warning says it moves the address of every product in that category in that language (old addresses keep working).
- [ ] **«Menu»** (4 — «Tiếp thị», «Văn phòng», «Bao bì», «Ấn phẩm Tết»; not deletable, no create). The mega-menu of a category: «Cột N» → products (each card shows e.g. *Bao Lì Xì — 3 mục*) → items («Hình thức» or «Chất liệu»). Try «Thêm cột», «Thêm sản phẩm vào cột này», «Thêm mục», «Chuyển sang cột khác», «Gỡ sản phẩm khỏi menu», «Xóa mục», «Xóa cột» (modal «Xóa cột?»). An empty column shows *Cột này chưa có sản phẩm nào…* and is not saved. Publish → the menu on the site changes.
- [ ] **«Bài viết»** (create, delete). Titles and content per language, format plain/markdown, category («Chuyên mục»), date, reading time, cover. A new post appears at `http://localhost:3000/bai-viet/<its-slug>` and in the blog list newest first. Set it to «Đã lưu trữ» and publish → its address answers 404.
- [ ] **«Chất liệu»**, **«Đặc điểm (biểu tượng)»**, **«Đơn vị tính»**, **«Thông số in»**, **«Chuyên mục bài viết»** (all create, delete). Create one, use it from a product or post, then try to delete it → refused with the number of places it is used. «Thông số in» also asks for «Loại thông số» when you create it.
- [ ] **«In nhanh lấy liền»** (create, delete). Edit a price and unit → `http://localhost:3000/san-pham/in-nhanh` shows the new price line in each language.
- [ ] **«Ảnh mẫu trang sản phẩm»** (create, delete). Add or change a picture → the gallery on `http://localhost:3000/san-pham` changes.
- [ ] **«Văn bản giao diện»** (30 groups; no create, no delete). Pick a group, change **one** text in **one** language, publish → the interface text changes on the website in that language only. Keep any `{variable}` that the Vietnamese text has; removing one is refused. Emptying a 中文/日本語/한국어 text means "use English".

### G. «Thư viện ảnh» — picture library

- [ ] **[editor]** A new database has *Chưa có ảnh nào được tải lên…* in the grid. Upload `red-1200x800.jpg`, `green-800x800.png`, `blue-900x600.jpg` together («Chọn ảnh từ máy» or drag them in) → one line per file, each *— đã thêm vào thư viện.*; the summary reads *Đã xử lý 3/3 ảnh.* and three tiles appear. *(The list of results keeps growing until you press «Xóa danh sách» — press it between steps to keep things readable.)*
- [ ] **[editor]** Upload `huge-4200x3000.jpg` → accepted (the page's note says pictures become WebP, are shrunk if the long side is over 3000 px, and lose their GPS data). The folder filter now shows `uploads/2026 (4)`.
- [ ] **[editor]** Upload `red-1200x800.jpg` again, and `red-copy-of-the-same-picture.jpg` (same picture, different name) → each line says *— ảnh này đã có trong thư viện, không lưu thêm bản nữa.* and **no new tile** appears.
- [ ] **[editor]** Upload `evil.svg`, `html-pretending-to-be-a-photo.jpg`, `notes.txt` → three red refusals, nothing added: *«evil.svg» là ảnh SVG: không nhận vì có thể chứa mã chạy trên trang…*, *«html-pretending-to-be-a-photo.jpg»: Đây là tệp HTML/XML, không phải ảnh…* (the server looks at the file's content, not its name), *«notes.txt» không phải ảnh được hỗ trợ…*
- [ ] **[editor]** Upload `too-big-11mb.jpg` → refused **before** anything is sent: *«too-big-11mb.jpg» nặng 11 MB, vượt giới hạn 10 MB. Hãy thu nhỏ ảnh rồi tải lên lại.*
- [ ] Filters: «Đã tải lên» (default) / «Tất cả ảnh» / «Có sẵn của website»; «Tất cả thư mục» + a folder; type part of a file name and press «Tìm». «Mở ảnh» opens a tile's picture in a new tab.
- [ ] **Picker.** In an editor (e.g. a post's cover) open the picture chooser → the same filters; as an editor you can «Tải ảnh lên» from inside it and the new picture fills the slot at once. Autosave, preview and publish → the picture shows on the website.
- [ ] **[editor]** Tiles have only «Mở ảnh», no «Xóa». **[admin]** Tiles also have «Xóa» → the dialog «Xóa ảnh khỏi thư viện?» (*Ảnh bị xóa khỏi máy chủ, không khôi phục được.*, with the file's path; «Giữ lại» / «Xóa ảnh»). On an unused picture it deletes (the tile disappears and its address answers 404). On a picture that a post or product uses it is **refused** with the numbers (live and drafts) and the dialog stays open — pick a picture in a post's cover, publish, then try.
- [ ] Built-in pictures («Có sẵn của website») cannot be deleted by anyone.

### H. The public website after publishing — **[visitor]**

- [ ] A change published in E/F is visible after a normal refresh, without restarting anything, in the right language only.
- [ ] The language switcher in the navigation lands on the **same page** in the other language (its own address), from the home page, a product, a post and «In nhanh lấy liền».
- [ ] An old product address redirects to the current one (see F «Đường dẫn & SEO»); an address that never existed shows the friendly 404 page in the right language.
- [ ] The quote button «Nhận Báo Giá» opens the form; entering a Vietnamese mobile number and sending shows the thank-you message. **In the `pnpm dev` terminal** you see one JSON line ending *"msg":"consult lead not emailed: SMTP is not configured"* with the phone masked as `0901***567` (there is no mail server locally).
- [ ] A phone number with a wrong shape (e.g. `123`) is refused by the form (the server's answer is *Số điện thoại không hợp lệ*).
- [ ] `http://localhost:3000/sitemap.xml` and `/robots.txt` load; the sitemap lists the pages you published and not the drafts.

### I. Roles at a glance

Tick each cell as you verify it.

| Action | Admin | Editor |
|---|---|---|
| Create, edit, preview, discard drafts | [ ] yes | [ ] yes |
| Publish, restore a version | [ ] yes | [ ] yes |
| «Xóa vĩnh viễn» (delete) | [ ] yes | [ ] no — message instead |
| Release an old address («Gỡ») | [ ] yes | [ ] yes |
| Upload pictures | [ ] yes | [ ] yes |
| Delete pictures | [ ] yes | [ ] no |
| «Người Dùng» (create, role, reset, deactivate) | [ ] yes | [ ] no — redirected |
| «Nhật Ký Hoạt Động» | [ ] yes | [ ] no — redirected |
| Own account: change password, revoke sessions | [ ] yes | [ ] yes |

---

## 5. Where things are

| What | Address |
|---|---|
| Login | `/admin/login` |
| Account / password change | `/admin/account` · `/admin/account/password` |
| Users · Activity log | `/admin/users` · `/admin/audit` |
| Picture library | `/admin/media` |
| A content list | `/admin/content/<type>` where `<type>` is `product`, `category`, `menu`, `post`, `material`, `trait`, `unit`, `spec-item`, `post-category`, `fast-print-item`, `showcase-item`, `site-message` |
| Known public pages to look at | `/` · `/en` · `/san-pham` · `/san-pham/an-pham-tet/bao-li-xi` · `/san-pham/an-pham-tet/lich-tet` · `/bai-viet` · `/bai-viet/bao-bi-fnb-local-brand` · `/san-pham/in-nhanh` |

---

## 6. Optional: the same checks on the production-shaped stack

`pnpm dev` is not what gets deployed. This runs the real images behind Caddy over HTTPS on your computer, so you can test what dev cannot: the admin path allow-list, secure cookies, uploads on a read-only container, backup and restore. **The first build takes about 7 minutes.** It needs the seed dump from step 1.3 (`~/vd-manual-seed.dump`).

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
dc() { docker compose --env-file $SP/stack.env -p vdlocal "$@"; }     # define again in every new terminal

dc --profile tools build            # ~7 min the first time
dc up -d                            # database, migrations, app, Caddy, backup
dc stop app
dc --profile tools run --rm -v ~/vd-manual-seed.dump:/import/seed.dump:ro restore --dump /import/seed.dump   # loads the site content
dc up -d
dc --profile tools run --rm admin-cli create       # first admin (same four prompts as before)
```

Open **https://localhost:8443** — the browser warns about the certificate (Caddy made its own for `localhost`); continue anyway. Then repeat any lines of section 4 you care about, and add these:

- [ ] `https://localhost:8443/admin/login` opens; `https://localhost:8443/admin/blog` and `/admin/anything-else` answer **404** (Caddy only lets the known admin pages through).
- [ ] Sign-in works, and the editors, Preview and the picture library behave exactly as in dev. (The consultation form answers an error here: `SMTP_HOST=x` is not a real mail server. That is expected.)
- [ ] Upload a picture, publish a product that uses it → it shows on the site; restart everything with `dc down` then `dc up -d` → the picture, the product and your sign-in are still there.
- [ ] Backup: `dc exec backup backup` finishes with `verified`; `dc exec backup ls /backups` shows the set. Change something in the admin, then `dc stop app` and `dc --profile tools run --rm restore latest` and `dc up -d` → the change is gone, everything else is back.
- [ ] Headers: `curl -skI https://localhost:8443/ | grep -iE 'strict-transport|x-frame|content-security|permissions-policy'` shows each once.

Clean up when done (this deletes the stack's data, never your dev database):

```sh
dc --profile tools down -v
docker rmi viet-dragon-app:local viet-dragon-tools:local viet-dragon-backup:local
rm -rf ~/vd-local-stack
```

---

## 7. Stop and clean up

```sh
# stop the dev server with Ctrl+C in its terminal, then:
docker compose -f compose.dev.yaml exec -T db psql -U vietdragon -d postgres -c "drop database if exists vd_manual with (force)"
rm -f ~/.vd-manual.env ~/vd-manual-seed.dump
rm -rf /tmp/vd-manual-fixtures
docker compose -f compose.dev.yaml stop
```

Your everyday dev database `vietdragon` (in the Docker volume `viet-dragon_pgdata_dev`) is never touched by any of this. To come back later, repeat 1.1 – 1.5.

---

## 8. When something goes wrong

**Write down, for each problem:** the page address, the exact steps, the Vietnamese message you saw (copy the text), which account (admin/editor), and the output in the `pnpm dev` terminal at that moment (errors show there in red). A screenshot helps. Open the browser's developer tools → Console for red errors.

**Things that look like bugs but are not:**

| You see | Reason |
|---|---|
| Sign-in fails with a 403 / origin error | You opened `127.0.0.1` or another port; use exactly `http://localhost:3000` |
| «Xem trước» says the browser blocked the new window | Allow pop-ups for localhost, then click again |
| Preview shows the live site, no bar | You are not signed in on that window, or you have not changed a temporary password yet |
| The Back button shows an admin page after sign-out | It comes from the browser's memory; reload it and you are on the login page (see A) |
| The login form just stays there (or says "too many attempts") after several quick sign-ins | The per-address limiter: 5 sign-in requests a minute from one computer, **every** attempt counts, including the successful ones of other accounts. Wait one minute |
| An account is locked | 5 failed passwords in a row lock the e-mail for 5 minutes (doubling); `pnpm admin:reset-password` lifts it |
| Every page is slow the first time | `pnpm dev` compiles on demand |
| `git status` shows `AGENTS.md` modified after running `pnpm dev` | Next 16.4's dev server adds a short "This is NOT the Next.js you know" block to `AGENTS.md` by itself and re-adds it if removed. It is harmless (it repeats the note at the top of that file). Either commit it with your next commit, or `git checkout -- AGENTS.md` before committing |
| The consultation form says sent, but no e-mail arrives | No mail server locally; the lead is logged in the dev terminal |
| «Khôi phục» is greyed out | A draft is open; publish or discard it first |
| «Xuất bản…» is greyed out | The draft is still saving, or the «Cần bổ sung» box lists something to fix |
| Cannot delete a product/post | It must be archived (set «Trạng thái» to «Đã lưu trữ» and publish) first |
| A test account cannot be deleted | By design — accounts are only deactivated; they disappear with the `vd_manual` database |
