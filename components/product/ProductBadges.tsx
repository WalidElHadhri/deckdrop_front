import { Badge } from "@/components/ui/badge";
import { isNewArrival } from "@/lib/products";
import type { ProductResponse } from "@/types/api";

export function ProductBadges({ product }: { product: ProductResponse }) {
  return (
    <>
      {product.availability === "PREORDER" && <Badge>Pre-order</Badge>}
      {product.availability === "OUT_OF_STOCK" && (
        <Badge variant="outline" className="bg-background">
          Out of stock
        </Badge>
      )}
      {product.availability === "IN_STOCK" && isNewArrival(product) && <Badge variant="secondary">New arrival</Badge>}
    </>
  );
}
