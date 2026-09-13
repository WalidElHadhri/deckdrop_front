import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Pagination } from "@/components/catalog/Pagination";
import { NativeSelect } from "@/components/forms/NativeSelect";
import { Notice } from "@/components/Notice";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { searchProducts } from "@/lib/api";
import { ProductRequestProductTypeValues, ProductResponseAvailabilityValues } from "@/lib/api-enums";
import { AVAILABILITY_LABELS, getPage, getParam, pickEnum, PRODUCT_TYPE_LABELS } from "@/lib/catalog";
import { formatDate, formatPrice } from "@/lib/format";
import { getGamesById, getStorefrontGames } from "@/lib/games";
import { requireAdmin } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Products" };

export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  await requireAdmin();
  const query = await searchParams;
  const page = getPage(query);
  const [result, games, gamesById] = await Promise.all([
    searchProducts({
      q: getParam(query, "q"),
      game: getParam(query, "game"),
      type: pickEnum(getParam(query, "type"), ProductRequestProductTypeValues),
      availability: pickEnum(getParam(query, "availability"), ProductResponseAvailabilityValues),
      page: page - 1,
      size: 25,
      sort: ["createdAt,desc"],
    }),
    getStorefrontGames(),
    getGamesById(),
  ]);
  const products = result.content ?? [];

  return (
    <div>
      <AdminPageHeader
        title="Products"
        description={`${result.totalElements ?? 0} products`}
        actions={
          <Link href="/admin/products/new" className={cn(buttonVariants(), "h-9 px-4")}>
            New product
          </Link>
        }
      />

      <Form action="/admin/products" className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_10rem_10rem_10rem_auto]">
        <Input name="q" defaultValue={getParam(query, "q")} placeholder="Search by name" aria-label="Search by name" className="h-9" />
        <NativeSelect name="game" defaultValue={getParam(query, "game") ?? ""} aria-label="Game">
          <option value="">All games</option>
          {games.map((game) => (
            <option key={game.id} value={game.slug}>
              {game.displayName}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect name="type" defaultValue={getParam(query, "type") ?? ""} aria-label="Product type">
          <option value="">All types</option>
          {Object.entries(PRODUCT_TYPE_LABELS).map(([type, label]) => (
            <option key={type} value={type}>
              {label}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect name="availability" defaultValue={getParam(query, "availability") ?? ""} aria-label="Availability">
          <option value="">Any availability</option>
          {Object.entries(AVAILABILITY_LABELS).map(([availability, label]) => (
            <option key={availability} value={availability}>
              {label}
            </option>
          ))}
        </NativeSelect>
        <Button type="submit" variant="outline" className="h-9">
          Filter
        </Button>
      </Form>

      {products.length === 0 ? (
        <Notice>No products found.</Notice>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Name</TableHead>
                <TableHead>Game</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="pr-4 text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="max-w-80 truncate pl-4">
                    <Link href={`/admin/products/${product.id}`} className="font-medium text-primary hover:underline">
                      {product.name}
                    </Link>
                  </TableCell>
                  <TableCell>{product.gameId !== undefined && gamesById.get(product.gameId)?.displayName}</TableCell>
                  <TableCell>{product.productType && PRODUCT_TYPE_LABELS[product.productType]}</TableCell>
                  <TableCell>
                    {product.availability && (
                      <Badge variant={product.availability === "OUT_OF_STOCK" ? "outline" : "secondary"}>
                        {AVAILABILITY_LABELS[product.availability]}
                        {product.availability === "PREORDER" && ` · ${formatDate(product.releaseDate)}`}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{product.stockQuantity}</TableCell>
                  <TableCell className="pr-4 text-right tabular-nums">
                    {product.productType === "SINGLE" && <span className="text-xs text-muted-foreground">from </span>}
                    {formatPrice(product.basePrice)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Pagination page={page} totalPages={result.totalPages ?? 0} basePath="/admin/products" searchParams={query} />
    </div>
  );
}
