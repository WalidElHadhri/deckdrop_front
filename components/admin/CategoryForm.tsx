"use client";

import { useActionState, useState } from "react";
import { ActionForm } from "@/components/forms/ActionForm";
import { Field } from "@/components/forms/Field";
import { FormAlert } from "@/components/forms/FormAlert";
import { NativeSelect } from "@/components/forms/NativeSelect";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { Input } from "@/components/ui/input";
import type { ActionState } from "@/lib/action-state";
import { saveCategoryAction } from "@/lib/actions/admin";
import type { StorefrontGame } from "@/lib/games";
import type { CategoryResponse } from "@/types/api";

export function CategoryForm({
  category,
  games,
  categories,
}: {
  category?: CategoryResponse;
  games: StorefrontGame[];
  categories: CategoryResponse[];
}) {
  const [state, formAction, pending] = useActionState(
    saveCategoryAction.bind(null, category?.id ?? null),
    {} as ActionState,
  );
  const [gameId, setGameId] = useState(String(category?.gameId ?? games[0]?.id ?? ""));
  const errors = state.fieldErrors ?? {};
  // Only top-level categories of the same game can be parents (and not the category itself).
  const parents = categories.filter(
    (candidate) => String(candidate.gameId) === gameId && candidate.parentCategoryId == null && candidate.id !== category?.id,
  );

  return (
    <ActionForm action={formAction} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <FormAlert state={state} />
      </div>
      <Field label="Game" htmlFor="category-game" error={errors.gameId}>
        <NativeSelect id="category-game" name="gameId" value={gameId} onChange={(event) => setGameId(event.target.value)}>
          {games.map((game) => (
            <option key={game.id} value={game.id}>
              {game.displayName}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="Parent category" htmlFor="category-parent" error={errors.parentCategoryId}>
        <NativeSelect
          key={gameId}
          id="category-parent"
          name="parentCategoryId"
          defaultValue={String(category?.gameId) === gameId ? String(category?.parentCategoryId ?? "") : ""}
        >
          <option value="">None (top level)</option>
          {parents.map((parent) => (
            <option key={parent.id} value={parent.id}>
              {parent.name}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="Name" htmlFor="category-name" error={errors.name}>
        <Input id="category-name" name="name" defaultValue={category?.name} required maxLength={100} className="h-9" />
      </Field>
      <Field label="URL slug" htmlFor="category-slug" error={errors.slug} hint="Leave empty to derive it from the name.">
        <Input
          id="category-slug"
          name="slug"
          defaultValue={category?.slug}
          maxLength={100}
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          className="h-9"
        />
      </Field>
      <SubmitButton className="h-9 justify-self-start px-4" pending={pending} pendingLabel="Saving…">
        {category ? "Save category" : "Create category"}
      </SubmitButton>
    </ActionForm>
  );
}
