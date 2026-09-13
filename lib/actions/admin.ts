"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import {
  cancelAdminOrder,
  createCategory,
  createProduct,
  createShipment,
  deleteCategory,
  deleteProduct,
  deleteShippingRate,
  markShipmentDelivered,
  releasePreorders,
  updateCategory,
  updateProduct,
  updateShipment,
  upsertShippingRate,
} from "@/lib/api";
import { toActionError, type ActionState } from "@/lib/action-state";
import type { Country } from "@/lib/cart";
import type { ProductType } from "@/lib/catalog";
import { formBoolean, formIds, formNumber, formString } from "@/lib/form";
import { requireAdmin } from "@/lib/session";
import { createVariant, deleteVariant, updateVariant, type CardVariantRequest, type VariantType } from "@/lib/variants";
import type { ProductRequest } from "@/types/api";

// ---- Products ----

export async function saveProductAction(
  productId: number | null,
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { token } = await requireAdmin();
  const preorder = formBoolean(formData, "preorder");
  const body: ProductRequest = {
    gameId: formNumber(formData, "gameId")!,
    categoryId: formNumber(formData, "categoryId")!,
    productType: formString(formData, "productType") as ProductType,
    name: formString(formData, "name") ?? "",
    slug: formString(formData, "slug"),
    description: formString(formData, "description"),
    setCode: formString(formData, "setCode"),
    basePrice: formNumber(formData, "basePrice"),
    stockQuantity: formNumber(formData, "stockQuantity"),
    imageUrls: (formString(formData, "imageUrls") ?? "")
      .split(/\r?\n/)
      .map((url) => url.trim())
      .filter(Boolean),
    preorder,
    releaseDate: preorder ? formString(formData, "releaseDate") : undefined,
  };

  let createdId: number | undefined;
  try {
    if (productId === null) createdId = (await createProduct(body, { token })).id;
    else await updateProduct(productId, body, { token });
  } catch (error) {
    return toActionError(error);
  }
  if (createdId !== undefined) redirect(`/admin/products/${createdId}`);
  refresh();
  return { message: "Product saved." };
}

export async function deleteProductAction(productId: number): Promise<ActionState> {
  const { token } = await requireAdmin();
  try {
    await deleteProduct(productId, { token });
  } catch (error) {
    return toActionError(error, { 409: "This product has been ordered and can't be deleted. Set its stock to 0 instead." });
  }
  redirect("/admin/products");
}

export async function saveVariantAction(
  variantType: VariantType,
  productId: number,
  variantId: number | null,
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { token } = await requireAdmin();
  const body = {
    rarity: formString(formData, "rarity"),
    holoType: formString(formData, "holoType"),
    cardType: formString(formData, "cardType"),
    condition: formString(formData, "condition"),
    setCode: formString(formData, "setCode") ?? "",
    cardNumber: formString(formData, "cardNumber") ?? "",
    stockQuantity: formNumber(formData, "stockQuantity"),
    price: formNumber(formData, "price"),
  } as CardVariantRequest;
  try {
    if (variantId === null) await createVariant(variantType, productId, body, { token });
    else await updateVariant(variantType, productId, variantId, body, { token });
  } catch (error) {
    return toActionError(error);
  }
  refresh();
  return { message: variantId === null ? "Variant added." : "Variant saved." };
}

export async function deleteVariantAction(
  variantType: VariantType,
  productId: number,
  variantId: number,
): Promise<ActionState> {
  const { token } = await requireAdmin();
  try {
    await deleteVariant(variantType, productId, variantId, { token });
  } catch (error) {
    return toActionError(error, { 409: "This variant has been ordered and can't be deleted. Set its stock to 0 instead." });
  }
  refresh();
  return { message: "Variant deleted." };
}

// ---- Categories ----

export async function saveCategoryAction(
  categoryId: number | null,
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { token } = await requireAdmin();
  const body = {
    gameId: formNumber(formData, "gameId")!,
    name: formString(formData, "name") ?? "",
    slug: formString(formData, "slug"),
    parentCategoryId: formNumber(formData, "parentCategoryId"),
  };
  try {
    if (categoryId === null) await createCategory(body, { token });
    else await updateCategory(categoryId, body, { token });
  } catch (error) {
    return toActionError(error);
  }
  redirect("/admin/categories");
}

export async function deleteCategoryAction(categoryId: number): Promise<ActionState> {
  const { token } = await requireAdmin();
  try {
    await deleteCategory(categoryId, { token });
  } catch (error) {
    return toActionError(error, { 409: "This category still has products or subcategories." });
  }
  refresh();
  return { message: "Category deleted." };
}

// ---- Orders ----

export async function cancelAdminOrderAction(orderId: number): Promise<ActionState> {
  const { token } = await requireAdmin();
  try {
    await cancelAdminOrder(orderId, { token });
  } catch (error) {
    return toActionError(error);
  }
  refresh();
  return { message: "Order cancelled." };
}

export async function createShipmentAction(orderId: number, _: ActionState, formData: FormData): Promise<ActionState> {
  const { token } = await requireAdmin();
  const itemIds = formIds(formData, "itemIds");
  try {
    await createShipment(
      orderId,
      {
        carrier: formString(formData, "carrier") ?? "",
        trackingNumber: formString(formData, "trackingNumber") ?? "",
        itemIds: itemIds.length ? itemIds : undefined,
      },
      { token },
    );
  } catch (error) {
    return toActionError(error);
  }
  refresh();
  return { message: "Shipment created." };
}

export async function updateShipmentAction(
  orderId: number,
  shipmentId: number,
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { token } = await requireAdmin();
  try {
    await updateShipment(
      orderId,
      shipmentId,
      {
        carrier: formString(formData, "carrier") ?? "",
        trackingNumber: formString(formData, "trackingNumber") ?? "",
      },
      { token },
    );
  } catch (error) {
    return toActionError(error);
  }
  refresh();
  return { message: "Shipment updated." };
}

export async function markShipmentDeliveredAction(orderId: number, shipmentId: number): Promise<ActionState> {
  const { token } = await requireAdmin();
  try {
    await markShipmentDelivered(orderId, shipmentId, { token });
  } catch (error) {
    return toActionError(error);
  }
  refresh();
  return { message: "Marked as delivered." };
}

// ---- Pre-orders ----

export async function releasePreordersAction(productId: number): Promise<ActionState> {
  const { token } = await requireAdmin();
  let message: string;
  try {
    const result = await releasePreorders(productId, { token });
    message = `${result.itemsReadyToShip ?? 0} item(s) in ${result.ordersAffected ?? 0} order(s) are now ready to ship.`;
  } catch (error) {
    return toActionError(error);
  }
  refresh();
  return { message };
}

// ---- Shipping rates ----

export async function saveShippingRateAction(country: Country, _: ActionState, formData: FormData): Promise<ActionState> {
  const { token } = await requireAdmin();
  try {
    await upsertShippingRate(
      country,
      {
        price: formNumber(formData, "price")!,
        freeShippingThreshold: formNumber(formData, "freeShippingThreshold") ?? null,
      },
      { token },
    );
  } catch (error) {
    return toActionError(error);
  }
  refresh();
  return { message: "Shipping rate saved." };
}

export async function deleteShippingRateAction(country: Country): Promise<ActionState> {
  const { token } = await requireAdmin();
  try {
    await deleteShippingRate(country, { token });
  } catch (error) {
    return toActionError(error);
  }
  refresh();
  return { message: "Shipping to this country is now disabled." };
}
