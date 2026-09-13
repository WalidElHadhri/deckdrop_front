import type { ErrorResponse } from "@/types/api";

/** Base URL of the Spring Boot backend, without a trailing slash. */
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080").replace(/\/+$/, "");

/** Per-call options: any `fetch` init (`cache`, `next`, `signal`, ...) plus the JWT for authenticated endpoints. */
export interface RequestOptions extends Omit<RequestInit, "method" | "body"> {
  token?: string;
}

/** The parts of a request that come from the endpoint's parameters, as filled in by the generated client. */
export interface ApiRequest {
  query?: object;
  /** Serialized as JSON, except strings, which are sent as-is (e.g. raw webhook payloads). */
  body?: unknown;
  headers?: object;
}

/** Thrown for non-2xx responses. `body` is the backend's standard error payload, when it sent one. */
export class ApiError extends Error {
  readonly status: number;
  readonly body: ErrorResponse | undefined;

  constructor(status: number, body: ErrorResponse | undefined, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export async function apiRequest<T>(
  method: string,
  path: string,
  { query, body, headers }: ApiRequest = {},
  { token, headers: initHeaders, ...init }: RequestOptions = {},
): Promise<T> {
  const requestHeaders = new Headers(initHeaders);
  if (!requestHeaders.has("Accept")) requestHeaders.set("Accept", "application/json");
  for (const [name, value] of Object.entries(headers ?? {})) {
    if (value !== undefined && value !== null) requestHeaders.set(name, String(value));
  }
  if (token) requestHeaders.set("Authorization", `Bearer ${token}`);
  if (body !== undefined && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}${toQueryString(query)}`, {
    ...init,
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
  });

  const data = parseBody(await response.text());
  if (!response.ok) {
    const error = isErrorResponse(data) ? data : undefined;
    throw new ApiError(
      response.status,
      error,
      error?.message ?? `${method} ${path} failed with status ${response.status}`,
    );
  }
  return data as T;
}

function toQueryString(query: object | undefined): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null) continue;
    for (const item of Array.isArray(value) ? value : [value]) params.append(key, String(item));
  }
  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

function parseBody(text: string): unknown {
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function isErrorResponse(value: unknown): value is ErrorResponse {
  return typeof value === "object" && value !== null && "status" in value;
}
