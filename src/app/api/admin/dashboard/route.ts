import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
// Retorna todos os produtos com suas variantes (para a tela de gestão de estoque).
export async function GET() {
  const products = await prisma.product.findMany({
    include: { variants: true, category: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(products);
}

  const [totalOrders, totalProducts, totalCategories, paidOrders, pendingOrders] =
    await Promise.all([
      prisma.order.count(),
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.findMany({ where: { status: "PAID" }, select: { totalCents: true } }),
      prisma.order.count({ where: { status: "PENDING" } }),
    ]);

  const totalRevenueCents = paidOrders.reduce((sum, o) => sum + o.totalCents, 0);

  return NextResponse.json({
    totalOrders,
    totalProducts,
    totalCategories,
    totalRevenueCents,
    pendingOrders,
  });
}
