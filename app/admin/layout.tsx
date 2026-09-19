import AdminProviders from "./providers";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <AdminProviders>{children}</AdminProviders>;
}
