import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { is_admin_authenticated } from "@/lib/auth/admin";
import AdminLogin from "@/components/admin/AdminLogin";

export const metadata: Metadata = {
  title: "Logowanie",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await is_admin_authenticated()) redirect("/admin");
  return <AdminLogin />;
}
