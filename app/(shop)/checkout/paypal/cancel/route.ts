import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { PAYPAL_ORDER_COOKIE } from "@/lib/paypal";

// PayPal sends buyers here when they cancel (app.paypal.cancel-url in the backend). The order stays reserved.
export async function GET(request: NextRequest) {
  const store = await cookies();
  const orderId = Number(store.get(PAYPAL_ORDER_COOKIE)?.value);
  store.delete(PAYPAL_ORDER_COOKIE);
  const path = Number.isInteger(orderId) && orderId > 0 ? `/checkout/${orderId}/payment?cancelled=1` : "/account/orders";
  return NextResponse.redirect(new URL(path, request.url));
}
