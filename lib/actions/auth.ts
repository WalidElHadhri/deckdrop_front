"use server";

import { redirect } from "next/navigation";
import { confirmPasswordReset, login, register, requestPasswordReset } from "@/lib/api";
import { toActionError, type ActionState } from "@/lib/action-state";
import { mergeGuestCart } from "@/lib/cart";
import { formString, safeRedirectPath } from "@/lib/form";
import { endSession, startSession } from "@/lib/session";

export async function loginAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const next = safeRedirectPath(formString(formData, "next"));
  try {
    const auth = await login({
      email: formString(formData, "email") ?? "",
      password: String(formData.get("password") ?? ""),
    });
    await startSession(auth);
    await mergeGuestCart(auth.token!);
  } catch (error) {
    return toActionError(error, { 401: "Invalid email or password." });
  }
  redirect(next);
}

export async function registerAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const next = safeRedirectPath(formString(formData, "next"));
  const password = String(formData.get("password") ?? "");
  if (password !== formData.get("confirmPassword")) {
    return { error: "Please check the highlighted fields.", fieldErrors: { confirmPassword: "Passwords don't match" } };
  }
  try {
    const auth = await register({
      name: formString(formData, "name") ?? "",
      email: formString(formData, "email") ?? "",
      password,
    });
    await startSession(auth);
    await mergeGuestCart(auth.token!);
  } catch (error) {
    return toActionError(error);
  }
  redirect(next);
}

export async function logoutAction(): Promise<void> {
  await endSession();
  redirect("/");
}

export async function requestPasswordResetAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requestPasswordReset({ email: formString(formData, "email") ?? "" });
  } catch (error) {
    return toActionError(error);
  }
  return { message: "If an account exists for that email, we've sent a link to reset your password." };
}

export async function confirmPasswordResetAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const newPassword = String(formData.get("newPassword") ?? "");
  if (newPassword !== formData.get("confirmPassword")) {
    return { error: "Please check the highlighted fields.", fieldErrors: { confirmPassword: "Passwords don't match" } };
  }
  try {
    await confirmPasswordReset({ token: formString(formData, "token") ?? "", newPassword });
  } catch (error) {
    return toActionError(error, { 400: "This reset link is invalid or has expired. Please request a new one." });
  }
  redirect("/login?reset=1");
}
