import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getStorefrontGames } from "@/lib/games";

const STATIC_LINKS = [
  { href: "/accessories", label: "Accessories" },
  { href: "/preorders", label: "Pre-orders" },
];

export function PrimaryNav() {
  return (
    <nav aria-label="Primary" className="border-b">
      <ul className="mx-auto flex max-w-7xl items-center overflow-x-auto px-2 text-sm font-medium">
        <Suspense fallback={<GameLinksFallback />}>
          <GameLinks />
        </Suspense>
        {STATIC_LINKS.map((link) => (
          <NavItem key={link.href} {...link} />
        ))}
      </ul>
    </nav>
  );
}

async function GameLinks() {
  await connection();
  // The homepage surfaces load errors; the nav just degrades to its static links.
  const games = await getStorefrontGames().catch(() => []);
  return games.map((game) => <NavItem key={game.id} href={`/${game.slug}`} label={game.displayName} />);
}

function GameLinksFallback() {
  return [0, 1, 2].map((index) => (
    <li key={index} className="px-3">
      <Skeleton className="h-4 w-24" />
    </li>
  ));
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link
        href={href}
        className="inline-flex h-11 items-center border-b-2 border-transparent px-3 whitespace-nowrap text-foreground/75 transition-colors hover:border-primary hover:text-foreground"
      >
        {label}
      </Link>
    </li>
  );
}
