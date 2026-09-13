import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { ApiError, getProfile } from "@/lib/api";
import type { AuthResponse, UserResponse } from "@/types/api";

const SESSION_COOKIE = "dd_session";

export interface Session {
  token: string;
  user: UserResponse;
}

/** The signed-in user, or null when there is no valid session. Memoized per request. */
export const getSession = cache(async (): Promise<Session | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    return { token, user: await getProfile({ token }) };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
});

/** Redirects to the login page (and back to `returnTo` afterwards) when nobody is signed in. */
export async function requireSession(returnTo: string): Promise<Session> {
  const session = await getSession();
  if (!session) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  return session;
}

/** Like requireSession, but pretends admin pages don't exist for non-admins. */
export async function requireAdmin(returnTo = "/admin"): Promise<Session> {
  const session = await requireSession(returnTo);
  if (session.user.role !== "ADMIN") notFound();
  return session;
}

/** Stores the JWT in an httpOnly cookie. Only callable from Server Actions and Route Handlers. */
export async function startSession(auth: AuthResponse): Promise<void> {
  if (!auth.token) throw new Error("The backend did not return a token");
  (await cookies()).set(SESSION_COOKIE, auth.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: auth.expiresAt ? new Date(auth.expiresAt) : undefined,
  });
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
