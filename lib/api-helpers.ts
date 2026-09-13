import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api";

/** Shows the not-found page when the backend answers 404 (or 400 for a malformed id). */
export async function orNotFound<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) notFound();
    throw error;
  }
}

/** Parses a numeric route segment, showing the not-found page for anything else. */
export function parseId(value: string): number {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) notFound();
  return id;
}
