import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CatalogView } from "@/components/catalog/CatalogView";
import { PageHeader } from "@/components/PageHeader";
import { listCategories } from "@/lib/api";
import { getParam, hrefWith } from "@/lib/catalog";
import { getStorefrontGames } from "@/lib/games";
import { RARITIES } from "@/lib/rarities";
import { cn } from "@/lib/utils";

async function findGame(slug: string) {
  return (await getStorefrontGames()).find((game) => game.slug === slug);
}

export async function generateMetadata({ params }: PageProps<"/[game]">): Promise<Metadata> {
  const game = await findGame((await params).game);
  return { title: game?.displayName ?? "Not found" };
}

export default async function GamePage({ params, searchParams }: PageProps<"/[game]">) {
  const game = await findGame((await params).game);
  if (!game) notFound();

  const [categories, query] = await Promise.all([listCategories({ gameId: game.id }), searchParams]);
  const basePath = `/${game.slug}`;
  const activeSlug = getParam(query, "category");
  const activeCategory = categories.find((category) => category.slug === activeSlug);
  const topLevel = categories.filter((category) => category.parentCategoryId == null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: game.displayName, href: basePath },
          activeCategory && { label: activeCategory.name ?? "" },
        ]}
      />
      <PageHeader title={activeCategory ? `${game.displayName} · ${activeCategory.name}` : game.displayName}>
        {topLevel.length > 0 && (
          <nav aria-label="Categories" className="flex flex-wrap gap-2 pt-2">
            <CategoryChip href={basePath} active={!activeCategory} label="Everything" />
            {topLevel.map((category) => (
              <CategoryChip
                key={category.id}
                href={hrefWith(basePath, {}, { category: category.slug })}
                active={category.id === activeCategory?.id || category.id === activeCategory?.parentCategoryId}
                label={category.name ?? ""}
              />
            ))}
          </nav>
        )}
      </PageHeader>

      <CatalogView
        basePath={basePath}
        searchParams={query}
        fixed={{ gameId: game.id }}
        filters={{
          categories,
          productTypes: true,
          availability: true,
          rarities: game.name ? RARITIES[game.name] : undefined,
        }}
      />
    </div>
  );
}

function CategoryChip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-full border px-3 py-1 text-sm transition-colors",
        active ? "border-primary bg-primary text-primary-foreground" : "hover:border-foreground/30",
      )}
    >
      {label}
    </Link>
  );
}
