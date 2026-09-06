import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrderStatus } from "@/lib/orderStatus";

export const dynamic = "force-dynamic";

// Consulta pública dos pedidos do cliente pelo e-mail informado no checkout.
// Por segurança, NUNCA retorna dados de cartão (número, validade, CVV).
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase() ?? "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Informe um e-mail válido." },
      { status: 400 }
    );
  }

  const leads = await prisma.lead.findMany({
    where: { email },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      fullName: true,
      createdAt: true,
      itemsJson: true,
      subtotalCents: true,
      discountCents: true,
      totalCents: true,
      installments: true,
    },
  });

  return NextResponse.json({
    orders: leads.map((lead) => ({
      ...lead,
      status: getOrderStatus(lead.createdAt),
    })),
  });
}
