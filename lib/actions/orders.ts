"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { createShipment } from "@/lib/inpost";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await requireAdmin();
  await prisma.order.update({ where: { id: orderId }, data: { status } });
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

/**
 * Creates the real InPost shipment for an order via ShipX (lib/inpost.ts).
 * Only usable once INPOST_SHIPX_TOKEN / INPOST_ORGANIZATION_ID are set —
 * otherwise it surfaces the real "not configured" error to the admin
 * instead of pretending a label was generated.
 */
export async function generateShippingLabel(orderId: string) {
  await requireAdmin();
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { customer: true, items: true },
  });

  const shipment = await createShipment({
    orderId: order.orderNumber,
    receiver: { name: `${order.customer.firstName} ${order.customer.lastName}`, email: order.customer.email, phone: order.customer.phone },
    targetPoint: order.deliveryMethod === "INPOST_LOCKER" ? order.inpostLockerCode ?? undefined : undefined,
    address:
      order.deliveryMethod === "INPOST_COURIER" && order.shippingAddress
        ? {
            street: (order.shippingAddress as any).street,
            city: (order.shippingAddress as any).city,
            postCode: (order.shippingAddress as any).postCode,
            countryCode: "PL",
          }
        : undefined,
    parcel: { weightKg: 0.5 },
    isCod: false,
  });

  await prisma.shipment.upsert({
    where: { orderId: order.id },
    create: { orderId: order.id, inpostShipmentId: shipment.id, status: "CREATED" },
    update: { inpostShipmentId: shipment.id, status: "CREATED" },
  });

  await prisma.order.update({ where: { id: order.id }, data: { status: "SHIPPED" } });
  revalidatePath(`/admin/orders/${orderId}`);
}
