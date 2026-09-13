import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarClock, CircleAlert } from "lucide-react";
import { AddressForm } from "@/components/account/AccountForms";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { PlaceOrderForm } from "@/components/checkout/PlaceOrderForm";
import { AddressLines } from "@/components/orders/OrderDetails";
import { PageHeader } from "@/components/PageHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { getCart, listAddresses, listShippingRates } from "@/lib/api";
import { getParam } from "@/lib/catalog";
import { getShippingCountries } from "@/lib/countries";
import { formatCountry, formatPrice } from "@/lib/format";
import { requireSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import type { CartResponse } from "@/types/api";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage({ searchParams }: PageProps<"/checkout">) {
  const { token } = await requireSession("/checkout");
  const query = await searchParams;
  const [addresses, rates, countries] = await Promise.all([
    listAddresses({ token }),
    listShippingRates().catch(() => []),
    getShippingCountries(),
  ]);

  const selected =
    addresses.find((address) => String(address.id) === getParam(query, "address")) ??
    addresses.find((address) => address.isDefault) ??
    addresses[0];
  const shippable = Boolean(selected && rates.some((rate) => rate.country === selected.country));

  let cart: CartResponse;
  try {
    cart = await getCart(selected && shippable ? { country: selected.country } : undefined, { token });
  } catch {
    cart = await getCart(undefined, { token });
  }
  const items = cart.items ?? [];
  if (items.length === 0) redirect("/cart");

  const canPlaceOrder = Boolean(selected && shippable && cart.checkoutReady && cart.shippingCost != null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
      <PageHeader title="Checkout" />

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <section aria-labelledby="address-heading" className="space-y-4 rounded-xl border bg-card p-5">
            <h2 id="address-heading" className="text-lg font-semibold">
              1. Shipping address
            </h2>

            {addresses.length > 0 && (
              <ul className="grid gap-3 sm:grid-cols-2">
                {addresses.map((address) => {
                  const isSelected = address.id === selected?.id;
                  return (
                    <li key={address.id}>
                      <Link
                        href={`/checkout?address=${address.id}`}
                        scroll={false}
                        aria-current={isSelected ? "true" : undefined}
                        className={cn(
                          "flex h-full flex-col gap-2 rounded-lg border p-4 transition-colors",
                          isSelected ? "border-primary ring-2 ring-primary" : "hover:border-foreground/30",
                        )}
                      >
                        <AddressLines address={address} />
                        <span className="mt-auto flex gap-2">
                          {isSelected && <Badge>Selected</Badge>}
                          {address.isDefault && <Badge variant="secondary">Default</Badge>}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}

            {selected && !shippable && (
              <Alert variant="destructive">
                <CircleAlert />
                <AlertTitle>We don&apos;t ship to {formatCountry(selected.country)} yet.</AlertTitle>
                <AlertDescription>Please choose or add an address in another EU country.</AlertDescription>
              </Alert>
            )}

            <details open={addresses.length === 0} className="rounded-lg border p-4">
              <summary className="cursor-pointer text-sm font-medium">Add a new address</summary>
              <div className="pt-4">
                <AddressForm countries={countries} returnTo="/checkout" submitLabel="Save and use this address" />
              </div>
            </details>
          </section>

          <section aria-labelledby="items-heading" className="space-y-4 rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 id="items-heading" className="text-lg font-semibold">
                2. Review items
              </h2>
              <Link href="/cart" className="text-sm text-primary hover:underline">
                Edit cart
              </Link>
            </div>
            <ul className="-mx-4 divide-y">
              {items.map((line) => (
                <CartLineItem key={line.id} line={line} editable={false} />
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-4 rounded-xl border bg-card p-5 lg:sticky lg:top-36">
          <h2 className="font-semibold">Order summary</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums">{formatPrice(cart.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                Shipping{cart.shippingCountry ? ` to ${formatCountry(cart.shippingCountry)}` : ""}
              </dt>
              <dd className="tabular-nums">
                {cart.shippingCost == null ? "—" : cart.shippingCost === 0 ? "Free" : formatPrice(cart.shippingCost)}
              </dd>
            </div>
            <div className="flex justify-between border-t pt-2 text-base font-semibold">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatPrice(cart.total)}</dd>
            </div>
          </dl>
          <p className="text-xs text-muted-foreground">All prices include VAT.</p>

          {cart.containsPreorders && (
            <Alert>
              <CalendarClock />
              <AlertTitle>Split shipment</AlertTitle>
              <AlertDescription>In-stock items ship right away; pre-order items ship when they are released.</AlertDescription>
            </Alert>
          )}
          {!cart.checkoutReady && (
            <p className="text-sm font-medium text-destructive">
              Some items can&apos;t be ordered as they are.{" "}
              <Link href="/cart" className="underline">
                Update your cart
              </Link>
              .
            </p>
          )}

          <PlaceOrderForm addressId={selected?.id} disabled={!canPlaceOrder} />
          <p className="text-xs text-muted-foreground">
            Items are reserved when you place the order. You&apos;ll pay by card or PayPal on the next step; unpaid orders
            are cancelled automatically after 30 minutes.
          </p>
        </aside>
      </div>
    </div>
  );
}
