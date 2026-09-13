import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Notice } from "@/components/Notice";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAdminOverview } from "@/lib/api";
import { OrderResponseStatusValues } from "@/lib/api-enums";
import { AVAILABILITY_LABELS, PRODUCT_TYPE_LABELS } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { requireAdmin } from "@/lib/session";
import type { SalesPeriod } from "@/types/api";

export default async function AdminOverviewPage() {
  const { token } = await requireAdmin();
  const overview = await getAdminOverview({ token });
  const lowStock = overview.lowStockProducts ?? [];

  return (
    <div className="space-y-8">
      <AdminPageHeader title="Overview" description="Sales and inventory at a glance." />

      <section aria-labelledby="sales-heading" className="space-y-3">
        <h2 id="sales-heading" className="font-semibold">
          Sales
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <SalesCard label="Today" period={overview.today} />
          <SalesCard label="Last 30 days" period={overview.last30Days} />
          <SalesCard label="All time" period={overview.allTime} />
        </div>
      </section>

      <section aria-labelledby="fulfilment-heading" className="space-y-3">
        <h2 id="fulfilment-heading" className="font-semibold">
          Fulfilment
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Units ready to ship" value={overview.unitsReadyToShip} href="/admin/orders?status=PAID" />
          <StatCard label="Pre-order units awaiting stock" value={overview.preorderUnitsAwaitingStock} href="/admin/preorders" />
          <StatCard
            label="Out-of-stock products"
            value={overview.outOfStockProducts}
            href="/admin/products?availability=OUT_OF_STOCK"
          />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <section aria-labelledby="status-heading" className="space-y-3">
          <h2 id="status-heading" className="font-semibold">
            Orders by status
          </h2>
          <ul className="divide-y rounded-xl border">
            {OrderResponseStatusValues.map((status) => (
              <li key={status}>
                <Link
                  href={`/admin/orders?status=${status}`}
                  className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-muted/50"
                >
                  <OrderStatusBadge status={status} />
                  <span className="font-medium tabular-nums">{overview.ordersByStatus?.[status] ?? 0}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="low-stock-heading" className="space-y-3">
          <h2 id="low-stock-heading" className="font-semibold">
            Low stock (≤ {overview.lowStockThreshold})
          </h2>
          {lowStock.length === 0 ? (
            <Notice>No products are running low.</Notice>
          ) : (
            <div className="rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead className="pr-4 text-right">Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStock.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="pl-4">
                        <Link href={`/admin/products/${product.id}`} className="font-medium text-primary hover:underline">
                          {product.name}
                        </Link>
                      </TableCell>
                      <TableCell>{product.productType && PRODUCT_TYPE_LABELS[product.productType]}</TableCell>
                      <TableCell>
                        {product.availability && <Badge variant="outline">{AVAILABILITY_LABELS[product.availability]}</Badge>}
                      </TableCell>
                      <TableCell className="pr-4 text-right tabular-nums">{product.stockQuantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function SalesCard({ label, period }: { label: string; period?: SalesPeriod }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{formatPrice(period?.revenue ?? 0)}</p>
      <p className="text-sm text-muted-foreground">{period?.paidOrders ?? 0} paid orders</p>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value?: number; href: string }) {
  return (
    <Link href={href} className="rounded-xl border bg-card p-4 transition-shadow hover:shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value ?? 0}</p>
    </Link>
  );
}
