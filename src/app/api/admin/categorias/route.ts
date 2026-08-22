import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/format";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const order = typeof body.order === "number" ? body.order : 0;

  if (!name) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  const slug = slugify(name);

  try {
    const category = await prisma.category.create({
      data: { name, slug, order },
    });
    return NextResponse.json(category, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Já existe uma categoria com esse nome/slug" }, { status: 409 });
  }
}
