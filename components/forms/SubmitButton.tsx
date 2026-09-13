"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

/** Submit button that disables itself while the form's action runs. Pass `pending` for ActionForm forms. */
export function SubmitButton({
  children,
  pending,
  pendingLabel,
  disabled,
  ...props
}: React.ComponentProps<typeof Button> & { pending?: boolean; pendingLabel?: string }) {
  const status = useFormStatus();
  const isPending = pending ?? status.pending;
  return (
    <Button {...props} type="submit" disabled={isPending || disabled}>
      {isPending && pendingLabel ? pendingLabel : children}
    </Button>
  );
}
