import Link from "next/link";
import { CartLineControls } from "@/components/cart/CartLineControls";
import { ProductImage } from "@/components/product/ProductImage";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatPrice } from "@/lib/format";
import { productHref } from "@/lib/products";
import type { CartLineResponse } from "@/types/api";

export function CartLineItem({ line, editable = true }: { line: CartLineResponse; editable?: boolean }) {
  const href = line.gameSlug && line.productSlug ? productHref(line.gameSlug, line.productSlug) : undefined;

  return (
    <li className="grid grid-cols-[4.5rem_1fr] gap-4 p-4 sm:grid-cols-[5rem_1fr_auto]">
      <ProductImage src={line.imageUrl} alt="" className="border" />

      <div className="min-w-0 space-y-1">
        <p className="font-medium">
          {href ? (
            <Link href={href} className="hover:underline">
              {line.productName}
            </Link>
          ) : (
            line.productName
          )}
        </p>
        {line.variantDescription && <p className="text-sm text-muted-foreground">{line.variantDescription}</p>}
        {line.preorder && (
          <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge>Pre-order</Badge>
            Ships when released ({formatDate(line.releaseDate)})
          </p>
        )}
        {line.problem && <p className="text-sm font-medium text-destructive">{line.problem}</p>}
        <p className="text-sm text-muted-foreground">{formatPrice(line.unitPrice)} each</p>
        {editable && line.id !== undefined && (
          <div className="pt-1 sm:hidden">
            <CartLineControls lineId={line.id} quantity={line.quantity ?? 1} />
          </div>
        )}
      </div>

      <div className="col-start-2 flex flex-col items-end gap-2 sm:col-start-auto">
        <p className="font-semibold tabular-nums">
          {!editable && <span className="mr-1 font-normal text-muted-foreground">{line.quantity} ×</span>}
          {formatPrice(line.lineTotal)}
        </p>
        {editable && line.id !== undefined && (
          <div className="hidden sm:block">
            <CartLineControls lineId={line.id} quantity={line.quantity ?? 1} />
          </div>
        )}
      </div>
    </li>
  );
}
