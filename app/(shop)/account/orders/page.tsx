import type { Metadata } from "next";
import Link from "next/link";
import { Pagination } from "@/components/catalog/Pagination";
import { Notice } from "@/components/Notice";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listMyOrders } from "@/lib/api";
import { getPage } from "@/lib/catalog";
import { formatDate, formatPrice } from "@/lib/format";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Orders" };

export default async function OrdersPage({ searchParams }: PageProps<"/account/orders">) {
  const { token } = await requireSession("/account/orders");
  const query = await searchParams;
  const page = getPage(query);
  const result = await listMyOrders({ page: page - 1, size: 10, sort: ["createdAt,desc"] }, { token });
  const orders = result.content ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
      {orders.length === 0 ? (
        <Notice>
          You haven&apos;t placed any orders yet.{" "}
          <Link href="/" className="font-medium text-primary hover:underline">
            Start shopping
          </Link>
        </Notice>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Order</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead className="pr-4 text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="pl-4 font-medium">
                    <Link href={`/account/orders/${order.id}`} className="text-primary hover:underline">
                      {order.orderNumber}
                    </Link>
                    {order.containsPreorders && (
                      <Badge variant="outline" className="ml-2">
                        Pre-order
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{order.itemCount}</TableCell>
                  <TableCell className="pr-4 text-right tabular-nums">{formatPrice(order.totalAmount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Pagination page={page} totalPages={result.totalPages ?? 0} basePath="/account/orders" searchParams={query} />
    </div>
  );
}
