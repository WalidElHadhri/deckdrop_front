import { ApiError } from "@/lib/api-client";

/** Result of a Server Action, shown by the form that submitted it. */
export interface ActionState {
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
}

/**
 * Turns a failed backend call into form feedback. `messages` overrides the backend's message per HTTP status.
 * Call it only from a catch block that doesn't wrap `redirect()`, which signals by throwing.
 */
export function toActionError(error: unknown, messages: Partial<Record<number, string>> = {}): ActionState {
  if (error instanceof ApiError) {
    const fieldErrors: Record<string, string> = {};
    for (const violation of error.body?.fieldErrors ?? []) {
      if (violation.field && !fieldErrors[violation.field]) {
        fieldErrors[violation.field] = violation.message ?? "Invalid value";
      }
    }
    const fallback =
      error.status >= 500 && !error.body?.message ? "Something went wrong. Please try again." : error.message;
    return {
      error:
        messages[error.status] ?? (Object.keys(fieldErrors).length ? "Please check the highlighted fields." : fallback),
      fieldErrors,
    };
  }
  console.error(error);
  return { error: "Something went wrong. Please try again." };
}
