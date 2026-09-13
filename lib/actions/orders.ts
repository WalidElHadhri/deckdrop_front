"use server";

import { refresh, revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cancelMyOrder, checkout, startPayment } from "@/lib/api";
import { toActionError, type ActionState } from "@/lib/action-state";
import { formNumber } from "@/lib/form";
import { PAYPAL_ORDER_COOKIE } from "@/lib/paypal";
import { requireSession } from "@/lib/session";

const PAYMENT_ERRORS = {
  502: "The payment provider couldn't be reached. Please try again.",
  503: "This payment method is currently unavailable. Please choose another one.",
};

export async function placeOrderAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const { token } = await requireSession("/checkout");
  const addressId = formNumber(formData, "addressId");
  if (addressId === undefined) return { error: "Please choose a shipping address." };

  let orderId: number | undefined;
  try {
    orderId = (await checkout({ addressId }, { token })).id;
  } catch (error) {
    return toActionError(error);
  }
  // Checkout empties the cart: re-render the shared layout so the header's cart count updates too.
  revalidatePath("/", "layout");
  redirect(`/checkout/${orderId}/payment`);
}

export async function cancelOrderAction(orderId: number): Promise<ActionState> {
  const { token } = await requireSession(`/account/orders/${orderId}`);
  try {
    await cancelMyOrder(orderId, { token });
  } catch (error) {
    return toActionError(error);
  }
  refresh();
  return { message: "Order cancelled." };
}

export async function startStripePaymentAction(orderId: number): Promise<{ clientSecret?: string; error?: string }> {
  const { token } = await requireSession(`/checkout/${orderId}/payment`);
  try {
    const payment = await startPayment(orderId, { provider: "STRIPE" }, { token });
    return payment.stripeClientSecret
      ? { clientSecret: payment.stripeClientSecret }
      : { error: "Card payment couldn't be started." };
  } catch (error) {
    return { error: toActionError(error, PAYMENT_ERRORS).error };
  }
}

export async function startPayPalPaymentAction(orderId: number): Promise<ActionState> {
  const { token } = await requireSession(`/checkout/${orderId}/payment`);
  let approvalUrl: string | undefined;
  try {
    approvalUrl = (await startPayment(orderId, { provider: "PAYPAL" }, { token })).payPalApprovalUrl;
  } catch (error) {
    return toActionError(error, PAYMENT_ERRORS);
  }
  if (!approvalUrl) return { error: "PayPal payment couldn't be started." };

  (await cookies()).set(PAYPAL_ORDER_COOKIE, String(orderId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  });
  redirect(approvalUrl);
}
