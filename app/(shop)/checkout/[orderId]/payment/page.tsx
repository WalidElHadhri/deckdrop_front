import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CircleAlert } from "lucide-react";
import { PayPalPayment, StripePayment } from "@/components/checkout/PaymentMethods";
import { ActionButton } from "@/components/forms/ActionButton";
import { AddressLines, OrderTotals } from "@/components/orders/OrderDetails";
import { PageHeader } from "@/components/PageHeader";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { getMyOrder } from "@/lib/api";
import { cancelOrderAction } from "@/lib/actions/orders";
import { orNotFound, parseId } from "@/lib/api-helpers";
import { getParam } from "@/lib/catalog";
import { formatDateTime, formatPrice } from "@/lib/format";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Payment" };

export default async function PaymentPage({ params, searchParams }: PageProps<"/checkout/[orderId]/payment">) {
  const orderId = parseId((await params).orderId);
  const { token } = await requireSession(`/checkout/${orderId}/payment`);
  const [order, query] = await Promise.all([orNotFound(getMyOrder(orderId, { token })), searchParams]);
  if (order.status !== "PENDING_PAYMENT") redirect(`/checkout/${orderId}/complete`);

  const notice =
    getParam(query, "error") === "paypal"
      ? "The PayPal payment couldn't be completed. Please try again or pay by card."
      : getParam(query, "cancelled") === "1"
        ? "You cancelled the PayPal payment. Your order is still reserved."
        : undefined;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:py-8">
      <PageHeader
        title="Payment"
        description={
          <>
            Order <span className="font-medium text-foreground">{order.orderNumber}</span> is reserved until{" "}
            <span className="font-medium text-foreground">{formatDateTime(order.paymentDueBy)}</span>.
          </>
        }
      />

      <div className="grid items-start gap-6 md:grid-cols-[1fr_20rem]">
        <section className="space-y-5 rounded-xl border bg-card p-5">
          {notice && (
            <Alert variant="destructive">
              <CircleAlert />
              <AlertTitle>{notice}</AlertTitle>
            </Alert>
          )}
          <h2 className="text-lg font-semibold">Choose how to pay {formatPrice(order.totalAmount)}</h2>
          <StripePayment orderId={orderId} amountLabel={formatPrice(order.totalAmount)} />
          <div className="flex items-center gap-3 text-xs text-muted-foreground uppercase">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>
          <PayPalPayment orderId={orderId} />
        </section>

        <aside className="space-y-4 rounded-xl border bg-card p-5">
          <h2 className="font-semibold">Order summary</h2>
          <ul className="space-y-2 text-sm">
            {(order.items ?? []).map((item) => (
              <li key={item.id} className="flex justify-between gap-3">
                <span className="min-w-0">
                  {item.quantity} × {item.productName}
                  {item.variantDescription && (
                    <span className="block text-xs text-muted-foreground">{item.variantDescription}</span>
                  )}
                </span>
                <span className="tabular-nums">{formatPrice(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t pt-3">
            <OrderTotals order={order} />
          </div>
          <div className="space-y-1 border-t pt-3">
            <h3 className="text-sm font-medium">Ships to</h3>
            <AddressLines address={order.shippingAddress} />
          </div>
          <ActionButton
            variant="ghost"
            className="h-9 w-full text-muted-foreground"
            action={cancelOrderAction.bind(null, orderId)}
            confirmMessage="Cancel this order? Reserved items will be released."
          >
            Cancel order
          </ActionButton>
        </aside>
      </div>
    </div>
  );
}
