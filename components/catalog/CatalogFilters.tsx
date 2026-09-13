import Form from "next/form";
import Link from "next/link";
import { Field } from "@/components/forms/Field";
import { NativeSelect } from "@/components/forms/NativeSelect";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AVAILABILITY_LABELS,
  getParam,
  PRODUCT_TYPE_LABELS,
  SORT_OPTIONS,
  sortCategoryTree,
  type SearchParams,
} from "@/lib/catalog";
import { formatEnum } from "@/lib/format";
import type { StorefrontGame } from "@/lib/games";
import { cn } from "@/lib/utils";
import type { CategoryResponse } from "@/types/api";

export interface CatalogFilterOptions {
  games?: StorefrontGame[];
  categories?: CategoryResponse[];
  productTypes?: boolean;
  availability?: boolean;
  rarities?: readonly string[];
}

export function CatalogFilters({
  basePath,
  searchParams,
  sort,
  options,
}: {
  basePath: string;
  searchParams: SearchParams;
  sort: string;
  options: CatalogFilterOptions;
}) {
  const value = (key: string) => getParam(searchParams, key) ?? "";
  const q = getParam(searchParams, "q");
  const resetHref = q ? `${basePath}?q=${encodeURIComponent(q)}` : basePath;

  return (
    <Form action={basePath} className="grid gap-4 rounded-xl border bg-card p-4">
      {q && <input type="hidden" name="q" value={q} />}

      {options.games && (
        <Field label="Game" htmlFor="filter-game">
          <NativeSelect id="filter-game" name="game" defaultValue={value("game")}>
            <option value="">All games</option>
            {options.games.map((game) => (
              <option key={game.id} value={game.slug}>
                {game.displayName}
              </option>
            ))}
          </NativeSelect>
        </Field>
      )}

      {options.categories && options.categories.length > 0 && (
        <Field label="Category" htmlFor="filter-category">
          <NativeSelect id="filter-category" name="category" defaultValue={value("category")}>
            <option value="">All categories</option>
            {sortCategoryTree(options.categories).map(({ category, depth }) => (
              <option key={category.id} value={category.slug}>
                {depth > 0 ? `— ${category.name}` : category.name}
              </option>
            ))}
          </NativeSelect>
        </Field>
      )}

      {options.productTypes && (
        <Field label="Product type" htmlFor="filter-type">
          <NativeSelect id="filter-type" name="type" defaultValue={value("type")}>
            <option value="">All types</option>
            {Object.entries(PRODUCT_TYPE_LABELS).map(([type, label]) => (
              <option key={type} value={type}>
                {label}
              </option>
            ))}
          </NativeSelect>
        </Field>
      )}

      {options.availability && (
        <Field label="Availability" htmlFor="filter-availability">
          <NativeSelect id="filter-availability" name="availability" defaultValue={value("availability")}>
            <option value="">Any</option>
            {Object.entries(AVAILABILITY_LABELS).map(([availability, label]) => (
              <option key={availability} value={availability}>
                {label}
              </option>
            ))}
          </NativeSelect>
        </Field>
      )}

      {options.rarities && (
        <Field label="Rarity (singles)" htmlFor="filter-rarity">
          <NativeSelect id="filter-rarity" name="rarity" defaultValue={value("rarity")}>
            <option value="">Any rarity</option>
            {options.rarities.map((rarity) => (
              <option key={rarity} value={rarity}>
                {formatEnum(rarity)}
              </option>
            ))}
          </NativeSelect>
        </Field>
      )}

      <Field label="Set code" htmlFor="filter-set">
        <Input id="filter-set" name="set" defaultValue={value("set")} placeholder="e.g. SV08" className="h-9" />
      </Field>

      <fieldset className="grid gap-1.5">
        <legend className="mb-1.5 text-sm font-medium">Price (EUR)</legend>
        <div className="grid grid-cols-2 gap-2">
          <Input
            name="minPrice"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            defaultValue={value("minPrice")}
            placeholder="Min"
            aria-label="Minimum price"
            className="h-9"
          />
          <Input
            name="maxPrice"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            defaultValue={value("maxPrice")}
            placeholder="Max"
            aria-label="Maximum price"
            className="h-9"
          />
        </div>
      </fieldset>

      <Field label="Sort by" htmlFor="filter-sort">
        <NativeSelect id="filter-sort" name="sort" defaultValue={sort}>
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </NativeSelect>
      </Field>

      <div className="flex gap-2">
        <Button type="submit" className="h-9 flex-1">
          Apply
        </Button>
        <Link href={resetHref} className={cn(buttonVariants({ variant: "outline" }), "h-9")}>
          Reset
        </Link>
      </div>
    </Form>
  );
}
