/**
 * Wspólne typy domenowe sklepu.
 * Odpowiadają strukturze tabel z supabase/schema.sql.
 */

export type OrderStatus =
  | "NEW"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "ON_DELIVERY";

export type PaymentMethod = "stripe" | "cod";

export type DeliveryMethod = "INPOST_LOCKER" | "INPOST_COURIER";

/** Wiersz tabeli products. `null` = dane jeszcze nieuzupełnione. */
export interface DbProduct {
  id: string;
  slug: string;
  name: string | null;
  priceCents: number | null;
  volume: string | null;
  description: string | null;
  scentStory: string | null;
  notes: string[];
  stock: number;
  isActive: boolean;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPriceCents: number | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: Customer;
  items: OrderItem[];
  subtotalCents: number | null;
  shippingCents: number;
  totalCents: number | null;
  deliveryMethod: DeliveryMethod;
  lockerCode: string | null;
  shippingAddress: {
    street: string;
    postCode: string;
    city: string;
  } | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  stripeCheckoutSessionId: string | null;
  /** ID przesyłki w InPost ShipX — null, jeśli etykiety jeszcze nie wygenerowano. */
  shipxShipmentId: number | null;
  /** Numer nadania InPost — widoczny w panelu admina. */
  shipxTrackingNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Pozycja koszyka (przechowywana przejściowo po stronie klienta). */
export interface CartItem {
  productId: string;
  name: string;
  priceCents: number | null;
  quantity: number;
  imageUrl: string | null;
}
