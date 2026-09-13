"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/action-state";

/** Runs a one-off Server Action (delete, cancel, ...) and reports its outcome as a toast. */
export function ActionButton({
  action,
  confirmMessage,
  disabled,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "onClick" | "action"> & {
  action: () => Promise<ActionState | void>;
  confirmMessage?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      {...props}
      type="button"
      disabled={pending || disabled}
      onClick={() => {
        if (confirmMessage && !window.confirm(confirmMessage)) return;
        startTransition(async () => {
          const result = await action();
          if (result?.error) toast.error(result.error);
          else if (result?.message) toast.success(result.message);
        });
      }}
    >
      {children}
    </Button>
  );
}
