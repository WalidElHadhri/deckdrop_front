import Link from "next/link";
import { ShoppingCart, User } from "lucide-react";
import { AccountMenu } from "@/components/AccountMenu";
import { buttonVariants } from "@/components/ui/button";
import { getCartItemCount } from "@/lib/cart";
import { getSession } from "@/lib/session";
import { cn } from "@/lib/utils";

const ICON_BUTTON = buttonVariants({ variant: "ghost", size: "icon-lg" });

export async function HeaderActions() {
  // The header must render even when the backend is unreachable.
  const [session, cartCount] = await Promise.all([
    getSession().catch(() => null),
    getCartItemCount().catch(() => 0),
  ]);

  return (
    <>
      {session ? (
        <AccountMenu name={session.user.name ?? session.user.email ?? "Account"} isAdmin={session.user.role === "ADMIN"} />
      ) : (
        <Link href="/login" aria-label="Sign in" className={ICON_BUTTON}>
          <User className="size-5" />
        </Link>
      )}
      <CartLink count={cartCount} />
    </>
  );
}

export function HeaderActionsFallback() {
  return (
    <>
      <Link href="/account" aria-label="Account" className={ICON_BUTTON}>
        <User className="size-5" />
      </Link>
      <CartLink count={0} />
    </>
  );
}

function CartLink({ count }: { count: number }) {
  return (
    <Link href="/cart" aria-label={count ? `Cart, ${count} items` : "Cart"} className={cn(ICON_BUTTON, "relative")}>
      <ShoppingCart className="size-5" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
