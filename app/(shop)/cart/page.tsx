import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { CalendarClock, ShoppingCart } from "lucide-react";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { NativeSelect } from "@/components/forms/NativeSelect";
import { PageHeader } from "@/components/PageHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { listShippingRates } from "@/lib/api";
import { AddressRequestCountryValues } from "@/lib/api-enums";
import { getCartView } from "@/lib/cart";
import { getParam, pickEnum } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { getSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import type { CartResponse } from "@/types/api";

export const metadata: Metadata = { title: "Cart" };

export default async function CartPage({ searchParams }: PageProps<"/cart">) {
  const query = await searchParams;
  const country = pickEnum(getParam(query, "country"), AddressRequestCountryValues);
  const [session, rates] = await Promise.all([getSession(), listShippingRates().catch(() => [])]);

  let cart: CartResponse;
  let shippingError: string | undefined;
  try {
    cart = await getCartView(country);
  } catch (error) {
    if (!country) throw error;
    cart = await getCartView();
    shippingError = "We can't estimate shipping to that country.";
  }
  const items = cart.items ?? [];

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <ShoppingCart aria-hidden className="mx-auto size-10 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Find sealed product, singles and accessories for your game.</p>
        <Link href="/" className={cn(buttonVariants(), "mt-6 h-10 px-4")}>
          Continue shopping
        </Link>
      </div>
    );
  }

  const checkoutHref = session ? "/checkout" : "/login?next=/checkout";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
      <PageHeader title="Cart" description={`${cart.itemCount} ${cart.itemCount === 1 ? "item" : "items"}`} />

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
        <ul className="divide-y rounded-xl border bg-card">
          {items.map((line) => (
            <CartLineItem key={`${line.id}-${line.productId}-${line.variantId}`} line={line} />
          ))}
        </ul>

        <aside className="space-y-4 rounded-xl border bg-card p-5 lg:sticky lg:top-36">
          <h2 className="font-semibold">Order summary</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums">{formatPrice(cart.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="tabular-nums">
                {cart.shippingCost != null ? (cart.shippingCost === 0 ? "Free" : formatPrice(cart.shippingCost)) : "Calculated at checkout"}
              </dd>
            </div>
            <div className="flex justify-between border-t pt-2 text-base font-semibold">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatPrice(cart.total)}</dd>
            </div>
          </dl>
          <p className="text-xs text-muted-foreground">All prices include VAT.</p>

          {rates.length > 0 && (
            <Form action="/cart" className="flex items-end gap-2">
              <label className="grid flex-1 gap-1.5 text-sm font-medium">
                Estimate shipping to
                <NativeSelect name="country" defaultValue={country ?? ""}>
                  <option value="" disabled>
                    Choose a country
                  </option>
                  {rates.map((rate) => (
                    <option key={rate.country} value={rate.country}>
                      {rate.countryName ?? rate.country}
                    </option>
                  ))}
                </NativeSelect>
              </label>
              <Button type="submit" variant="outline" className="h-9">
                Estimate
              </Button>
            </Form>
          )}
          {shippingError && <p className="text-sm text-destructive">{shippingError}</p>}

          {cart.containsPreorders && (
            <Alert>
              <CalendarClock />
              <AlertTitle>Your cart contains pre-orders</AlertTitle>
              <AlertDescription>In-stock items ship right away; pre-order items ship when they are released.</AlertDescription>
            </Alert>
          )}

          {cart.checkoutReady ? (
            <Link href={checkoutHref} className={cn(buttonVariants(), "h-10 w-full")}>
              {session ? "Proceed to checkout" : "Sign in to check out"}
            </Link>
          ) : (
            <p className="text-sm font-medium text-destructive">
              Some items can&apos;t be ordered as they are. Update or remove them to continue.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
