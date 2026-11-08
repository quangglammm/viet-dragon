import { redirect } from "next/navigation";
import { ACCOUNT_PATH } from "@/lib/admin-access";

export default function AdminPage() {
  redirect(ACCOUNT_PATH);
}
