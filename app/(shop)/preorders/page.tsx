import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CatalogView } from "@/components/catalog/CatalogView";
import { PageHeader } from "@/components/PageHeader";
import { getStorefrontGames } from "@/lib/games";

export const metadata: Metadata = { title: "Pre-orders" };

export default async function PreordersPage({ searchParams }: PageProps<"/preorders">) {
  const [games, query] = await Promise.all([getStorefrontGames(), searchParams]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Pre-orders" }]} />
      <PageHeader
        title="Pre-orders"
        description="Reserve upcoming releases today. Pre-order items ship as soon as stock arrives; anything in stock in the same order ships right away."
      />
      <CatalogView
        basePath="/preorders"
        searchParams={query}
        fixed={{ availability: "PREORDER" }}
        defaultSort="releaseDate,asc"
        filters={{ games, productTypes: true }}
      />
    </div>
  );
}
