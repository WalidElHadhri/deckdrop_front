"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addToCartAction } from "@/lib/actions/cart";
import type { CartItemInput } from "@/lib/cart";
import { cn } from "@/lib/utils";

export function AddToCartButton({
  item,
  label = "Add to cart",
  withQuantity = false,
  maxQuantity = 99,
  disabled = false,
  className,
}: {
  item: Omit<CartItemInput, "quantity">;
  label?: string;
  withQuantity?: boolean;
  maxQuantity?: number;
  disabled?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [pending, startTransition] = useTransition();
  const max = Math.max(1, Math.min(maxQuantity, 99));

  function add() {
    startTransition(async () => {
      const result = await addToCartAction({ ...item, quantity });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.message ?? "Added to cart", {
          action: { label: "View cart", onClick: () => router.push("/cart") },
        });
      }
    });
  }

  return (
    <div className={cn("flex gap-2", className)}>
      {withQuantity && (
        <Input
          type="number"
          min={1}
          max={max}
          value={quantity}
          onChange={(event) => setQuantity(Math.min(max, Math.max(1, Math.floor(Number(event.target.value)) || 1)))}
          aria-label="Quantity"
          disabled={disabled}
          className="h-9 w-20"
        />
      )}
      <Button type="button" onClick={add} disabled={disabled || pending} className="h-9 flex-1">
        <ShoppingCart />
        {pending ? "Adding…" : label}
      </Button>
    </div>
  );
}
