import { Badge } from "@/components/ui/badge";
import { formatEnum } from "@/lib/format";
import type { OrderItemResponse, OrderResponse } from "@/types/api";

type BadgeVariant = "default" | "secondary" | "outline" | "destructive";
type OrderStatus = NonNullable<OrderResponse["status"]>;
type FulfillmentStatus = NonNullable<OrderItemResponse["fulfillmentStatus"]>;

const ORDER_VARIANTS: Record<OrderStatus, BadgeVariant> = {
  PENDING_PAYMENT: "outline",
  PAID: "secondary",
  AWAITING_STOCK: "secondary",
  PARTIALLY_SHIPPED: "default",
  SHIPPED: "default",
  DELIVERED: "default",
  CANCELLED: "destructive",
};

const FULFILLMENT_VARIANTS: Record<FulfillmentStatus, BadgeVariant> = {
  PENDING_PAYMENT: "outline",
  READY_TO_SHIP: "secondary",
  AWAITING_STOCK: "outline",
  SHIPPED: "default",
  DELIVERED: "default",
  CANCELLED: "destructive",
};

export function OrderStatusBadge({ status }: { status?: OrderStatus }) {
  if (!status) return null;
  return <Badge variant={ORDER_VARIANTS[status]}>{formatEnum(status)}</Badge>;
}

export function FulfillmentStatusBadge({ status }: { status?: FulfillmentStatus }) {
  if (!status) return null;
  return <Badge variant={FULFILLMENT_VARIANTS[status]}>{formatEnum(status)}</Badge>;
}
