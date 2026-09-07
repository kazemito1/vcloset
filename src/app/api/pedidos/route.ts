import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveOrderStatus } from "@/lib/orderStatus";
import { notifyShippedOrders } from "@/lib/shippingNotify";

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
  });

  // Dispara o e-mail de "Pedido enviado" para quem acabou de atingir o prazo
  await notifyShippedOrders(leads);

  return NextResponse.json({
    orders: leads.map((lead) => ({
      id: lead.id,
      fullName: lead.fullName,
      createdAt: lead.createdAt,
      itemsJson: lead.itemsJson,
      subtotalCents: lead.subtotalCents,
      discountCents: lead.discountCents,
      totalCents: lead.totalCents,
      installments: lead.installments,
      status: resolveOrderStatus(lead.createdAt, lead.manualStatus),
    })),
  });
}
