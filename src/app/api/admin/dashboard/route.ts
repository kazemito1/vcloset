import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
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
