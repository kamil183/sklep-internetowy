"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createProduct(formData: FormData) {
  "use server";
  await requireAdmin();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const priceCents = Math.round(parseFloat(formData.get("price") as string) * 100);
  const stock = parseInt(formData.get("stock") as string, 10);
  const categoryName = (formData.get("category") as string)?.trim();
  const imageUrls = (formData.get("images") as string)
    .split("\n")
    .map((u) => u.trim())
    .filter(Boolean);

  let categoryId: string | undefined;
  if (categoryName) {
    const category = await prisma.category.upsert({
      where: { slug: slugify(categoryName) },
      update: {},
      create: { name: categoryName, slug: slugify(categoryName) },
    });
    categoryId = category.id;
  }

  const product = await prisma.product.create({
    data: {
      name,
      slug: `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`,
      description,
      priceCents,
      stock,
      categoryId,
      images: { create: imageUrls.map((url, i) => ({ url, position: i })) },
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect(`/admin/products/${product.id}/edit`);
}

export async function updateProduct(productId: string, formData: FormData) {
  "use server";
  await requireAdmin();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const priceCents = Math.round(parseFloat(formData.get("price") as string) * 100);
  const stock = parseInt(formData.get("stock") as string, 10);
  const isActive = formData.get("isActive") === "on";
  const imageUrls = (formData.get("images") as string)
    .split("\n")
    .map((u) => u.trim())
    .filter(Boolean);

  await prisma.$transaction([
    prisma.product.update({
      where: { id: productId },
      data: { name, description, priceCents, stock, isActive },
    }),
    prisma.productImage.deleteMany({ where: { productId } }),
    prisma.productImage.createMany({
      data: imageUrls.map((url, i) => ({ productId, url, position: i })),
    }),
  ]);

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}/edit`);
  revalidatePath("/products");
}

export async function deleteProduct(productId: string) {
  "use server";
  await requireAdmin();
  await prisma.product.delete({ where: { id: productId } });
  revalidatePath("/admin/products");
  revalidatePath("/products");
}
