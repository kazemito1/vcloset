import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Painel: lista TODAS as avaliações (pendentes primeiro, depois mais recentes).
export async function GET() {
  const reviews = await prisma.review.findMany({
    orderBy: [{ approved: "asc" }, { createdAt: "desc" }],
    include: { product: { select: { name: true, slug: true } } },
  });
  return NextResponse.json(reviews);
}
