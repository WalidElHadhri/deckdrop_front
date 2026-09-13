import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ActionButton } from "@/components/forms/ActionButton";
import { AddressLines, OrderItemsTable, OrderTotals, ShipmentList } from "@/components/orders/OrderDetails";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { getMyOrder } from "@/lib/api";
import { cancelOrderAction } from "@/lib/actions/orders";
import { orNotFound, parseId } from "@/lib/api-helpers";
import { formatDateTime } from "@/lib/format";
import { requireSession } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Order details" };

export default async function OrderPage({ params }: PageProps<"/account/orders/[id]">) {
  const id = parseId((await params).id);
  const { token } = await requireSession(`/account/orders/${id}`);
  const order = await orNotFound(getMyOrder(id, { token }));
  const awaitingPayment = order.status === "PENDING_PAYMENT";

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Orders", href: "/account/orders" }, { label: order.orderNumber ?? "Order" }]} />

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="flex flex-wrap items-center gap-3 text-2xl font-bold tracking-tight">
            Order {order.orderNumber} <OrderStatusBadge status={order.status} />
          </h1>
          <p className="text-sm text-muted-foreground">Placed {formatDateTime(order.createdAt)}</p>
          {awaitingPayment && order.paymentDueBy && (
            <p className="text-sm font-medium text-destructive">
              Awaiting payment — unpaid orders are cancelled at {formatDateTime(order.paymentDueBy)}.
            </p>
          )}
        </div>
        {awaitingPayment && (
          <div className="flex gap-2">
            <Link href={`/checkout/${order.id}/payment`} className={cn(buttonVariants(), "h-9 px-4")}>
              Pay now
            </Link>
            <ActionButton
              variant="outline"
              className="h-9"
              action={cancelOrderAction.bind(null, id)}
              confirmMessage="Cancel this order? Reserved items will be released."
            >
              Cancel order
            </ActionButton>
          </div>
        )}
      </header>

      <OrderItemsTable order={order} />

      <div className="grid gap-6 md:grid-cols-3">
        <section className="space-y-2 rounded-xl border p-4">
          <h2 className="font-semibold">Shipping address</h2>
          <AddressLines address={order.shippingAddress} />
        </section>
        <section className="space-y-2 rounded-xl border p-4">
          <h2 className="font-semibold">Shipments</h2>
          <ShipmentList order={order} />
        </section>
        <section className="space-y-2 rounded-xl border p-4">
          <h2 className="font-semibold">Summary</h2>
          <OrderTotals order={order} />
          {order.paidAt && <p className="text-xs text-muted-foreground">Paid {formatDateTime(order.paidAt)}</p>}
        </section>
      </div>
    </div>
  );
}
