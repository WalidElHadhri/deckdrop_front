import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CatalogView } from "@/components/catalog/CatalogView";
import { PageHeader } from "@/components/PageHeader";
import { getParam } from "@/lib/catalog";
import { getStorefrontGames } from "@/lib/games";
import { ALL_RARITIES } from "@/lib/rarities";

export async function generateMetadata({ searchParams }: PageProps<"/search">): Promise<Metadata> {
  const q = getParam(await searchParams, "q");
  return { title: q ? `Search: ${q}` : "All products" };
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const [games, query] = await Promise.all([getStorefrontGames(), searchParams]);
  const q = getParam(query, "q");

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: q ? "Search" : "All products" }]} />
      <PageHeader title={q ? `Results for “${q}”` : "All products"} />
      <CatalogView
        basePath="/search"
        searchParams={query}
        filters={{ games, productTypes: true, availability: true, rarities: ALL_RARITIES }}
      />
    </div>
  );
}
