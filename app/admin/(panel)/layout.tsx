import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AdminSidebar from "@/components/AdminSidebar";

// middleware.ts already blocks unauthenticated requests to everything under
// /admin/* except /admin/login. This second check is deliberate
// defense-in-depth: even if middleware were ever misconfigured or bypassed,
// no admin page renders without a verified server-side session.
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  return (
    <div className="flex bg-bg text-cream min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 md:p-10">{children}</main>
    </div>
  );
}
