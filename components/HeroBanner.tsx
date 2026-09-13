import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Static placeholder content until promotions are managed from the backend.
export function HeroBanner() {
  return (
    <section aria-labelledby="hero-heading" className="overflow-hidden rounded-2xl bg-primary text-primary-foreground">
      <div className="grid items-center gap-8 px-6 py-10 sm:px-10 md:grid-cols-[3fr_2fr] md:py-14">
        <div className="space-y-4">
          <p className="text-xs font-semibold tracking-widest text-primary-foreground/70 uppercase">Pre-orders open</p>
          <h1 id="hero-heading" className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Secure the next set before release day
          </h1>
          <p className="max-w-prose text-primary-foreground/80">
            Sealed product, singles and accessories for Yu-Gi-Oh, Pokémon TCG and One Piece TCG. Prices include VAT,
            shipped across the EU.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/preorders" className={cn(buttonVariants({ variant: "secondary" }), "h-10 px-4")}>
              Browse pre-orders
            </Link>
            <Link
              href="#shop-by-game"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-10 border-primary-foreground/30 bg-transparent px-4 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground",
              )}
            >
              Shop by game
            </Link>
          </div>
        </div>

        {/* Decorative card fan standing in for campaign artwork. */}
        <div aria-hidden className="relative hidden h-56 md:block">
          {["-rotate-12 -translate-x-16", "-rotate-3", "rotate-6 translate-x-16"].map((transform) => (
            <div
              key={transform}
              className={cn(
                "absolute top-1/2 left-1/2 h-52 w-36 -mt-26 -ml-18 rounded-xl border border-primary-foreground/25 bg-primary-foreground/10 shadow-lg backdrop-blur-sm",
                transform,
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
