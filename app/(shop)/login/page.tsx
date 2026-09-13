import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/AuthForms";
import { getParam } from "@/lib/catalog";
import { safeRedirectPath } from "@/lib/form";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const query = await searchParams;
  const next = safeRedirectPath(getParam(query, "next"));
  if (await getSession().catch(() => null)) redirect(next);

  return (
    <AuthCard
      title="Sign in"
      description={next === "/checkout" ? "Sign in to complete your order. Your cart is kept." : undefined}
      footer={
        <>
          New to AR-DECKDROP?{" "}
          <Link href={`/register?next=${encodeURIComponent(next)}`} className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm
        next={next}
        notice={getParam(query, "reset") === "1" ? "Your password was changed. Sign in with your new password." : undefined}
      />
    </AuthCard>
  );
}
