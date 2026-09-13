import { CatalogFilters, type CatalogFilterOptions } from "@/components/catalog/CatalogFilters";
import { Pagination } from "@/components/catalog/Pagination";
import { Notice } from "@/components/Notice";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ApiError, searchProducts } from "@/lib/api";
import { ProductRequestProductTypeValues, ProductResponseAvailabilityValues } from "@/lib/api-enums";
import {
  CATALOG_PAGE_SIZE,
  getNumberParam,
  getPage,
  getParam,
  pickEnum,
  SORT_OPTIONS,
  type SearchParams,
} from "@/lib/catalog";
import type { PageResponseProductResponse, SearchProductsParams } from "@/types/api";

/**
 * Filterable, paginated product listing driven by the URL. `fixed` filters (e.g. the game of a game page)
 * always apply and can't be changed from the filter form.
 */
export async function CatalogView({
  basePath,
  searchParams,
  fixed = {},
  filters,
  defaultSort = "createdAt,desc",
}: {
  basePath: string;
  searchParams: SearchParams;
  fixed?: SearchProductsParams;
  filters: CatalogFilterOptions;
  defaultSort?: string;
}) {
  const page = getPage(searchParams);
  const requestedSort = getParam(searchParams, "sort");
  const sort = SORT_OPTIONS.some((option) => option.value === requestedSort) ? requestedSort! : defaultSort;
  const categorySlug = getParam(searchParams, "category");

  const params: SearchProductsParams = {
    q: getParam(searchParams, "q"),
    game: getParam(searchParams, "game"),
    categoryId: filters.categories?.find((category) => category.slug === categorySlug)?.id,
    type: pickEnum(getParam(searchParams, "type"), ProductRequestProductTypeValues),
    availability: pickEnum(getParam(searchParams, "availability"), ProductResponseAvailabilityValues),
    setCode: getParam(searchParams, "set"),
    rarity: getParam(searchParams, "rarity"),
    minPrice: getNumberParam(searchParams, "minPrice"),
    maxPrice: getNumberParam(searchParams, "maxPrice"),
    ...fixed,
    page: page - 1,
    size: CATALOG_PAGE_SIZE,
    sort: [sort],
  };

  let result: PageResponseProductResponse | undefined;
  let error: string | undefined;
  try {
    result = await searchProducts(params);
  } catch (caught) {
    if (!(caught instanceof ApiError && caught.status === 400)) throw caught;
    error = caught.message;
  }
  const products = result?.content ?? [];
  const total = result?.totalElements ?? 0;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[15rem_1fr]">
      <aside aria-label="Filters">
        <CatalogFilters basePath={basePath} searchParams={searchParams} sort={sort} options={filters} />
      </aside>

      <div>
        <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
          {error ? "" : `${total} ${total === 1 ? "product" : "products"}`}
        </p>
        {error ? (
          <Notice>These filters couldn&apos;t be applied: {error}</Notice>
        ) : products.length === 0 ? (
          <Notice>No products match these filters.</Notice>
        ) : (
          <ProductGrid products={products} className="xl:grid-cols-4" />
        )}
        <Pagination page={page} totalPages={result?.totalPages ?? 0} basePath={basePath} searchParams={searchParams} />
      </div>
    </div>
  );
}
