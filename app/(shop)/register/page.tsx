import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { RegisterForm } from "@/components/auth/AuthForms";
import { getParam } from "@/lib/catalog";
import { safeRedirectPath } from "@/lib/form";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const next = safeRedirectPath(getParam(await searchParams, "next"));
  if (await getSession().catch(() => null)) redirect(next);

  return (
    <AuthCard
      title="Create account"
      description="Track orders and pre-orders, and save your shipping addresses."
      footer={
        <>
          Already have an account?{" "}
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm next={next} />
    </AuthCard>
  );
}
