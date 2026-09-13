import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Pagination } from "@/components/catalog/Pagination";
import { NativeSelect } from "@/components/forms/NativeSelect";
import { Notice } from "@/components/Notice";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { searchAdminOrders } from "@/lib/api";
import { OrderResponseStatusValues } from "@/lib/api-enums";
import { getPage, getParam, pickEnum } from "@/lib/catalog";
import { formatDateTime, formatEnum, formatPrice } from "@/lib/format";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Orders" };

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  const { token } = await requireAdmin();
  const query = await searchParams;
  const page = getPage(query);
  const status = pickEnum(getParam(query, "status"), OrderResponseStatusValues);
  const result = await searchAdminOrders(
    { status, q: getParam(query, "q"), page: page - 1, size: 25, sort: ["createdAt,desc"] },
    { token },
  );
  const orders = result.content ?? [];

  return (
    <div>
      <AdminPageHeader title="Orders" description={`${result.totalElements ?? 0} orders`} />

      <Form action="/admin/orders" className="mb-4 grid gap-2 sm:grid-cols-[1fr_14rem_auto]">
        <Input
          name="q"
          defaultValue={getParam(query, "q")}
          placeholder="Order number or customer email"
          aria-label="Search orders"
          className="h-9"
        />
        <NativeSelect name="status" defaultValue={status ?? ""} aria-label="Status">
          <option value="">All statuses</option>
          {OrderResponseStatusValues.map((value) => (
            <option key={value} value={value}>
              {formatEnum(value)}
            </option>
          ))}
        </NativeSelect>
        <Button type="submit" variant="outline" className="h-9">
          Filter
        </Button>
      </Form>

      {orders.length === 0 ? (
        <Notice>No orders found.</Notice>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Order</TableHead>
                <TableHead>Placed</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead className="pr-4 text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="pl-4">
                    <Link href={`/admin/orders/${order.id}`} className="font-medium text-primary hover:underline">
                      {order.orderNumber}
                    </Link>
                    {order.containsPreorders && (
                      <Badge variant="outline" className="ml-2">
                        Pre-order
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                  <TableCell>{order.customerEmail}</TableCell>
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
      <Pagination page={page} totalPages={result.totalPages ?? 0} basePath="/admin/orders" searchParams={query} />
    </div>
  );
}
