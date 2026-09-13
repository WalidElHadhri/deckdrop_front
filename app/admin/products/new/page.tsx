import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { listCategories } from "@/lib/api";
import { getStorefrontGames } from "@/lib/games";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage() {
  await requireAdmin();
  const [games, categories] = await Promise.all([getStorefrontGames(), listCategories()]);

  return (
    <div className="max-w-4xl">
      <Breadcrumbs items={[{ label: "Products", href: "/admin/products" }, { label: "New product" }]} />
      <div className="mt-3">
        <AdminPageHeader title="New product" />
      </div>
      <ProductForm games={games} categories={categories} />
    </div>
  );
}
