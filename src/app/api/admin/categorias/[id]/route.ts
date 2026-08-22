import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/format";

interface Params {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: Params) {
  const category = await prisma.category.findUnique({ where: { id: params.id } });
  if (!category) {
    return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
  }
  return NextResponse.json(category);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const order = typeof body.order === "number" ? body.order : undefined;

  if (!name) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  try {
    const category = await prisma.category.update({
      where: { id: params.id },
      data: { name, slug: slugify(name), order },
    });
    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar categoria" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const productsCount = await prisma.product.count({ where: { categoryId: params.id } });
  if (productsCount > 0) {
    return NextResponse.json(
      { error: "Não é possível excluir: há produtos vinculados a esta categoria" },
      { status: 409 }
    );
  }

  try {
    await prisma.category.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro ao excluir categoria" }, { status: 400 });
  }
}
