import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ActionButton } from "@/components/forms/ActionButton";
import { Notice } from "@/components/Notice";
import { buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getProduct, listPreorderItems, listPreorderSummaries } from "@/lib/api";
import { releasePreordersAction } from "@/lib/actions/admin";
import { orNotFound, parseId } from "@/lib/api-helpers";
import { formatDate, formatDateTime } from "@/lib/format";
import { requireAdmin } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Pre-order demand" };

export default async function AdminPreorderPage({ params }: PageProps<"/admin/preorders/[productId]">) {
  const productId = parseId((await params).productId);
  const { token } = await requireAdmin();
  const [product, items, summaries] = await Promise.all([
    orNotFound(getProduct(productId)),
    listPreorderItems(productId, { token }),
    listPreorderSummaries({ token }),
  ]);
  const summary = summaries.find((candidate) => candidate.productId === productId);
  const units = items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);

  return (
    <div className="max-w-5xl">
      <Breadcrumbs items={[{ label: "Pre-orders", href: "/admin/preorders" }, { label: product.name ?? "Product" }]} />
      <div className="mt-3">
        <AdminPageHeader
          title={product.name}
          description={`Release date ${formatDate(product.releaseDate ?? summary?.releaseDate)} · ${units} paid unit(s) in ${summary?.ordersAwaitingStock ?? 0} order(s) awaiting stock`}
          actions={
            <>
              <Link href={`/admin/products/${productId}`} className={cn(buttonVariants({ variant: "outline" }), "h-9")}>
                Edit product
              </Link>
              <ActionButton
                className="h-9"
                disabled={items.length === 0}
                action={releasePreordersAction.bind(null, productId)}
                confirmMessage={`Stock has arrived? This turns the product into a regular (non pre-order) product and marks all ${units} awaiting unit(s) as ready to ship. Set its new stock level on the product page afterwards.`}
              >
                Release pre-orders
              </ActionButton>
            </>
          }
        />
      </div>

      {items.length === 0 ? (
        <Notice>No paid pre-orders are waiting for this product.</Notice>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Card version</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="pr-4">Paid</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.orderItemId}>
                  <TableCell className="pl-4">
                    <Link href={`/admin/orders/${item.orderId}`} className="font-medium text-primary hover:underline">
                      {item.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{item.customerEmail}</TableCell>
                  <TableCell>{item.variantId ? `#${item.variantId}` : "—"}</TableCell>
                  <TableCell className="text-right tabular-nums">{item.quantity}</TableCell>
                  <TableCell className="pr-4">{formatDateTime(item.paidAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
