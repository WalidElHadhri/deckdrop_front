import { cn } from "@/lib/utils";

/** Empty and error states inside a page section. */
export function Notice({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div role="status" className={cn("rounded-xl border border-dashed p-6 text-sm text-muted-foreground", className)}>
      {children}
    </div>
  );
}
