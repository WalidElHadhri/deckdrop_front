// Helpers for reading typed values out of submitted forms.

export function formString(formData: FormData, name: string): string | undefined {
  const value = formData.get(name);
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

/** Accepts both "12.5" and "12,5". Unparseable input is returned as undefined so the backend reports it. */
export function formNumber(formData: FormData, name: string): number | undefined {
  const value = formString(formData, name);
  if (value === undefined) return undefined;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function formBoolean(formData: FormData, name: string): boolean {
  return formData.get(name) === "on";
}

export function formIds(formData: FormData, name: string): number[] {
  return formData
    .getAll(name)
    .map(Number)
    .filter((id) => Number.isInteger(id));
}

/** Only allows same-site paths as post-login destinations. */
export function safeRedirectPath(value: string | undefined, fallback = "/account"): string {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}
