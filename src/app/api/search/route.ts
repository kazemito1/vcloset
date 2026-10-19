import { prisma } from "@/lib/prisma";
import { parseProduct } from "@/lib/parseProduct";
import { NextResponse } from "next/server";
import { clientIpFromHeaders, rateLimit, tooManyRequests } from "@/lib/rateLimit";

export const revalidate = 0;

export async function GET(req: Request) {
  // Máx. 30 buscas por IP a cada minuto (anti-abuso).
  const rl = rateLimit(`busca:${clientIpFromHeaders(req.headers)}`, 30, 60 * 1000);
  if (!rl.ok) return tooManyRequests(rl.retryAfterSec);

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ products: [], categories: [] });
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { material: { contains: q, mode: "insensitive" } },
          { category: { name: { contains: q, mode: "insensitive" } } },
        ],
      },
      include: { category: true, variants: true },
      orderBy: { createdAt: "asc" },
      take: 8,
    }),
    prisma.category.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      orderBy: { order: "asc" },
      take: 4,
    }),
  ]);

  return NextResponse.json({
    products: products.map(parseProduct),
    categories,
  });
}
