"use client";

import { useActionState, useState } from "react";
import { ActionForm } from "@/components/forms/ActionForm";
import { Field } from "@/components/forms/Field";
import { FormAlert } from "@/components/forms/FormAlert";
import { NativeSelect } from "@/components/forms/NativeSelect";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { Input } from "@/components/ui/input";
import type { ActionState } from "@/lib/action-state";
import { changePasswordAction, saveAddressAction, updateProfileAction } from "@/lib/actions/account";
import type { AddressResponse } from "@/types/api";

const initialState: ActionState = {};

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);
  // Base UI inputs warn when defaultValue changes, which it would after the page refreshes with the saved name.
  const [initialName] = useState(name);
  return (
    <ActionForm action={formAction} className="grid max-w-md gap-4">
      <FormAlert state={state} />
      <Field label="Name" htmlFor="name" error={state.fieldErrors?.name}>
        <Input id="name" name="name" defaultValue={initialName} autoComplete="name" required maxLength={100} className="h-9" />
      </Field>
      <Field label="Email" htmlFor="email" hint="Your email address can't be changed.">
        <Input id="email" value={email} disabled className="h-9" />
      </Field>
      <SubmitButton className="h-9 justify-self-start" pending={pending} pendingLabel="Saving…">
        Save profile
      </SubmitButton>
    </ActionForm>
  );
}

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, initialState);
  return (
    <ActionForm action={formAction} className="grid max-w-md gap-4">
      <FormAlert state={state} />
      <Field label="Current password" htmlFor="currentPassword" error={state.fieldErrors?.currentPassword}>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          className="h-9"
        />
      </Field>
      <Field label="New password" htmlFor="newPassword" error={state.fieldErrors?.newPassword} hint="At least 8 characters">
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={72}
          className="h-9"
        />
      </Field>
      <Field label="Confirm new password" htmlFor="confirmPassword" error={state.fieldErrors?.confirmPassword}>
        <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required className="h-9" />
      </Field>
      <SubmitButton className="h-9 justify-self-start" pending={pending} pendingLabel="Changing…">
        Change password
      </SubmitButton>
    </ActionForm>
  );
}

export function AddressForm({
  address,
  countries,
  returnTo,
  submitLabel = "Save address",
}: {
  address?: AddressResponse;
  countries: { code: string; name: string }[];
  returnTo: string;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(saveAddressAction.bind(null, address?.id ?? null), initialState);
  const errors = state.fieldErrors ?? {};

  return (
    <ActionForm action={formAction} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <FormAlert state={state} />
      </div>
      <input type="hidden" name="returnTo" value={returnTo} />
      <Field label="Full name" htmlFor="fullName" error={errors.fullName} className="sm:col-span-2">
        <Input id="fullName" name="fullName" defaultValue={address?.fullName} autoComplete="name" required className="h-9" />
      </Field>
      <Field label="Address line 1" htmlFor="line1" error={errors.line1} className="sm:col-span-2">
        <Input id="line1" name="line1" defaultValue={address?.line1} autoComplete="address-line1" required className="h-9" />
      </Field>
      <Field label="Address line 2 (optional)" htmlFor="line2" error={errors.line2} className="sm:col-span-2">
        <Input id="line2" name="line2" defaultValue={address?.line2} autoComplete="address-line2" className="h-9" />
      </Field>
      <Field label="Postal code" htmlFor="postalCode" error={errors.postalCode}>
        <Input id="postalCode" name="postalCode" defaultValue={address?.postalCode} autoComplete="postal-code" required className="h-9" />
      </Field>
      <Field label="City" htmlFor="city" error={errors.city}>
        <Input id="city" name="city" defaultValue={address?.city} autoComplete="address-level2" required className="h-9" />
      </Field>
      <Field
        label="Country"
        htmlFor="country"
        error={errors.country}
        hint="We currently ship to the countries listed."
        className="sm:col-span-2"
      >
        <NativeSelect id="country" name="country" defaultValue={address?.country ?? ""} required>
          <option value="" disabled>
            Choose a country
          </option>
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input type="checkbox" name="isDefault" defaultChecked={address?.isDefault} className="size-4 accent-primary" />
        Use as my default shipping address
      </label>
      <SubmitButton className="h-9 justify-self-start" pending={pending} pendingLabel="Saving…">
        {submitLabel}
      </SubmitButton>
    </ActionForm>
  );
}
