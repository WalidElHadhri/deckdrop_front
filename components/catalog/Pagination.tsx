import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { hrefWith, type SearchParams } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  basePath,
  searchParams,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams: SearchParams;
}) {
  if (totalPages <= 1) return null;
  const pageHref = (target: number) => hrefWith(basePath, searchParams, { page: target > 1 ? String(target) : undefined });
  const link = cn(buttonVariants({ variant: "outline" }), "h-9 px-3");

  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-3 text-sm">
      {page > 1 ? (
        <Link href={pageHref(page - 1)} className={link}>
          Previous
        </Link>
      ) : (
        <span className={cn(link, "pointer-events-none opacity-50")}>Previous</span>
      )}
      <span className="text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={pageHref(page + 1)} className={link}>
          Next
        </Link>
      ) : (
        <span className={cn(link, "pointer-events-none opacity-50")}>Next</span>
      )}
    </nav>
  );
}
