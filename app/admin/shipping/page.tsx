import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ShippingRateForm } from "@/components/admin/ShippingRateForm";
import { ActionButton } from "@/components/forms/ActionButton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listShippingRates } from "@/lib/api";
import { deleteShippingRateAction } from "@/lib/actions/admin";
import { AddressRequestCountryValues } from "@/lib/api-enums";
import { formatCountry } from "@/lib/format";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Shipping rates" };

export default async function AdminShippingPage() {
  await requireAdmin();
  const rates = await listShippingRates();
  const rows = AddressRequestCountryValues.map((country) => ({
    country,
    name: formatCountry(country),
    rate: rates.find((rate) => rate.country === country),
  })).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="max-w-4xl">
      <AdminPageHeader
        title="Shipping rates"
        description="Flat shipping price per EU country, charged once per order. Countries without a rate can't be shipped to. Prices in EUR incl. VAT."
      />
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Country</TableHead>
              <TableHead>Price · free shipping from</TableHead>
              <TableHead className="pr-4 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ country, name, rate }) => (
              <TableRow key={country}>
                <TableCell className="pl-4">
                  <span className="font-medium">{name}</span>{" "}
                  {!rate && (
                    <Badge variant="outline" className="ml-1">
                      Not shipped
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <ShippingRateForm
                    country={country}
                    countryName={name}
                    price={rate?.price}
                    freeShippingThreshold={rate?.freeShippingThreshold}
                  />
                </TableCell>
                <TableCell className="pr-4 text-right">
                  {rate && (
                    <ActionButton
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      action={deleteShippingRateAction.bind(null, country)}
                      confirmMessage={`Stop shipping to ${name}?`}
                    >
                      Disable
                    </ActionButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
