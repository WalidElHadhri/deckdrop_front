import { AccountNav } from "@/components/account/AccountNav";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/actions/auth";
import { requireSession } from "@/lib/session";

export default async function AccountLayout({ children }: LayoutProps<"/account">) {
  const { user } = await requireSession("/account");

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
      <div className="grid items-start gap-6 md:grid-cols-[13rem_1fr] md:gap-10">
        <aside className="space-y-4">
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          </div>
          <AccountNav />
          <form action={logoutAction}>
            <Button type="submit" variant="outline" className="h-9 w-full">
              Sign out
            </Button>
          </form>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
