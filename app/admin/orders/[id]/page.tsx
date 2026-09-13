import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CreateShipmentForm, EditShipmentForm } from "@/components/admin/ShipmentForms";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ActionButton } from "@/components/forms/ActionButton";
import { AddressLines, OrderItemsTable, OrderTotals } from "@/components/orders/OrderDetails";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { Badge } from "@/components/ui/badge";
import { getAdminOrder, listAdminOrderPayments } from "@/lib/api";
import { cancelAdminOrderAction, markShipmentDeliveredAction } from "@/lib/actions/admin";
import { orNotFound, parseId } from "@/lib/api-helpers";
import { formatDateTime, formatEnum, formatPrice } from "@/lib/format";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Order" };

export default async function AdminOrderPage({ params }: PageProps<"/admin/orders/[id]">) {
  const id = parseId((await params).id);
  const { token } = await requireAdmin();
  const [order, payments] = await Promise.all([
    orNotFound(getAdminOrder(id, { token })),
    listAdminOrderPayments(id, { token }).catch(() => []),
  ]);

  const items = order.items ?? [];
  const shipments = order.shipments ?? [];
  const readyToShip = items.filter((item) => item.fulfillmentStatus === "READY_TO_SHIP");
  const awaitingStock = items.filter((item) => item.fulfillmentStatus === "AWAITING_STOCK");
  const canCancel = order.status !== "CANCELLED" && shipments.length === 0;
  const itemLabel = (itemId: number) => {
    const item = items.find((candidate) => candidate.id === itemId);
    return item ? `${item.quantity} × ${item.productName}` : `Item ${itemId}`;
  };

  return (
    <div className="max-w-6xl">
      <Breadcrumbs items={[{ label: "Orders", href: "/admin/orders" }, { label: order.orderNumber ?? "Order" }]} />
      <div className="mt-3">
        <AdminPageHeader
          title={
            <>
              Order {order.orderNumber} <OrderStatusBadge status={order.status} />
            </>
          }
          description={`Placed ${formatDateTime(order.createdAt)}${order.paidAt ? ` · Paid ${formatDateTime(order.paidAt)}` : ""}`}
          actions={
            canCancel && (
              <ActionButton
                variant="destructive"
                className="h-9"
                action={cancelAdminOrderAction.bind(null, id)}
                confirmMessage="Cancel this order? Its stock is released and a paid order is refunded automatically."
              >
                Cancel order
              </ActionButton>
            )
          }
        />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <OrderItemsTable order={order} />

          {readyToShip.length > 0 && (
            <section aria-labelledby="ship-heading" className="space-y-4 rounded-xl border p-5">
              <h2 id="ship-heading" className="text-lg font-semibold">
                Ship items
              </h2>
              <CreateShipmentForm
                key={readyToShip.map((item) => item.id).join("-")}
                orderId={id}
                items={readyToShip.map((item) => ({ id: item.id!, label: itemLabel(item.id!) }))}
              />
            </section>
          )}
          {awaitingStock.length > 0 && (
            <p className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
              {awaitingStock.length} pre-order item(s) are waiting for stock. They become ready to ship when their product&apos;s
              pre-orders are released.
            </p>
          )}

          <section aria-labelledby="shipments-heading" className="space-y-3">
            <h2 id="shipments-heading" className="text-lg font-semibold">
              Shipments
            </h2>
            {shipments.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing has shipped yet.</p>
            ) : (
              <ul className="space-y-3">
                {shipments.map((shipment) => (
                  <li key={shipment.id} className="space-y-3 rounded-xl border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <p>
                        Shipped {formatDateTime(shipment.shippedAt)}
                        {shipment.deliveredAt ? (
                          <Badge className="ml-2">Delivered {formatDateTime(shipment.deliveredAt)}</Badge>
                        ) : (
                          <Badge variant="outline" className="ml-2">
                            In transit
                          </Badge>
                        )}
                      </p>
                      {!shipment.deliveredAt && (
                        <ActionButton
                          variant="outline"
                          size="sm"
                          action={markShipmentDeliveredAction.bind(null, id, shipment.id!)}
                        >
                          Mark delivered
                        </ActionButton>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{(shipment.itemIds ?? []).map(itemLabel).join(", ")}</p>
                    <EditShipmentForm orderId={id} shipment={shipment} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="space-y-1 rounded-xl border p-4 text-sm">
            <h2 className="mb-2 font-semibold">Customer</h2>
            <p>{order.customerName}</p>
            <p className="text-muted-foreground">{order.customerEmail}</p>
          </section>
          <section className="space-y-2 rounded-xl border p-4">
            <h2 className="font-semibold">Shipping address</h2>
            <AddressLines address={order.shippingAddress} />
          </section>
          <section className="space-y-2 rounded-xl border p-4">
            <h2 className="font-semibold">Totals</h2>
            <OrderTotals order={order} />
          </section>
          <section className="space-y-2 rounded-xl border p-4">
            <h2 className="font-semibold">Payments</h2>
            {payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payment attempts yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {payments.map((payment) => (
                  <li key={payment.id} className="flex flex-wrap items-center justify-between gap-2">
                    <span>
                      {formatEnum(payment.provider)} · {formatPrice(payment.amount)}
                      <span className="block text-xs text-muted-foreground">{formatDateTime(payment.createdAt)}</span>
                    </span>
                    <Badge variant={payment.status === "SUCCEEDED" ? "default" : "outline"}>{formatEnum(payment.status)}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
