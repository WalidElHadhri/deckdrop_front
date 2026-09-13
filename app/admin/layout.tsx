import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin | AR-DECKDROP" },
  robots: { index: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const { user } = await requireAdmin();

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <aside className="border-b bg-muted/40 md:sticky md:top-0 md:h-screen md:w-56 md:shrink-0 md:border-r md:border-b-0">
        <div className="flex items-center justify-between gap-2 p-4">
          <Link href="/admin" className="font-extrabold tracking-tight">
            AR-DECKDROP <span className="text-xs font-medium text-muted-foreground">Admin</span>
          </Link>
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground md:hidden">
            View store
          </Link>
        </div>
        <AdminNav />
        <div className="hidden space-y-1 p-4 text-xs text-muted-foreground md:block">
          <p className="truncate">Signed in as {user.email}</p>
          <Link href="/" className="hover:text-foreground">
            ← View store
          </Link>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 md:px-8">{children}</main>
    </div>
  );
}
