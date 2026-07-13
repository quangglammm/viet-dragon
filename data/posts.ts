export type PostCategory = "tips" | "case-study" | "news";

export interface BlogPost {
  slug: string;
  title: string;
  titleEn: string;
  excerpt: string;
  excerptEn: string;
  coverImage: string;
  date: string;
  category: PostCategory;
  categoryVi: string;
  categoryEn: string;
  readTime: number;
  content: string;
  contentEn: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "chon-chat-lieu-in-phu-hop",
    title: "Chọn chất liệu in phù hợp cho từng sản phẩm",
    titleEn: "Choosing the Right Print Material for Each Product",
    excerpt:
      "Giấy couche, mỹ thuật, kraft hay PP tổng hợp — mỗi loại chất liệu có ưu điểm riêng. Hướng dẫn thực tế để bạn chọn đúng ngay từ đầu.",
    excerptEn:
      "Coated, art, kraft, or synthetic PP — each material has its strengths. A practical guide to picking the right one from the start.",
    coverImage: "https://picsum.photos/seed/vd-blog-1/1200/600",
    date: "2026-06-10",
    category: "tips",
    categoryVi: "Mẹo In Ấn",
    categoryEn: "Print Tips",
    readTime: 5,
    content: `Việc lựa chọn chất liệu in ấn đúng không chỉ ảnh hưởng đến thẩm mỹ mà còn quyết định tuổi thọ và tính năng của sản phẩm. Dưới đây là tổng quan về các loại chất liệu phổ biến nhất hiện nay.

**Giấy Couche (Coated Paper)**
Bề mặt láng, tái hiện màu sắc trung thực, phù hợp cho catalogue, brochure và danh thiếp cao cấp. Độ dày phổ biến từ 100gsm đến 350gsm.

**Giấy Mỹ Thuật (Art Paper)**
Kết cấu xốp nhẹ, cảm giác tay tốt, thường dùng cho ấn phẩm muốn tạo cảm giác tự nhiên, thân thiện. Tốt cho menu nhà hàng và brochure phong cách organic.

**Giấy Kraft**
Màu nâu tự nhiên, ấm áp và có cá tính. Phù hợp cho bao bì, túi giấy, và thương hiệu hướng đến giá trị bền vững.

**PP Tổng Hợp (Synthetic PP)**
Chống nước, bền màu, không rách — lý tưởng cho nhãn hàng hoá, decal ngoài trời và thực đơn quán ăn.

Khi chưa chắc về lựa chọn, hãy liên hệ với đội ngũ Viet Dragon để được tư vấn miễn phí và nhận mẫu thử trước khi in số lượng lớn.`,
    contentEn: `Choosing the right print material doesn't just affect the look of a piece — it determines the durability and function of the final product. Here's an overview of the most popular materials today.

**Coated Paper**
A smooth surface that reproduces color accurately, ideal for catalogues, brochures, and premium business cards. Common weights range from 100gsm to 350gsm.

**Art Paper**
A light, textured surface with a pleasant tactile feel, often used for pieces that want a natural, approachable character. Great for restaurant menus and organic-style brochures.

**Kraft Paper**
A natural brown tone with warmth and character. Well suited to packaging, paper bags, and brands built around sustainability.

**Synthetic PP**
Waterproof, colorfast, and tear-resistant — ideal for product labels, outdoor decals, and restaurant menus.

If you're unsure which to choose, reach out to the Viet Dragon team for a free consultation and a sample before committing to a large print run.`,
  },
  {
    slug: "bao-bi-fnb-local-brand",
    title: "Dự án bao bì cho thương hiệu F&B địa phương",
    titleEn: "Packaging Project for a Local F&B Brand",
    excerpt:
      "Từ hộp giấy thủ công đến túi giấy kraf có tem niêm phong — câu chuyện đằng sau bộ bao bì đồng bộ cho một thương hiệu đồ uống tại TP.HCM.",
    excerptEn:
      "From handcrafted paper boxes to kraft bags with seal stickers — the story behind a cohesive packaging set for a Ho Chi Minh City beverage brand.",
    coverImage: "https://picsum.photos/seed/vd-blog-2/1200/600",
    date: "2026-05-28",
    category: "case-study",
    categoryVi: "Case Study",
    categoryEn: "Case Study",
    readTime: 6,
    content: `Khách hàng là một thương hiệu đồ uống thủ công tại TP.HCM, tìm kiếm bộ bao bì có thể truyền tải được tinh thần tự nhiên và thân thiện với môi trường của thương hiệu.

**Thách thức**
Thương hiệu có ngân sách hạn chế nhưng yêu cầu cao về tính nhất quán thị giác trên toàn bộ điểm chạm: hộp giấy, túi mang về, tem dán, và phiếu cảm ơn.

**Giải pháp**
Chúng tôi tư vấn sử dụng giấy kraft tự nhiên kết hợp in 1 màu (mực đen) thay vì in 4 màu, giảm chi phí đáng kể trong khi vẫn giữ được phong cách. Tem niêm phong tròn được in lớn hơn để đóng vai trò như một điểm nhấn thương hiệu.

**Kết quả**
Bộ bao bì hoàn chỉnh được sản xuất trong 5 ngày làm việc. Khách hàng nhận phản hồi tích cực từ người dùng cuối và đặt thêm đơn hàng trong tháng tiếp theo.`,
    contentEn: `The client is a craft beverage brand in Ho Chi Minh City, looking for a packaging set that could carry across their natural, eco-conscious brand spirit.

**The Challenge**
The brand had a limited budget but high expectations for visual consistency across every touchpoint: paper boxes, take-out bags, seal stickers, and thank-you cards.

**The Solution**
We recommended natural kraft paper combined with single-color (black ink) printing instead of full 4-color printing, cutting costs significantly while keeping the aesthetic intact. The round seal sticker was printed larger so it could double as a brand accent.

**The Result**
The full packaging set was produced in 5 working days. The client received positive feedback from end customers and placed a follow-up order the next month.`,
  },
  {
    slug: "viet-dragon-mo-rong-binh-duong",
    title: "Viet Dragon khai trương cơ sở in tại Bình Dương",
    titleEn: "Viet Dragon Opens New Facility in Bình Dương",
    excerpt:
      "Nhằm đáp ứng nhu cầu ngày càng tăng từ các khu công nghiệp, Viet Dragon mở thêm cơ sở sản xuất thứ hai tại Bình Dương từ tháng 7/2026.",
    excerptEn:
      "To meet growing demand from industrial zones, Viet Dragon opens its second production facility in Bình Dương from July 2026.",
    coverImage: "https://picsum.photos/seed/vd-blog-3/1200/600",
    date: "2026-06-01",
    category: "news",
    categoryVi: "Tin Tức",
    categoryEn: "Company News",
    readTime: 3,
    content: `Chúng tôi vui mừng thông báo Viet Dragon sẽ chính thức khai trương cơ sở in ấn thứ hai tại Bình Dương vào đầu tháng 7 năm 2026.

**Tại sao Bình Dương?**
Bình Dương là trung tâm công nghiệp lớn nhất miền Nam Việt Nam với hàng nghìn doanh nghiệp vừa và nhỏ có nhu cầu in ấn thường xuyên. Cơ sở mới sẽ giúp rút ngắn thời gian giao hàng cho khách hàng trong khu vực xuống còn 1–2 ngày làm việc.

**Năng lực sản xuất mới**
Cơ sở Bình Dương được trang bị máy in offset tờ rời, máy in kỹ thuật số khổ lớn và dây chuyền gia công hoàn thiện (ép kim, dán màng, bế nhãn) — tất cả dưới một mái nhà.

**Dịch vụ không đổi**
Tư vấn, thiết kế và báo giá vẫn hoàn toàn miễn phí. Liên hệ ngay để được ưu tiên đặt lịch sản xuất từ cơ sở mới.`,
    contentEn: `We're excited to announce that Viet Dragon will officially open its second production facility in Binh Duong in early July 2026.

**Why Binh Duong?**
Binh Duong is the largest industrial hub in southern Vietnam, home to thousands of small and mid-size businesses with regular printing needs. The new facility will shorten delivery times for customers in the area to just 1–2 working days.

**New Production Capacity**
The Binh Duong facility is equipped with sheet-fed offset presses, large-format digital printers, and a full finishing line (foil stamping, film lamination, die-cutting) — all under one roof.

**Same Service, New Location**
Consultation, design, and quotes remain completely free. Contact us now to get priority scheduling at the new facility.`,
  },
  {
    slug: "5-loi-thuong-gap-khi-chuan-bi-file-in",
    title: "5 lỗi thường gặp khi chuẩn bị file in ấn",
    titleEn: "5 Common Mistakes When Preparing Print Files",
    excerpt:
      "Màu RGB thay vì CMYK, thiếu bleed, font chưa outline — những lỗi nhỏ có thể khiến toàn bộ lô hàng phải in lại. Đừng để điều đó xảy ra.",
    excerptEn:
      "RGB instead of CMYK, missing bleed, unoutlined fonts — small mistakes that can ruin an entire print run. Don't let that happen.",
    coverImage: "https://picsum.photos/seed/vd-blog-4/1200/600",
    date: "2026-05-15",
    category: "tips",
    categoryVi: "Mẹo In Ấn",
    categoryEn: "Print Tips",
    readTime: 7,
    content: `Sau nhiều năm làm việc với hàng trăm khách hàng, đây là những lỗi phổ biến nhất mà Viet Dragon gặp khi nhận file in.

**1. Dùng màu RGB thay vì CMYK**
Màn hình hiển thị RGB — máy in hoạt động theo CMYK. Nếu không chuyển đổi trước, màu sắc in ra sẽ nhạt hơn hoặc lệch tông đáng kể. Luôn chuyển sang CMYK trước khi xuất file.

**2. Thiếu vùng bleed (lề chảy máu)**
Tất cả yếu tố chạm mép cần mở rộng thêm ít nhất 3mm ra ngoài viền cắt. Thiếu bleed sẽ để lộ viền trắng khi dao bế cắt sai vị trí vài phần mm.

**3. Font chữ chưa được outline (tạo đường bao)**
Font không được nhúng vào file có thể bị thay thế bởi font mặc định của máy in. Hãy tạo outline (Create Outlines trong Illustrator) hoặc nhúng toàn bộ font.

**4. Độ phân giải quá thấp**
Ảnh đẹp trên màn hình (72 dpi) sẽ vỡ hạt khi in. Yêu cầu tối thiểu là 300 dpi ở kích thước thực in.

**5. Không để ý đến vùng an toàn (safe zone)**
Nội dung quan trọng (chữ, logo) nên cách mép cắt ít nhất 5mm để tránh bị cắt nhầm. Đây là vùng safe zone cần tuân thủ.`,
    contentEn: `After years of working with hundreds of clients, here are the most common mistakes Viet Dragon sees in print-ready files.

**1. Using RGB Instead of CMYK**
Screens display in RGB — printers work in CMYK. Without converting beforehand, printed colors can come out noticeably duller or shifted. Always convert to CMYK before exporting your file.

**2. Missing Bleed**
Any element that touches the edge of the page needs to extend at least 3mm past the trim line. Without bleed, a few millimeters of cutting error will expose an unwanted white edge.

**3. Fonts Not Outlined**
Fonts that aren't embedded in the file can get silently replaced by the printer's default font. Always create outlines (Create Outlines in Illustrator) or fully embed your fonts.

**4. Resolution Too Low**
Images that look fine on screen (72 dpi) will look pixelated when printed. The minimum requirement is 300 dpi at actual print size.

**5. Ignoring the Safe Zone**
Important content — text, logos — should stay at least 5mm from the trim edge to avoid being cut off by mistake. This margin is the safe zone, and it should always be respected.`,
  },
  {
    slug: "bo-nhan-dien-thuong-hieu-startup",
    title: "Bộ nhận diện thương hiệu hoàn chỉnh cho startup công nghệ",
    titleEn: "Complete Brand Identity for a Tech Startup",
    excerpt:
      "Từ danh thiếp kim loại đến bộ tài liệu văn phòng đồng bộ — dự án nhận diện thương hiệu full-stack cho một startup SaaS tại TP.HCM.",
    excerptEn:
      "From metallic business cards to a unified stationery set — a full-stack brand identity project for a SaaS startup in Ho Chi Minh City.",
    coverImage: "https://picsum.photos/seed/vd-blog-5/1200/600",
    date: "2026-04-20",
    category: "case-study",
    categoryVi: "Case Study",
    categoryEn: "Case Study",
    readTime: 8,
    content: `Một startup SaaS với đội ngũ 12 người đang chuẩn bị ra mắt sản phẩm và tìm kiếm bộ ấn phẩm thể hiện sự chuyên nghiệp và công nghệ.

**Phạm vi dự án**
Toàn bộ bộ nhận diện ấn phẩm bao gồm: danh thiếp ép kim + mã QR, phong bì thư, tờ tiêu đề, bìa hồ sơ, sổ tay nội bộ, và banner trưng bày tại sự kiện.

**Thách thức kỹ thuật**
Danh thiếp yêu cầu ép kim lá vàng trên nền đen mờ — một kỹ thuật đòi hỏi căn chỉnh chính xác và điều kiện nhiệt độ cụ thể. Chúng tôi in thử 3 lần trước khi đạt được kết quả như mong muốn.

**Điểm nổi bật**
Mã QR trên danh thiếp được thiết kế kết hợp với logo, vẫn đọc được bởi máy quét trong khi trông như một yếu tố đồ hoạ. Đây là chi tiết nhỏ tạo ấn tượng lớn với khách hàng của startup.

**Kết quả**
Toàn bộ bộ ấn phẩm được hoàn thiện trong 8 ngày làm việc. Startup đã sử dụng danh thiếp tại Demo Day và nhận được nhiều lời khen về chất lượng in.`,
    contentEn: `A 12-person SaaS startup was preparing for a product launch and needed a stationery set that reflected a professional, tech-forward image.

**Project Scope**
The full identity set included: foil-stamped business cards with QR codes, envelopes, letterheads, presentation folders, internal notebooks, and event display banners.

**Technical Challenge**
The business cards called for gold foil stamping on a matte black background — a technique that demands precise alignment and specific temperature conditions. We ran three test prints before reaching the desired result.

**A Standout Detail**
The QR code on the business card was designed to merge with the logo — still scannable, but reading as a graphic element in its own right. A small detail that made a big impression on the startup's own clients.

**The Result**
The full stationery set was completed in 8 working days. The startup used the cards at their Demo Day and received strong compliments on print quality.`,
  },
  {
    slug: "may-in-uv-the-he-moi",
    title: "Đầu tư máy in UV thế hệ mới — nâng tầm chất lượng",
    titleEn: "New-Generation UV Printer Investment — Quality Upgrade",
    excerpt:
      "Máy in UV mới cho phép in trực tiếp lên bề mặt cứng, phủ màng 3D và hiệu ứng spot UV chính xác hơn bao giờ hết. Xem những gì có thể làm được.",
    excerptEn:
      "Our new UV printer enables direct printing on rigid surfaces, 3D lamination, and more precise spot UV effects than ever. See what's now possible.",
    coverImage: "https://picsum.photos/seed/vd-blog-6/1200/600",
    date: "2026-03-10",
    category: "news",
    categoryVi: "Tin Tức",
    categoryEn: "Company News",
    readTime: 4,
    content: `Viet Dragon vừa hoàn tất lắp đặt hệ thống máy in UV phẳng thế hệ mới, mở ra nhiều khả năng in ấn mà trước đây cần thuê ngoài hoặc chờ đợi lâu.

**Những gì có thể làm được ngay bây giờ**
In trực tiếp lên: mica, acrylic, gỗ MDF, PVC, vải canvas cứng, kính, kim loại. Không cần dán decal trung gian — in thẳng lên vật liệu.

**Hiệu ứng đặc biệt**
Spot UV nổi 3D: tạo lớp trong suốt có kết cấu nổi trên bề mặt in — rất phù hợp cho danh thiếp và hộp quà cao cấp. Màu trắng làm nền cho in màu trên nền tối hoặc trong suốt.

**Thời gian sản xuất**
Với số lượng nhỏ (dưới 100 tờ), máy UV có thể hoàn thành trong cùng ngày — không cần chờ bản kẽm như in offset truyền thống.

**Báo giá**
Liên hệ đội ngũ Viet Dragon để nhận báo giá cho dự án in UV của bạn. Chúng tôi cung cấp mẫu thử miễn phí cho đơn hàng từ 500 tờ trở lên.`,
    contentEn: `Viet Dragon has just completed installation of a new-generation flatbed UV printing system, opening up capabilities that previously required outsourcing or long wait times.

**What's Now Possible**
Direct printing onto: acrylic, MDF wood, PVC, rigid canvas, glass, and metal. No intermediary decal needed — the design prints straight onto the material.

**Special Effects**
Raised 3D spot UV: a clear, textured layer built up on the print surface — ideal for business cards and premium gift boxes. White ink can also act as an underbase for printing color on dark or transparent surfaces.

**Turnaround Time**
For small runs (under 100 sheets), the UV printer can complete same-day — no need to wait for plates like traditional offset printing.

**Get a Quote**
Contact the Viet Dragon team for a quote on your UV printing project. We offer free sample prints for orders of 500 sheets or more.`,
  },
];

export const categoryColors: Record<PostCategory, { bg: string; text: string }> = {
  tips: { bg: "bg-blue-50", text: "text-blue-600" },
  "case-study": { bg: "bg-amber-50", text: "text-amber-600" },
  news: { bg: "bg-emerald-50", text: "text-emerald-600" },
};
