"use client";

import { ErrorFallback } from "@/components/ErrorFallback";

export default function AdminError(props: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorFallback {...props} homeHref="/admin" />;
}
