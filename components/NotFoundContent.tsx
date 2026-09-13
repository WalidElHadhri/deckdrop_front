import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NotFoundContent() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <p className="text-sm font-semibold text-primary">404</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-2 text-muted-foreground">The page you&apos;re looking for doesn&apos;t exist or is no longer available.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/" className={cn(buttonVariants(), "h-10 px-4")}>
          Go to homepage
        </Link>
        <Link href="/search" className={cn(buttonVariants({ variant: "outline" }), "h-10 px-4")}>
          Browse all products
        </Link>
      </div>
    </div>
  );
}
