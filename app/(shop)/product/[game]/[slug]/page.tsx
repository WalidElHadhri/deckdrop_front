import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarClock } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { ProductBadges } from "@/components/product/ProductBadges";
import { ProductImage } from "@/components/product/ProductImage";
import { VariantTable } from "@/components/product/VariantTable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getCategory, getProductBySlug } from "@/lib/api";
import { orNotFound } from "@/lib/api-helpers";
import { formatDate, formatPrice } from "@/lib/format";
import { getStorefrontGames } from "@/lib/games";
import { listVariants, type CardVariant } from "@/lib/variants";
import type { ProductResponse } from "@/types/api";

const LOW_STOCK = 5;

export async function generateMetadata({ params }: PageProps<"/product/[game]/[slug]">): Promise<Metadata> {
  const { game, slug } = await params;
  const product = await getProductBySlug(game, slug).catch(() => undefined);
  return { title: product?.name ?? "Product not found", description: product?.description };
}

export default async function ProductPage({ params }: PageProps<"/product/[game]/[slug]">) {
  const { game: gameSlug, slug } = await params;
  const [product, games] = await Promise.all([orNotFound(getProductBySlug(gameSlug, slug)), getStorefrontGames()]);
  const game = games.find((candidate) => candidate.slug === gameSlug);
  if (!game || product.id === undefined) notFound();

  const isSingle = product.productType === "SINGLE";
  const [category, variants] = await Promise.all([
    product.categoryId !== undefined ? getCategory(product.categoryId).catch(() => undefined) : undefined,
    isSingle && game.name ? listVariants(game.name, product.id) : Promise.resolve<CardVariant[]>([]),
  ]);
  const images = product.imageUrls ?? [];
  const soldOut = product.availability === "OUT_OF_STOCK";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: game.displayName, href: `/${game.slug}` },
          category && { label: category.name ?? "", href: `/${game.slug}?category=${category.slug}` },
          { label: product.name ?? "" },
        ]}
      />

      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <div className="space-y-3">
          <ProductImage
            src={images[0]}
            alt={product.name ?? ""}
            gameName={game.name}
            productType={product.productType}
            className="border"
          />
          {images.length > 1 && (
            <ul className="grid grid-cols-5 gap-2">
              {images.slice(1, 6).map((src) => (
                <li key={src}>
                  <ProductImage src={src} alt="" className="border" />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-5">
          <div className="flex flex-wrap gap-1.5">
            <ProductBadges product={product} />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{product.name}</h1>
            <p className="text-sm text-muted-foreground">
              {game.displayName}
              {product.setCode && ` · Set ${product.setCode}`}
            </p>
          </div>

          <p className="text-3xl font-semibold">
            {isSingle && <span className="text-base font-normal text-muted-foreground">From </span>}
            {formatPrice(product.basePrice)}
            <span className="ml-2 text-xs font-normal text-muted-foreground">incl. VAT</span>
          </p>

          <StockStatus product={product} />

          {product.availability === "PREORDER" && (
            <Alert>
              <CalendarClock />
              <AlertTitle>Expected release: {formatDate(product.releaseDate)}</AlertTitle>
              <AlertDescription>
                Pre-order now and we&apos;ll ship as soon as stock arrives. In-stock items in the same order ship right
                away.
              </AlertDescription>
            </Alert>
          )}

          {isSingle ? (
            <p className="text-sm text-muted-foreground">
              Choose a printing and condition in the <a href="#versions" className="font-medium text-primary underline">list of versions</a> below.
            </p>
          ) : (
            <AddToCartButton
              item={{ productId: product.id }}
              withQuantity
              maxQuantity={product.stockQuantity}
              disabled={soldOut}
              label={soldOut ? "Out of stock" : product.preorder ? "Pre-order" : "Add to cart"}
              className="max-w-sm"
            />
          )}

          {product.description && (
            <div className="space-y-2 border-t pt-5">
              <h2 className="font-semibold">Description</h2>
              <p className="text-sm whitespace-pre-line text-muted-foreground">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {isSingle && game.name && (
        <section id="versions" aria-labelledby="versions-heading" className="mt-12 scroll-mt-36">
          <h2 id="versions-heading" className="mb-4 text-xl font-semibold tracking-tight">
            Available versions
          </h2>
          <VariantTable productId={product.id} variantType={game.name} variants={variants} />
        </section>
      )}
    </div>
  );
}

function StockStatus({ product }: { product: ProductResponse }) {
  const stock = product.stockQuantity ?? 0;
  switch (product.availability) {
    case "IN_STOCK":
      return (
        <p className="text-sm font-medium text-emerald-700">
          In stock{stock <= LOW_STOCK && ` · only ${stock} left`}
        </p>
      );
    case "PREORDER":
      return <p className="text-sm font-medium text-primary">Available to pre-order</p>;
    default:
      return <p className="text-sm font-medium text-muted-foreground">Out of stock</p>;
  }
}
