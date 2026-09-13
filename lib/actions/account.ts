"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import {
  changePassword,
  createAddress,
  deleteAddress,
  getAddress,
  updateAddress,
  updateProfile,
} from "@/lib/api";
import { toActionError, type ActionState } from "@/lib/action-state";
import type { Country } from "@/lib/cart";
import { formBoolean, formString, safeRedirectPath } from "@/lib/form";
import { requireSession, startSession } from "@/lib/session";
import type { AddressRequest } from "@/types/api";

export async function updateProfileAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const { token } = await requireSession("/account");
  try {
    await updateProfile({ name: formString(formData, "name") ?? "" }, { token });
  } catch (error) {
    return toActionError(error);
  }
  refresh();
  return { message: "Profile updated." };
}

export async function changePasswordAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const { token } = await requireSession("/account");
  const newPassword = String(formData.get("newPassword") ?? "");
  if (newPassword !== formData.get("confirmPassword")) {
    return { error: "Please check the highlighted fields.", fieldErrors: { confirmPassword: "Passwords don't match" } };
  }
  try {
    const auth = await changePassword(
      { currentPassword: String(formData.get("currentPassword") ?? ""), newPassword },
      { token },
    );
    // Tokens issued before the change are rejected from now on.
    await startSession(auth);
  } catch (error) {
    return toActionError(error, { 401: "Your current password is incorrect." });
  }
  return { message: "Password changed." };
}

/** Creates the address when `addressId` is null, then returns to the page the form came from. */
export async function saveAddressAction(
  addressId: number | null,
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { token } = await requireSession("/account/addresses");
  const returnTo = safeRedirectPath(formString(formData, "returnTo"), "/account/addresses");
  const body: AddressRequest = {
    fullName: formString(formData, "fullName") ?? "",
    line1: formString(formData, "line1") ?? "",
    line2: formString(formData, "line2"),
    city: formString(formData, "city") ?? "",
    postalCode: formString(formData, "postalCode") ?? "",
    country: formString(formData, "country") as Country,
    isDefault: formBoolean(formData, "isDefault"),
  };
  try {
    if (addressId === null) await createAddress(body, { token });
    else await updateAddress(addressId, body, { token });
  } catch (error) {
    return toActionError(error);
  }
  redirect(returnTo);
}

export async function deleteAddressAction(addressId: number): Promise<ActionState> {
  const { token } = await requireSession("/account/addresses");
  try {
    await deleteAddress(addressId, { token });
  } catch (error) {
    return toActionError(error);
  }
  refresh();
  return { message: "Address deleted." };
}

export async function makeDefaultAddressAction(addressId: number): Promise<ActionState> {
  const { token } = await requireSession("/account/addresses");
  try {
    const address = await getAddress(addressId, { token });
    await updateAddress(
      addressId,
      {
        fullName: address.fullName ?? "",
        line1: address.line1 ?? "",
        line2: address.line2,
        city: address.city ?? "",
        postalCode: address.postalCode ?? "",
        country: address.country!,
        isDefault: true,
      },
      { token },
    );
  } catch (error) {
    return toActionError(error);
  }
  refresh();
  return { message: "Default address updated." };
}
