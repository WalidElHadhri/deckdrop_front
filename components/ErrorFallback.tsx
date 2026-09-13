"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Shared body of the error.tsx boundaries. */
export function ErrorFallback({
  error,
  retry,
  homeHref = "/",
}: {
  error: Error & { digest?: string };
  retry: () => void;
  homeHref?: string;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">
        This page couldn&apos;t be loaded. The shop may be temporarily unavailable — please try again in a moment.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Button type="button" className="h-10 px-4" onClick={() => retry()}>
          Try again
        </Button>
        <Link href={homeHref} className={cn(buttonVariants({ variant: "outline" }), "h-10 px-4")}>
          Go back home
        </Link>
      </div>
    </div>
  );
}
