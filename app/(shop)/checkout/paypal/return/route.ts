import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { capturePayPalPayment } from "@/lib/api";
import { PAYPAL_ORDER_COOKIE } from "@/lib/paypal";
import { getSession } from "@/lib/session";

// PayPal redirects the buyer here after approval (configured as app.paypal.return-url in the backend),
// appending its own order id as ?token=. The shop order id was stored in a cookie before the redirect.
export async function GET(request: NextRequest) {
  const store = await cookies();
  const orderId = Number(store.get(PAYPAL_ORDER_COOKIE)?.value);
  const payPalOrderId = request.nextUrl.searchParams.get("token");
  const to = (path: string) => NextResponse.redirect(new URL(path, request.url));

  const session = await getSession();
  if (!session) return to(`/login?next=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`);
  if (!Number.isInteger(orderId) || !payPalOrderId) return to("/account/orders");

  try {
    await capturePayPalPayment(orderId, { payPalOrderId }, { token: session.token });
  } catch (error) {
    console.error("PayPal capture failed", error);
    return to(`/checkout/${orderId}/payment?error=paypal`);
  }
  store.delete(PAYPAL_ORDER_COOKIE);
  return to(`/checkout/${orderId}/complete`);
}
