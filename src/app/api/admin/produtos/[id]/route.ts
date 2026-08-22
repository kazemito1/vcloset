import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/format";

interface Params {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: Params) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { category: true, variants: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const body = await req.json().catch(() => ({}));
  const {
    name,
    description,
    material,
    priceCents,
    salePriceCents,
    targetGender,
    categoryId,
    featured,
    images,
    variants,
  } = body;

  if (!name || !description || !material || !categoryId || typeof priceCents !== "number") {
    return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
  }

  const validGenders = ["feminino", "masculino", "unissex"];
  const genderValue = validGenders.includes(targetGender) ? targetGender : "unissex";

  const saleValue: number | null =
    typeof salePriceCents === "number" && salePriceCents > 0 && salePriceCents < priceCents
      ? salePriceCents
      : null;

  const imageList: string[] = Array.isArray(images) && images.length > 0
    ? images.filter((i: unknown) => typeof i === "string" && i.trim())
    : ["/products/placeholder-aneis.svg"];

  const variantList: { label: string; stock: number }[] = Array.isArray(variants)
    ? variants
        .filter((v: { label?: string }) => v && typeof v.label === "string" && v.label.trim())
        .map((v: { label: string; stock?: number }) => ({
          label: v.label.trim(),
          stock: typeof v.stock === "number" ? v.stock : 10,
        }))
    : [];

  try {
    // Substitui as variantes (abordagem simples: apaga e recria)
    await prisma.productVariant.deleteMany({ where: { productId: params.id } });

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        slug: slugify(name),
        description,
        material,
        priceCents,
        salePriceCents: saleValue,
        targetGender: genderValue,
        images: JSON.stringify(imageList),
        featured: !!featured,
        categoryId,
        variants: variantList.length > 0 ? { create: variantList } : undefined,
      },
      include: { category: true, variants: true },
    });
    return NextResponse.json(product);
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const orderItemsCount = await prisma.orderItem.count({ where: { productId: params.id } });
    if (orderItemsCount > 0) {
      return NextResponse.json(
        { error: "Não é possível excluir: produto possui pedidos vinculados" },
        { status: 409 }
      );
    }

    await prisma.productVariant.deleteMany({ where: { productId: params.id } });
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    return NextResponse.json({ error: "Erro ao excluir produto" }, { status: 400 });
  }
}
