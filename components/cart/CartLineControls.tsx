"use client";

import { useTransition } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/action-state";
import { removeCartLineAction, updateCartLineAction } from "@/lib/actions/cart";

export function CartLineControls({ lineId, quantity }: { lineId: number; quantity: number }) {
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<ActionState>) {
    startTransition(async () => {
      const result = await action();
      if (result.error) toast.error(result.error);
    });
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center rounded-lg border">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Decrease quantity"
          disabled={pending || quantity <= 1}
          onClick={() => run(() => updateCartLineAction(lineId, quantity - 1))}
        >
          <Minus />
        </Button>
        <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">
          {quantity}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Increase quantity"
          disabled={pending || quantity >= 99}
          onClick={() => run(() => updateCartLineAction(lineId, quantity + 1))}
        >
          <Plus />
        </Button>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Remove item"
        disabled={pending}
        onClick={() => run(() => removeCartLineAction(lineId))}
      >
        <Trash2 />
      </Button>
    </div>
  );
}
