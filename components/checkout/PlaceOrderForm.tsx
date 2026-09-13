"use client";

import { useActionState } from "react";
import { ActionForm } from "@/components/forms/ActionForm";
import { FormAlert } from "@/components/forms/FormAlert";
import { SubmitButton } from "@/components/forms/SubmitButton";
import type { ActionState } from "@/lib/action-state";
import { placeOrderAction } from "@/lib/actions/orders";

export function PlaceOrderForm({ addressId, disabled }: { addressId?: number; disabled: boolean }) {
  const [state, formAction, pending] = useActionState(placeOrderAction, {} as ActionState);
  return (
    <ActionForm action={formAction} className="grid gap-3">
      <FormAlert state={state} />
      {addressId !== undefined && <input type="hidden" name="addressId" value={addressId} />}
      <SubmitButton className="h-10" disabled={disabled} pending={pending} pendingLabel="Placing order…">
        Place order and pay
      </SubmitButton>
    </ActionForm>
  );
}
