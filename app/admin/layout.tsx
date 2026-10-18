import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: { default: "Panel — ZODARA PARFUMS", template: "%s — Panel ZODARA" },
  robots: { index: false, follow: false },
};

/** Layout panelu admina — oddzielony od sklepu, bez smooth scrolla i 3D. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-root min-h-screen">{children}</div>;
}
