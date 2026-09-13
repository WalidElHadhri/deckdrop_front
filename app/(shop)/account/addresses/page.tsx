import type { Metadata } from "next";
import Link from "next/link";
import { AddressForm } from "@/components/account/AccountForms";
import { ActionButton } from "@/components/forms/ActionButton";
import { Notice } from "@/components/Notice";
import { AddressLines } from "@/components/orders/OrderDetails";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { listAddresses } from "@/lib/api";
import { deleteAddressAction, makeDefaultAddressAction } from "@/lib/actions/account";
import { getParam } from "@/lib/catalog";
import { getShippingCountries } from "@/lib/countries";
import { requireSession } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Addresses" };

export default async function AddressesPage({ searchParams }: PageProps<"/account/addresses">) {
  const { token } = await requireSession("/account/addresses");
  const query = await searchParams;
  const addresses = await listAddresses({ token });
  const editing = addresses.find((address) => String(address.id) === getParam(query, "edit"));
  const countries = await getShippingCountries(editing?.country);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Addresses</h1>

      {addresses.length === 0 ? (
        <Notice>You haven&apos;t saved any addresses yet.</Notice>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <li
              key={address.id}
              className={cn("flex flex-col gap-3 rounded-xl border p-4", address.id === editing?.id && "ring-2 ring-primary")}
            >
              <div className="flex items-start justify-between gap-2">
                <AddressLines address={address} />
                {address.isDefault && <Badge variant="secondary">Default</Badge>}
              </div>
              <div className="mt-auto flex flex-wrap gap-2">
                <Link href={`/account/addresses?edit=${address.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                  Edit
                </Link>
                {!address.isDefault && (
                  <ActionButton variant="outline" size="sm" action={makeDefaultAddressAction.bind(null, address.id!)}>
                    Make default
                  </ActionButton>
                )}
                <ActionButton
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  action={deleteAddressAction.bind(null, address.id!)}
                  confirmMessage="Delete this address?"
                >
                  Delete
                </ActionButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      <section className="space-y-4 rounded-xl border p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">{editing ? "Edit address" : "Add a new address"}</h2>
          {editing && (
            <Link href="/account/addresses" className="text-sm text-muted-foreground hover:text-foreground">
              Cancel
            </Link>
          )}
        </div>
        <AddressForm key={editing?.id ?? "new"} address={editing} countries={countries} returnTo="/account/addresses" />
      </section>
    </div>
  );
}
