import type { Metadata } from "next";
import { ChangePasswordForm, ProfileForm } from "@/components/account/AccountForms";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const { user } = await requireSession("/account");

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <ProfileForm name={user.name ?? ""} email={user.email ?? ""} />
      </section>
      <section className="space-y-4 border-t pt-8">
        <h2 className="text-lg font-semibold">Change password</h2>
        <ChangePasswordForm />
      </section>
    </div>
  );
}
