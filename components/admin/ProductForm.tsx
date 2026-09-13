"use client";

import { useActionState, useState } from "react";
import { ActionForm } from "@/components/forms/ActionForm";
import { Field } from "@/components/forms/Field";
import { FormAlert } from "@/components/forms/FormAlert";
import { NativeSelect } from "@/components/forms/NativeSelect";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState } from "@/lib/action-state";
import { saveProductAction } from "@/lib/actions/admin";
import { PRODUCT_TYPE_LABELS, sortCategoryTree } from "@/lib/catalog";
import type { StorefrontGame } from "@/lib/games";
import type { CategoryResponse, ProductResponse } from "@/types/api";

export function ProductForm({
  product,
  games,
  categories,
}: {
  product?: ProductResponse;
  games: StorefrontGame[];
  categories: CategoryResponse[];
}) {
  const [state, formAction, pending] = useActionState(
    saveProductAction.bind(null, product?.id ?? null),
    {} as ActionState,
  );
  const [gameId, setGameId] = useState(String(product?.gameId ?? games[0]?.id ?? ""));
  const [productType, setProductType] = useState<string>(product?.productType ?? "SEALED");
  const [preorder, setPreorder] = useState(product?.preorder ?? false);
  // Defaults stay those of the first render: Base UI inputs warn when defaultValue changes after a save.
  const [initial] = useState(product);
  const errors = state.fieldErrors ?? {};
  const isSingle = productType === "SINGLE";
  const gameCategories = sortCategoryTree(categories.filter((category) => String(category.gameId) === gameId));

  return (
    <ActionForm action={formAction} className="grid gap-5">
      <FormAlert state={state} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Game" htmlFor="gameId" error={errors.gameId}>
          <NativeSelect id="gameId" name="gameId" value={gameId} onChange={(event) => setGameId(event.target.value)} required>
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.displayName}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Category" htmlFor="categoryId" error={errors.categoryId}>
          <NativeSelect
            key={gameId}
            id="categoryId"
            name="categoryId"
            defaultValue={String(initial?.gameId) === gameId ? String(initial?.categoryId ?? "") : ""}
            required
          >
            <option value="" disabled>
              {gameCategories.length ? "Choose a category" : "Create a category for this game first"}
            </option>
            {gameCategories.map(({ category, depth }) => (
              <option key={category.id} value={category.id}>
                {depth > 0 ? `— ${category.name}` : category.name}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Product type" htmlFor="productType" error={errors.productType}>
          <NativeSelect
            id="productType"
            name="productType"
            value={productType}
            onChange={(event) => setProductType(event.target.value)}
          >
            {Object.entries(PRODUCT_TYPE_LABELS).map(([type, label]) => (
              <option key={type} value={type}>
                {label}
              </option>
            ))}
          </NativeSelect>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Name" htmlFor="name" error={errors.name} className="sm:col-span-2">
          <Input id="name" name="name" defaultValue={initial?.name} required maxLength={200} className="h-9" />
        </Field>
        <Field label="Set code" htmlFor="setCode" error={errors.setCode} hint="e.g. SV08, OP09">
          <Input id="setCode" name="setCode" defaultValue={initial?.setCode} maxLength={20} className="h-9" />
        </Field>
        <Field
          label="URL slug"
          htmlFor="slug"
          error={errors.slug}
          hint={product ? "Changing it breaks existing links." : "Leave empty to derive it from the name."}
          className="sm:col-span-3"
        >
          <Input id="slug" name="slug" defaultValue={initial?.slug} maxLength={200} pattern="[a-z0-9]+(-[a-z0-9]+)*" className="h-9" />
        </Field>
      </div>

      {isSingle ? (
        <p className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
          Singles take their price and stock from their card versions, which you can manage after saving.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Price (EUR, incl. VAT)" htmlFor="basePrice" error={errors.basePrice}>
            <Input
              id="basePrice"
              name="basePrice"
              type="number"
              min={0}
              step="0.01"
              defaultValue={initial?.basePrice}
              required
              className="h-9"
            />
          </Field>
          <Field
            label={preorder ? "Pre-order allocation" : "Stock quantity"}
            htmlFor="stockQuantity"
            error={errors.stockQuantity}
            hint={preorder ? "Units that can still be pre-ordered." : undefined}
          >
            <Input
              id="stockQuantity"
              name="stockQuantity"
              type="number"
              min={0}
              step={1}
              defaultValue={initial?.stockQuantity}
              required
              className="h-9"
            />
          </Field>
        </div>
      )}

      <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-3">
        <label className="flex items-center gap-2 text-sm font-medium sm:col-span-3">
          <input
            type="checkbox"
            name="preorder"
            checked={preorder}
            onChange={(event) => setPreorder(event.target.checked)}
            className="size-4 accent-primary"
          />
          This is a pre-order
        </label>
        {preorder && (
          <Field label="Expected release date" htmlFor="releaseDate" error={errors.releaseDate}>
            <Input id="releaseDate" name="releaseDate" type="date" defaultValue={initial?.releaseDate} required className="h-9" />
          </Field>
        )}
      </div>

      <Field label="Image URLs" htmlFor="imageUrls" error={errors.imageUrls} hint="One URL per line; the first is the main image.">
        <Textarea id="imageUrls" name="imageUrls" rows={3} defaultValue={initial?.imageUrls?.join("\n")} />
      </Field>

      <Field label="Description" htmlFor="description" error={errors.description}>
        <Textarea id="description" name="description" rows={6} defaultValue={initial?.description} maxLength={10000} />
      </Field>

      <SubmitButton className="h-9 justify-self-start px-4" pending={pending} pendingLabel="Saving…">
        {product ? "Save changes" : "Create product"}
      </SubmitButton>
    </ActionForm>
  );
}
