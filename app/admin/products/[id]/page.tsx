import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { VariantForm } from "@/components/admin/VariantForm";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ActionButton } from "@/components/forms/ActionButton";
import { buttonVariants } from "@/components/ui/button";
import { getProduct, listCategories } from "@/lib/api";
import { deleteProductAction, deleteVariantAction } from "@/lib/actions/admin";
import { orNotFound, parseId } from "@/lib/api-helpers";
import { getStorefrontGames } from "@/lib/games";
import { productHref } from "@/lib/products";
import { requireAdmin } from "@/lib/session";
import { cn } from "@/lib/utils";
import { listVariants, type CardVariant } from "@/lib/variants";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const id = parseId((await params).id);
  await requireAdmin();
  const [product, games, categories] = await Promise.all([orNotFound(getProduct(id)), getStorefrontGames(), listCategories()]);
  const game = games.find((candidate) => candidate.id === product.gameId);
  const isSingle = product.productType === "SINGLE";
  const variants: CardVariant[] = isSingle && game?.name ? await listVariants(game.name, id) : [];

  return (
    <div className="max-w-5xl space-y-10">
      <div>
        <Breadcrumbs items={[{ label: "Products", href: "/admin/products" }, { label: product.name ?? "Product" }]} />
        <div className="mt-3">
          <AdminPageHeader
            title={product.name}
            description={`${game?.displayName ?? "Unknown game"} · ${product.availability ?? ""}`}
            actions={
              <>
                {game && product.slug && (
                  <Link href={productHref(game.slug, product.slug)} className={cn(buttonVariants({ variant: "outline" }), "h-9")}>
                    View in store
                  </Link>
                )}
                <ActionButton
                  variant="destructive"
                  className="h-9"
                  action={deleteProductAction.bind(null, id)}
                  confirmMessage="Delete this product? This can't be undone."
                >
                  Delete
                </ActionButton>
              </>
            }
          />
        </div>
        <ProductForm key={product.id} product={product} games={games} categories={categories} />
      </div>

      {isSingle && game?.name && (
        <section aria-labelledby="versions-heading" className="space-y-4 border-t pt-8">
          <div>
            <h2 id="versions-heading" className="text-lg font-semibold">
              Card versions
            </h2>
            <p className="text-sm text-muted-foreground">
              Each printing and condition has its own price and stock. The product shows the cheapest in-stock price.
            </p>
          </div>
          <ul className="space-y-3">
            {variants.map((variant) => (
              <li key={variant.id} className="flex flex-col gap-2 rounded-lg border p-3 xl:flex-row xl:items-start">
                <div className="flex-1">
                  <VariantForm variantType={game.name!} productId={id} variant={variant} />
                </div>
                <ActionButton
                  variant="ghost"
                  className="h-9 self-end text-destructive xl:mt-5"
                  action={deleteVariantAction.bind(null, game.name!, id, variant.id!)}
                  confirmMessage="Delete this version?"
                >
                  Delete
                </ActionButton>
              </li>
            ))}
          </ul>
          <div className="rounded-lg border border-dashed p-3">
            <p className="mb-2 text-sm font-medium">Add a version</p>
            <VariantForm variantType={game.name} productId={id} />
          </div>
        </section>
      )}
    </div>
  );
}
