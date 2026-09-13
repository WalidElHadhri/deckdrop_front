const priceFormatter = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Europe/Berlin",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Berlin",
});

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

export const CONDITION_LABELS: Record<string, string> = {
  NM: "Near Mint",
  LP: "Lightly Played",
  MP: "Moderately Played",
  HP: "Heavily Played",
  DMG: "Damaged",
};

export function formatPrice(amount: number | null | undefined): string {
  return amount == null ? "—" : priceFormatter.format(amount);
}

export function formatDate(value: string | null | undefined): string {
  return value ? dateFormatter.format(new Date(value)) : "—";
}

export function formatDateTime(value: string | null | undefined): string {
  return value ? dateTimeFormatter.format(new Date(value)) : "—";
}

export function formatCountry(code: string | null | undefined): string {
  return code ? (regionNames.of(code) ?? code) : "—";
}

/** "SECRET_RARE" → "Secret rare". Short codes such as NM, SEC or UC are kept as-is. */
export function formatEnum(value: string | null | undefined): string {
  if (!value) return "";
  if (value.length <= 3) return value;
  const text = value.toLowerCase().replaceAll("_", " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}
