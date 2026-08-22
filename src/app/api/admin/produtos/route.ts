import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/format";

export async function GET(req: NextRequest) {
  const categoryId = req.nextUrl.searchParams.get("categoryId") || undefined;
  const search = req.nextUrl.searchParams.get("q") || undefined;

  const products = await prisma.product.findMany({
    where: {
      categoryId: categoryId || undefined,
      name: search ? { contains: search } : undefined,
    },
    include: { category: true, variants: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
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
    const product = await prisma.product.create({
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
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 400 });
  }
}
