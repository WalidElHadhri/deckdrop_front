"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ActionForm } from "@/components/forms/ActionForm";
import { FormAlert } from "@/components/forms/FormAlert";
import { NativeSelect } from "@/components/forms/NativeSelect";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { Input } from "@/components/ui/input";
import type { ActionState } from "@/lib/action-state";
import { saveVariantAction } from "@/lib/actions/admin";
import {
  OnePieceCardVariantRequestCardTypeValues,
  PokemonCardVariantRequestHoloTypeValues,
  YuGiOhCardVariantRequestConditionValues,
} from "@/lib/api-enums";
import { formatEnum } from "@/lib/format";
import { RARITIES } from "@/lib/rarities";
import type { CardVariant, VariantType } from "@/lib/variants";

/** Inline form for one card version; without `variant` it adds a new one and clears itself afterwards. */
export function VariantForm({
  variantType,
  productId,
  variant,
}: {
  variantType: VariantType;
  productId: number;
  variant?: CardVariant;
}) {
  const [state, formAction, pending] = useActionState(
    saveVariantAction.bind(null, variantType, productId, variant?.id ?? null),
    {} as ActionState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  // Defaults stay those of the first render: Base UI inputs warn when defaultValue changes after a save.
  const [initial] = useState(variant);
  const errors = state.fieldErrors ?? {};
  const label = variant ? `version ${variant.setCode}-${variant.cardNumber}` : "new version";

  useEffect(() => {
    if (!variant && state.message) formRef.current?.reset();
  }, [state, variant]);

  const select = (name: string, values: readonly string[], value: string | undefined, text: string) => (
    <label className="grid gap-1 text-xs font-medium">
      {text}
      <NativeSelect name={name} defaultValue={value ?? ""} required aria-invalid={Boolean(errors[name])} aria-label={`${text}, ${label}`}>
        <option value="" disabled>
          —
        </option>
        {values.map((option) => (
          <option key={option} value={option}>
            {formatEnum(option)}
          </option>
        ))}
      </NativeSelect>
    </label>
  );

  const input = (name: string, text: string, props: React.ComponentProps<typeof Input>) => (
    <label className="grid gap-1 text-xs font-medium">
      {text}
      <Input name={name} required aria-invalid={Boolean(errors[name])} aria-label={`${text}, ${label}`} className="h-9" {...props} />
    </label>
  );

  return (
    <ActionForm ref={formRef} action={formAction} className="grid gap-2">
      <div className="grid grid-cols-2 items-end gap-2 md:grid-cols-4 xl:grid-cols-[6rem_5rem_1fr_1fr_6rem_6rem_5rem_auto]">
        {input("setCode", "Set", { defaultValue: initial?.setCode, maxLength: 20 })}
        {input("cardNumber", "No.", { defaultValue: initial?.cardNumber, maxLength: 20 })}
        {select("rarity", RARITIES[variantType], variant?.rarity, "Rarity")}
        {variantType === "POKEMON" &&
          select("holoType", PokemonCardVariantRequestHoloTypeValues, "holoType" in (variant ?? {}) ? (variant as { holoType?: string }).holoType : undefined, "Finish")}
        {variantType === "ONE_PIECE" &&
          select("cardType", OnePieceCardVariantRequestCardTypeValues, "cardType" in (variant ?? {}) ? (variant as { cardType?: string }).cardType : undefined, "Card type")}
        {variantType === "YU_GI_OH" && <span className="hidden xl:block" />}
        {select("condition", YuGiOhCardVariantRequestConditionValues, variant?.condition, "Condition")}
        {input("price", "Price €", { type: "number", min: 0, step: "0.01", defaultValue: initial?.price })}
        {input("stockQuantity", "Stock", { type: "number", min: 0, step: 1, defaultValue: initial?.stockQuantity })}
        <SubmitButton variant={variant ? "outline" : "default"} className="h-9" pending={pending} pendingLabel="Saving…">
          {variant ? "Save" : "Add"}
        </SubmitButton>
      </div>
      {state.error && <FormAlert state={{ error: [state.error, ...Object.values(errors)].join(" ") }} />}
    </ActionForm>
  );
}
