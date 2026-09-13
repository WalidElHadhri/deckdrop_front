import Link from "next/link";
import { Suspense } from "react";
import { HeaderActions, HeaderActionsFallback } from "@/components/HeaderActions";
import { PrimaryNav } from "@/components/PrimaryNav";
import { SearchBar } from "@/components/SearchBar";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-background">
      <div className="border-b">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 md:flex-nowrap">
          <Link href="/" className="text-xl font-extrabold tracking-tight whitespace-nowrap">
            AR-DECKDROP
          </Link>

          <div className="order-last w-full md:order-none md:max-w-2xl md:flex-1">
            <SearchBar />
          </div>

          <div className="ml-auto flex items-center gap-1">
            <Suspense fallback={<HeaderActionsFallback />}>
              <HeaderActions />
            </Suspense>
          </div>
        </div>
      </div>

      <PrimaryNav />
    </header>
  );
}
