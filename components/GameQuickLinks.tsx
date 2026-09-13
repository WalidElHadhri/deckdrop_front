import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight } from "lucide-react";
import { Notice } from "@/components/Notice";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { GAME_STYLES } from "@/lib/game-styles";
import { getStorefrontGames, type StorefrontGame } from "@/lib/games";
import { cn } from "@/lib/utils";

const GRID = "grid gap-3 sm:grid-cols-2 lg:grid-cols-3";

export async function GameQuickLinks() {
  await connection();

  let games: StorefrontGame[];
  try {
    games = await getStorefrontGames();
  } catch (error) {
    console.error("Failed to load games for the homepage", error);
    return <Notice>Games couldn&apos;t be loaded right now. Please try again shortly.</Notice>;
  }

  if (games.length === 0) return <Notice>No games are available yet.</Notice>;

  return (
    <ul className={GRID}>
      {games.map((game) => (
        <li key={game.id}>
          <GameCard game={game} />
        </li>
      ))}
    </ul>
  );
}

export function GameQuickLinksSkeleton() {
  return (
    <div className={GRID}>
      {[0, 1, 2].map((index) => (
        <Skeleton key={index} className="h-20 rounded-xl" />
      ))}
    </div>
  );
}

function GameCard({ game }: { game: StorefrontGame }) {
  const style = game.name ? GAME_STYLES[game.name] : undefined;

  return (
    <Link href={`/${game.slug}`} className="group block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
      <Card className="h-20 flex-row items-center gap-4 px-4 transition-shadow group-hover:shadow-md group-hover:ring-foreground/20">
        <span
          aria-hidden
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white",
            style?.className ?? "bg-muted-foreground",
          )}
        >
          {style?.monogram ?? game.displayName.charAt(0)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-base font-semibold">{game.displayName}</span>
          <span className="block text-sm text-muted-foreground">Singles, sealed &amp; accessories</span>
        </span>
        <ArrowRight
          aria-hidden
          className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
        />
      </Card>
    </Link>
  );
}
