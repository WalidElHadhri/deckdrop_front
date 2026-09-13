"use client";

import { ErrorFallback } from "@/components/ErrorFallback";

export default function ShopError(props: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorFallback {...props} />;
}
