import { ImagePlus } from "lucide-react";
import { MediaLibrary } from "@/components/admin/media/media-library";
import { PageHeader } from "@/components/admin/page-parts";
import { requireUser } from "@/lib/dal";
import { hasPermission } from "@/lib/permissions";

export default async function MediaPage() {
  const user = await requireUser({ permission: ["content", "edit"] });
  return (
    <>
      <PageHeader
        icon={<ImagePlus size={15} />}
        eyebrow="Nội dung website"
        title="Thư viện ảnh"
        description="Tải ảnh lên và tìm lại ảnh đã dùng. Để dùng một ảnh, hãy chọn nó trong ô «Ảnh» của sản phẩm, bài viết hay danh mục."
      />
      <MediaLibrary canUpload={hasPermission(user.role, ["media", "upload"])} canDelete={hasPermission(user.role, ["media", "delete"])} />
    </>
  );
}
