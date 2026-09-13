import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck, Clock, XCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getMyOrder } from "@/lib/api";
import { orNotFound, parseId } from "@/lib/api-helpers";
import { getParam } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { requireSession } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Order status" };

// Stripe redirects here with ?redirect_status=...; PayPal via the /checkout/paypal/return handler.
export default async function OrderCompletePage({ params, searchParams }: PageProps<"/checkout/[orderId]/complete">) {
  const orderId = parseId((await params).orderId);
  const { token } = await requireSession(`/checkout/${orderId}/complete`);
  const [order, query] = await Promise.all([orNotFound(getMyOrder(orderId, { token })), searchParams]);
  const redirectStatus = getParam(query, "redirect_status");
  const containsPreorders = order.items?.some((item) => item.preorder);
  const orderLink = (
    <Link href={`/account/orders/${orderId}`} className={cn(buttonVariants(), "h-10 px-4")}>
      View order
    </Link>
  );

  if (order.status === "CANCELLED") {
    return (
      <StatusCard icon={<XCircle className="size-10 text-destructive" />} title="This order was cancelled">
        <p>Order {order.orderNumber} was cancelled and its items were released.</p>
        <Link href="/cart" className={cn(buttonVariants(), "h-10 px-4")}>
          Back to cart
        </Link>
      </StatusCard>
    );
  }

  if (order.status === "PENDING_PAYMENT") {
    const processing = redirectStatus === "succeeded" || redirectStatus === "processing";
    return processing ? (
      <StatusCard icon={<Clock className="size-10 text-primary" />} title="We're confirming your payment">
        <p>This usually takes a few seconds. Refresh this page, or check your order history in a moment.</p>
        <div className="flex justify-center gap-3">
          <Link href={`/checkout/${orderId}/complete?redirect_status=${redirectStatus}`} className={cn(buttonVariants(), "h-10 px-4")}>
            Refresh
          </Link>
          <Link href={`/account/orders/${orderId}`} className={cn(buttonVariants({ variant: "outline" }), "h-10 px-4")}>
            View order
          </Link>
        </div>
      </StatusCard>
    ) : (
      <StatusCard icon={<XCircle className="size-10 text-destructive" />} title="Payment not completed">
        <p>Your order is still reserved. You can try again with another payment method.</p>
        <Link href={`/checkout/${orderId}/payment`} className={cn(buttonVariants(), "h-10 px-4")}>
          Back to payment
        </Link>
      </StatusCard>
    );
  }

  return (
    <StatusCard icon={<CircleCheck className="size-10 text-emerald-600" />} title="Thank you for your order!">
      <p>
        Order <span className="font-medium text-foreground">{order.orderNumber}</span> is confirmed and paid (
        {formatPrice(order.totalAmount)}).
      </p>
      {containsPreorders && (
        <p>In-stock items ship right away. Pre-order items ship as soon as they are released.</p>
      )}
      <div className="flex justify-center gap-3">
        {orderLink}
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "h-10 px-4")}>
          Continue shopping
        </Link>
      </div>
    </StatusCard>
  );
}

function StatusCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="flex justify-center">{icon}</div>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">{title}</h1>
      <div className="mt-3 space-y-4 text-muted-foreground">{children}</div>
    </div>
  );
}
