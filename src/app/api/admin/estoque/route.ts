import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Retorna todos os produtos com suas variantes (para a tela de gestão de estoque).
export async function GET() {
  const products = await prisma.product.findMany({
    include: { variants: true, category: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(products);
}
