import { Notice } from "@/components/Notice";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CONDITION_LABELS, formatEnum, formatPrice } from "@/lib/format";
import type { CardVariant, VariantType } from "@/lib/variants";

export function VariantTable({
  productId,
  variantType,
  variants,
}: {
  productId: number;
  variantType: VariantType;
  variants: CardVariant[];
}) {
  if (variants.length === 0) return <Notice>No versions of this card are listed yet.</Notice>;

  const sorted = [...variants].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  const extraColumn = variantType === "POKEMON" ? "Finish" : variantType === "ONE_PIECE" ? "Card type" : undefined;

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Set / No.</TableHead>
            <TableHead>Rarity</TableHead>
            {extraColumn && <TableHead>{extraColumn}</TableHead>}
            <TableHead>Condition</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="pr-4">
              <span className="sr-only">Add to cart</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((variant) => {
            const stock = variant.stockQuantity ?? 0;
            return (
              <TableRow key={variant.id}>
                <TableCell className="pl-4 font-medium">
                  {[variant.setCode, variant.cardNumber].filter(Boolean).join("-")}
                </TableCell>
                <TableCell>{formatEnum(variant.rarity)}</TableCell>
                {extraColumn && (
                  <TableCell>
                    {"holoType" in variant ? formatEnum(variant.holoType) : "cardType" in variant ? formatEnum(variant.cardType) : ""}
                  </TableCell>
                )}
                <TableCell title={variant.condition ? CONDITION_LABELS[variant.condition] : undefined}>
                  {variant.condition ? CONDITION_LABELS[variant.condition] : "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">{stock > 0 ? stock : "Sold out"}</TableCell>
                <TableCell className="text-right font-semibold tabular-nums">{formatPrice(variant.price)}</TableCell>
                <TableCell className="w-44 pr-4">
                  <AddToCartButton
                    item={{ productId, variantType, variantId: variant.id }}
                    disabled={stock <= 0}
                    label={stock > 0 ? "Add" : "Sold out"}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
