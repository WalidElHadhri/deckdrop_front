import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/AuthForms";
import { getParam } from "@/lib/catalog";

export const metadata: Metadata = { title: "Reset password" };

// The backend emails links to this page as /reset-password?token=...
export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const token = getParam(await searchParams, "token");

  if (!token) {
    return (
      <AuthCard title="Reset link missing" description="Open the link from your email again, or request a new one.">
        <Link href="/forgot-password" className="font-medium text-primary hover:underline">
          Request a new reset link
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Choose a new password" description="After saving, you'll be signed out everywhere else.">
      <ResetPasswordForm token={token} />
    </AuthCard>
  );
}
