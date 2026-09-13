import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { ActionButton } from "@/components/forms/ActionButton";
import { Notice } from "@/components/Notice";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listCategories } from "@/lib/api";
import { deleteCategoryAction } from "@/lib/actions/admin";
import { getParam, sortCategoryTree } from "@/lib/catalog";
import { getStorefrontGames } from "@/lib/games";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage({ searchParams }: PageProps<"/admin/categories">) {
  await requireAdmin();
  const [games, categories, query] = await Promise.all([getStorefrontGames(), listCategories(), searchParams]);
  const editing = categories.find((category) => String(category.id) === getParam(query, "edit"));

  return (
    <div className="max-w-5xl space-y-8">
      <AdminPageHeader title="Categories" description="Each category belongs to one game and can have subcategories." />

      {games.map((game) => {
        const tree = sortCategoryTree(categories.filter((category) => category.gameId === game.id));
        return (
          <section key={game.id} aria-labelledby={`game-${game.id}`} className="space-y-3">
            <h2 id={`game-${game.id}`} className="font-semibold">
              {game.displayName}
            </h2>
            {tree.length === 0 ? (
              <Notice>No categories yet.</Notice>
            ) : (
              <div className="rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-4">Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead className="pr-4 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tree.map(({ category, depth }) => (
                      <TableRow key={category.id} data-state={category.id === editing?.id ? "selected" : undefined}>
                        <TableCell className="pl-4 font-medium">
                          <span className={depth > 0 ? "pl-6 text-muted-foreground" : undefined}>
                            {depth > 0 && "└ "}
                            {category.name}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{category.slug}</TableCell>
                        <TableCell className="space-x-1 pr-4 text-right">
                          <Link href={`/admin/categories?edit=${category.id}#category-form`} className="text-sm text-primary hover:underline">
                            Edit
                          </Link>
                          <ActionButton
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            action={deleteCategoryAction.bind(null, category.id!)}
                            confirmMessage={`Delete the category "${category.name}"?`}
                          >
                            Delete
                          </ActionButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </section>
        );
      })}

      <section id="category-form" className="space-y-4 rounded-xl border p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">{editing ? `Edit “${editing.name}”` : "New category"}</h2>
          {editing && (
            <Link href="/admin/categories" className="text-sm text-muted-foreground hover:text-foreground">
              Cancel
            </Link>
          )}
        </div>
        <CategoryForm key={editing?.id ?? "new"} category={editing} games={games} categories={categories} />
      </section>
    </div>
  );
}
