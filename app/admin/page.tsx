import type { Metadata } from "next";
import { getStatistics, listOrders } from "@/lib/db/repository";
import { dbReady } from "@/lib/admin/guard";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const metadata: Metadata = { title: "Pulpit" };
export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const enabled = dbReady();

  if (!enabled) {
    return (
      <AdminDashboard
        dbEnabled={false}
        stats={{
          ordersTotal: 0,
          ordersPaid: 0,
          revenueCents: 0,
          customersTotal: 0,
          productsTotal: 0,
          unitsSold: 0,
          statusBreakdown: [],
          last30Days: [],
        }}
        recentOrders={[]}
      />
    );
  }

  const [stats, orders] = await Promise.all([getStatistics(), listOrders()]);
  const recent = orders.slice(0, 8).map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    totalCents: o.totalCents,
    status: o.status,
    paymentStatus: o.paymentStatus,
    createdAt: o.createdAt,
    customerName: o.customer ? `${o.customer.firstName} ${o.customer.lastName}` : undefined,
  }));

  return <AdminDashboard dbEnabled stats={stats} recentOrders={recent} />;
}
