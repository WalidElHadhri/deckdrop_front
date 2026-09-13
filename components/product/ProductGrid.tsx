import { ProductCard } from "@/components/product/ProductCard";
import { getGamesById } from "@/lib/games";
import { cn } from "@/lib/utils";
import type { ProductResponse } from "@/types/api";

export async function ProductGrid({ products, className }: { products: ProductResponse[]; className?: string }) {
  const gamesById = await getGamesById();
  return (
    <ul className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4", className)}>
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} game={product.gameId !== undefined ? gamesById.get(product.gameId) : undefined} />
        </li>
      ))}
    </ul>
  );
}
