import { FulfillmentStatusBadge } from "@/components/orders/OrderStatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCountry, formatDate, formatDateTime, formatPrice } from "@/lib/format";
import type { OrderResponse, ShippingAddressResponse } from "@/types/api";

export function OrderItemsTable({ order }: { order: OrderResponse }) {
  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Item</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="pr-4">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(order.items ?? []).map((item) => (
            <TableRow key={item.id}>
              <TableCell className="pl-4 whitespace-normal">
                <p className="font-medium">{item.productName}</p>
                {item.variantDescription && <p className="text-xs text-muted-foreground">{item.variantDescription}</p>}
                {item.preorder && (
                  <p className="text-xs text-muted-foreground">Pre-order · releases {formatDate(item.releaseDate)}</p>
                )}
              </TableCell>
              <TableCell className="text-right tabular-nums">{item.quantity}</TableCell>
              <TableCell className="text-right tabular-nums">{formatPrice(item.priceAtPurchase)}</TableCell>
              <TableCell className="text-right tabular-nums">{formatPrice(item.lineTotal)}</TableCell>
              <TableCell className="pr-4">
                <FulfillmentStatusBadge status={item.fulfillmentStatus} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function OrderTotals({ order }: { order: OrderResponse }) {
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Subtotal</dt>
        <dd className="tabular-nums">{formatPrice(order.subtotal)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Shipping</dt>
        <dd className="tabular-nums">{order.shippingCost === 0 ? "Free" : formatPrice(order.shippingCost)}</dd>
      </div>
      <div className="flex justify-between border-t pt-2 text-base font-semibold">
        <dt>Total</dt>
        <dd className="tabular-nums">{formatPrice(order.totalAmount)}</dd>
      </div>
    </dl>
  );
}

export function AddressLines({ address }: { address?: ShippingAddressResponse }) {
  if (!address) return <p className="text-sm text-muted-foreground">—</p>;
  return (
    <address className="text-sm leading-relaxed not-italic">
      {address.fullName}
      <br />
      {address.line1}
      {address.line2 && (
        <>
          <br />
          {address.line2}
        </>
      )}
      <br />
      {address.postalCode} {address.city}
      <br />
      {formatCountry(address.country)}
    </address>
  );
}

export function ShipmentList({ order }: { order: OrderResponse }) {
  const shipments = order.shipments ?? [];
  if (shipments.length === 0) return <p className="text-sm text-muted-foreground">Nothing has shipped yet.</p>;
  const itemName = (id: number) => order.items?.find((item) => item.id === id)?.productName ?? `Item ${id}`;

  return (
    <ul className="space-y-3">
      {shipments.map((shipment) => (
        <li key={shipment.id} className="rounded-lg border p-3 text-sm">
          <p className="font-medium">
            {shipment.carrier} · <span className="font-mono">{shipment.trackingNumber}</span>
          </p>
          <p className="text-muted-foreground">
            Shipped {formatDateTime(shipment.shippedAt)}
            {shipment.deliveredAt && ` · Delivered ${formatDateTime(shipment.deliveredAt)}`}
          </p>
          {shipment.itemIds && shipment.itemIds.length > 0 && (
            <p className="text-muted-foreground">Contains: {shipment.itemIds.map(itemName).join(", ")}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
