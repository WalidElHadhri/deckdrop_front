import { listShippingRates } from "@/lib/api";
import { formatCountry } from "@/lib/format";

/** Countries that can be chosen for a shipping address: those with a shipping rate, plus `include`. */
export async function getShippingCountries(include?: string): Promise<{ code: string; name: string }[]> {
  const rates = await listShippingRates().catch(() => []);
  const codes = new Set(rates.map((rate) => rate.country).filter((code): code is NonNullable<typeof code> => Boolean(code)));
  if (include) codes.add(include as (typeof rates)[number]["country"] & string);
  return [...codes]
    .map((code) => ({ code, name: formatCountry(code) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
