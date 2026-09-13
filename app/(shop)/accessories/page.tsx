import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CatalogView } from "@/components/catalog/CatalogView";
import { PageHeader } from "@/components/PageHeader";
import { getStorefrontGames } from "@/lib/games";

export const metadata: Metadata = { title: "Accessories" };

export default async function AccessoriesPage({ searchParams }: PageProps<"/accessories">) {
  const [games, query] = await Promise.all([getStorefrontGames(), searchParams]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Accessories" }]} />
      <PageHeader title="Accessories" description="Sleeves, playmats, deck boxes and more to protect and play your cards." />
      <CatalogView
        basePath="/accessories"
        searchParams={query}
        fixed={{ type: "ACCESSORY" }}
        filters={{ games, availability: true }}
      />
    </div>
  );
}
