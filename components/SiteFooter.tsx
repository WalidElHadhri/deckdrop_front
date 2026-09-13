import Link from "next/link";
import { BadgeEuro, CalendarClock, ShieldCheck, Truck } from "lucide-react";

const TRUST_POINTS = [
  { icon: Truck, title: "EU-wide shipping", text: "Flat rate per country" },
  { icon: CalendarClock, title: "Pre-orders", text: "Shipped on release day" },
  { icon: ShieldCheck, title: "Secure checkout", text: "Card or PayPal" },
  { icon: BadgeEuro, title: "Fair pricing", text: "All prices incl. VAT" },
];

const FOOTER_LINKS = [
  { href: "/search", label: "All products" },
  { href: "/accessories", label: "Accessories" },
  { href: "/preorders", label: "Pre-orders" },
  { href: "/account/orders", label: "Order history" },
  { href: "/account", label: "My account" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-muted/40">
      <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-6 border-b px-4 py-8 md:grid-cols-4">
        {TRUST_POINTS.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-start gap-3">
            <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-sm text-muted-foreground">{text}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">AR-DECKDROP</span>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
