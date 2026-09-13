import { Suspense } from "react";
import { GameQuickLinks, GameQuickLinksSkeleton } from "@/components/GameQuickLinks";
import { HeroBanner } from "@/components/HeroBanner";
import { ProductRail, ProductRailSkeleton } from "@/components/product/ProductRail";
import { SectionHeading } from "@/components/SectionHeading";

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-6 md:gap-14 md:py-8">
      <HeroBanner />

      <section id="shop-by-game" aria-labelledby="shop-by-game-heading" className="scroll-mt-36">
        <SectionHeading id="shop-by-game-heading" title="Shop by game" />
        <Suspense fallback={<GameQuickLinksSkeleton />}>
          <GameQuickLinks />
        </Suspense>
      </section>

      <section aria-labelledby="new-arrivals-heading">
        <SectionHeading id="new-arrivals-heading" title="New arrivals" href="/search?availability=IN_STOCK" />
        <Suspense fallback={<ProductRailSkeleton />}>
          <ProductRail
            params={{ availability: "IN_STOCK", sort: ["createdAt,desc"] }}
            emptyMessage="New products are on their way."
          />
        </Suspense>
      </section>

      <section aria-labelledby="preorders-heading">
        <SectionHeading id="preorders-heading" title="Pre-orders" href="/preorders" />
        <Suspense fallback={<ProductRailSkeleton />}>
          <ProductRail
            params={{ availability: "PREORDER", sort: ["releaseDate,asc"] }}
            emptyMessage="No pre-orders are open right now."
          />
        </Suspense>
      </section>
    </div>
  );
}
