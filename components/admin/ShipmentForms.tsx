"use client";

import { useActionState, useState } from "react";
import { ActionForm } from "@/components/forms/ActionForm";
import { Field } from "@/components/forms/Field";
import { FormAlert } from "@/components/forms/FormAlert";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { Input } from "@/components/ui/input";
import type { ActionState } from "@/lib/action-state";
import { createShipmentAction, updateShipmentAction } from "@/lib/actions/admin";
import type { ShipmentResponse } from "@/types/api";

export function CreateShipmentForm({ orderId, items }: { orderId: number; items: { id: number; label: string }[] }) {
  const [state, formAction, pending] = useActionState(createShipmentAction.bind(null, orderId), {} as ActionState);
  const errors = state.fieldErrors ?? {};

  return (
    <ActionForm action={formAction} className="grid gap-4">
      <FormAlert state={state} />
      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm font-medium">Items in this parcel</legend>
        {items.map((item) => (
          <label key={item.id} className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="itemIds" value={item.id} defaultChecked className="size-4 accent-primary" />
            {item.label}
          </label>
        ))}
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Carrier" htmlFor="carrier" error={errors.carrier}>
          <Input id="carrier" name="carrier" placeholder="e.g. DHL" required maxLength={50} className="h-9" />
        </Field>
        <Field label="Tracking number" htmlFor="trackingNumber" error={errors.trackingNumber}>
          <Input id="trackingNumber" name="trackingNumber" required maxLength={100} className="h-9" />
        </Field>
      </div>
      <SubmitButton className="h-9 justify-self-start px-4" pending={pending} pendingLabel="Creating…">
        Mark as shipped
      </SubmitButton>
    </ActionForm>
  );
}

export function EditShipmentForm({ orderId, shipment }: { orderId: number; shipment: ShipmentResponse }) {
  const [state, formAction, pending] = useActionState(
    updateShipmentAction.bind(null, orderId, shipment.id!),
    {} as ActionState,
  );
  // Defaults stay those of the first render: Base UI inputs warn when defaultValue changes after a save.
  const [initial] = useState(shipment);

  return (
    <ActionForm action={formAction} className="grid gap-2">
      <div className="flex flex-wrap items-end gap-2">
        <label className="grid gap-1 text-xs font-medium">
          Carrier
          <Input name="carrier" defaultValue={initial.carrier} required maxLength={50} className="h-8 w-32" />
        </label>
        <label className="grid flex-1 gap-1 text-xs font-medium">
          Tracking number
          <Input name="trackingNumber" defaultValue={initial.trackingNumber} required maxLength={100} className="h-8 min-w-40" />
        </label>
        <SubmitButton variant="outline" size="sm" pending={pending}>
          Save
        </SubmitButton>
      </div>
      <FormAlert state={state} />
    </ActionForm>
  );
}
