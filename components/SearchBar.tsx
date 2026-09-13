import Form from "next/form";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchBar() {
  return (
    <Form action="/search" role="search" className="flex w-full gap-2">
      <label htmlFor="site-search" className="sr-only">
        Search products
      </label>
      <div className="relative flex-1">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id="site-search"
          type="search"
          name="q"
          placeholder="Search cards, sealed product, accessories…"
          className="h-10 pl-9"
        />
      </div>
      <Button type="submit" className="h-10 px-4">
        Search
      </Button>
    </Form>
  );
}
