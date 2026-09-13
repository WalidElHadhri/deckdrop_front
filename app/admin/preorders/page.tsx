import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Notice } from "@/components/Notice";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listPreorderSummaries } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Pre-orders" };

export default async function AdminPreordersPage() {
  const { token } = await requireAdmin();
  const summaries = await listPreorderSummaries({ token });

  return (
    <div className="max-w-5xl">
      <AdminPageHeader
        title="Pre-orders"
        description="Paid pre-order demand per product. Release a product's pre-orders once its stock has arrived."
      />
      {summaries.length === 0 ? (
        <Notice>No pre-order products yet.</Notice>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Product</TableHead>
                <TableHead>Release date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Allocation left</TableHead>
                <TableHead className="text-right">Units awaiting stock</TableHead>
                <TableHead className="pr-4 text-right">Orders</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaries.map((summary) => (
                <TableRow key={summary.productId}>
                  <TableCell className="pl-4">
                    <Link href={`/admin/preorders/${summary.productId}`} className="font-medium text-primary hover:underline">
                      {summary.productName}
                    </Link>
                  </TableCell>
                  <TableCell>{formatDate(summary.releaseDate)}</TableCell>
                  <TableCell>
                    <Badge variant={summary.stillPreorder ? "secondary" : "outline"}>
                      {summary.stillPreorder ? "Pre-order" : "Released"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{summary.remainingAllocation}</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{summary.unitsAwaitingStock}</TableCell>
                  <TableCell className="pr-4 text-right tabular-nums">{summary.ordersAwaitingStock}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
