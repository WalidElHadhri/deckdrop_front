import { connection } from "next/server";
import { Notice } from "@/components/Notice";
import { ProductCard } from "@/components/product/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { searchProducts } from "@/lib/api";
import { getGamesById } from "@/lib/games";
import type { ProductResponse, SearchProductsParams } from "@/types/api";

const RAIL_ITEM = "w-44 shrink-0 snap-start sm:w-52";

/** A horizontally scrollable row of products for a homepage section. */
export async function ProductRail({ params, emptyMessage }: { params: SearchProductsParams; emptyMessage: string }) {
  await connection();

  let products: ProductResponse[];
  try {
    products = (await searchProducts({ size: 12, ...params })).content ?? [];
  } catch (error) {
    console.error("Failed to load a product rail", error);
    return <Notice>Products couldn&apos;t be loaded right now.</Notice>;
  }
  if (products.length === 0) return <Notice>{emptyMessage}</Notice>;

  const gamesById = await getGamesById();
  return (
    <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-3">
      {products.map((product) => (
        <li key={product.id} className={RAIL_ITEM}>
          <ProductCard product={product} game={product.gameId !== undefined ? gamesById.get(product.gameId) : undefined} />
        </li>
      ))}
    </ul>
  );
}

export function ProductRailSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden">
      {[0, 1, 2, 3, 4].map((index) => (
        <Skeleton key={index} className={`${RAIL_ITEM} h-80 rounded-xl`} />
      ))}
    </div>
  );
}
