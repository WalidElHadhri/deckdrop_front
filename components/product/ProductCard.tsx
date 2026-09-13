import Link from "next/link";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { ProductBadges } from "@/components/product/ProductBadges";
import { ProductImage } from "@/components/product/ProductImage";
import { buttonVariants } from "@/components/ui/button";
import { formatDate, formatPrice } from "@/lib/format";
import type { StorefrontGame } from "@/lib/games";
import { productHref } from "@/lib/products";
import { cn } from "@/lib/utils";
import type { ProductResponse } from "@/types/api";

export function ProductCard({ product, game }: { product: ProductResponse; game?: StorefrontGame }) {
  const href = game && product.slug ? productHref(game.slug, product.slug) : undefined;
  const isSingle = product.productType === "SINGLE";
  const soldOut = product.availability === "OUT_OF_STOCK";

  return (
    <article className="relative flex h-full flex-col gap-3 rounded-xl border bg-card p-3 transition-shadow hover:shadow-md">
      <div className="relative">
        <ProductImage
          src={product.imageUrls?.[0]}
          alt={product.name ?? ""}
          gameName={game?.name}
          productType={product.productType}
        />
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          <ProductBadges product={product} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1">
        {game && <p className="text-xs text-muted-foreground">{game.displayName}</p>}
        <h3 className="line-clamp-2 text-sm leading-snug font-medium">
          {/* Stretched link: the whole card is clickable, the button below stays on top. */}
          {href ? (
            <Link href={href} className="after:absolute after:inset-0 after:rounded-xl">
              {product.name}
            </Link>
          ) : (
            product.name
          )}
        </h3>
        {product.availability === "PREORDER" && product.releaseDate && (
          <p className="text-xs text-muted-foreground">Releases {formatDate(product.releaseDate)}</p>
        )}
        <p className="mt-auto pt-1 font-semibold">
          {isSingle && <span className="text-xs font-normal text-muted-foreground">From </span>}
          {formatPrice(product.basePrice)}
        </p>
      </div>

      <div className="relative z-10">
        {isSingle ? (
          href && (
            <Link href={href} className={cn(buttonVariants({ variant: "outline" }), "h-9 w-full")}>
              View versions
            </Link>
          )
        ) : (
          <AddToCartButton
            item={{ productId: product.id! }}
            disabled={soldOut}
            label={soldOut ? "Out of stock" : product.preorder ? "Pre-order" : "Add to cart"}
          />
        )}
      </div>
    </article>
  );
}
