"use client";

import { useActionState, useState } from "react";
import { toast } from "sonner";
import { ActionForm } from "@/components/forms/ActionForm";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { Input } from "@/components/ui/input";
import type { ActionState } from "@/lib/action-state";
import { saveShippingRateAction } from "@/lib/actions/admin";
import type { Country } from "@/lib/cart";

export function ShippingRateForm({
  country,
  countryName,
  price,
  freeShippingThreshold,
}: {
  country: Country;
  countryName: string;
  price?: number;
  freeShippingThreshold?: number;
}) {
  const [, formAction, pending] = useActionState(async (previous: ActionState, formData: FormData) => {
    const result = await saveShippingRateAction(country, previous, formData);
    if (result.error) toast.error(`${countryName}: ${[result.error, ...Object.values(result.fieldErrors ?? {})].join(" ")}`);
    else if (result.message) toast.success(`${countryName}: ${result.message}`);
    return result;
  }, {});
  // Defaults stay those of the first render: Base UI inputs warn when defaultValue changes after a save.
  const [initial] = useState({ price, freeShippingThreshold });

  return (
    <ActionForm action={formAction} className="flex flex-wrap items-center gap-2">
      <Input
        name="price"
        type="number"
        min={0}
        step="0.01"
        defaultValue={initial.price}
        placeholder="Price"
        required
        aria-label={`Shipping price to ${countryName}`}
        className="h-8 w-24"
      />
      <Input
        name="freeShippingThreshold"
        type="number"
        min={0}
        step="0.01"
        defaultValue={initial.freeShippingThreshold}
        placeholder="Free from"
        aria-label={`Free shipping threshold for ${countryName}`}
        className="h-8 w-28"
      />
      <SubmitButton variant="outline" size="sm" pending={pending}>
        {price === undefined ? "Enable" : "Save"}
      </SubmitButton>
    </ActionForm>
  );
}
