"use client";

import { useActionState, useState, useTransition } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { CreditCard } from "lucide-react";
import { FormAlert } from "@/components/forms/FormAlert";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/action-state";
import { startPayPalPaymentAction, startStripePaymentAction } from "@/lib/actions/orders";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

export function StripePayment({ orderId, amountLabel }: { orderId: number; amountLabel: string }) {
  const [clientSecret, setClientSecret] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  if (!stripePromise) {
    return <p className="text-sm text-muted-foreground">Card payments are currently unavailable.</p>;
  }

  if (!clientSecret) {
    return (
      <div className="grid gap-3">
        <FormAlert state={{ error }} />
        <Button
          type="button"
          className="h-10"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await startStripePaymentAction(orderId);
              setError(result.error);
              setClientSecret(result.clientSecret);
            })
          }
        >
          <CreditCard />
          {pending ? "Preparing card payment…" : "Pay by card"}
        </Button>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
      <StripeCardForm orderId={orderId} amountLabel={amountLabel} />
    </Elements>
  );
}

function StripeCardForm({ orderId, amountLabel }: { orderId: number; amountLabel: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    // On success Stripe redirects to the return URL; the order is marked paid by Stripe's webhook.
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/checkout/${orderId}/complete` },
    });
    setError(result.error?.message ?? "The payment couldn't be completed.");
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <PaymentElement />
      <FormAlert state={{ error }} />
      <Button type="submit" className="h-10" disabled={!stripe || submitting}>
        {submitting ? "Processing…" : `Pay ${amountLabel}`}
      </Button>
    </form>
  );
}

export function PayPalPayment({ orderId }: { orderId: number }) {
  const [state, formAction, pending] = useActionState<ActionState>(() => startPayPalPaymentAction(orderId), {});
  return (
    <form action={formAction} className="grid gap-3">
      <FormAlert state={state} />
      <SubmitButton variant="outline" className="h-10" pending={pending} pendingLabel="Redirecting to PayPal…">
        Pay with PayPal
      </SubmitButton>
    </form>
  );
}
