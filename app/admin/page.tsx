import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { is_admin_authenticated } from "@/lib/auth/admin";
import AdminLogin from "@/components/admin/AdminLogin";

export const metadata: Metadata = { title: "Panel" };

/** /admin bez sesji → login; z sesją → kokpit (przekierowanie). */
export default async function AdminRootPage() {
  if (!(await is_admin_authenticated())) return <AdminLogin />;
  redirect("/admin/orders");
}
