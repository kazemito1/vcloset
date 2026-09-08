import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customerAuth";
import { resolveOrderStatus } from "@/lib/orderStatus";
import { notifyShippedOrders } from "@/lib/shippingNotify";

export const dynamic = "force-dynamic";

// Dados da conta logada + pedidos (model Lead) associados pelo e-mail.
// Nunca retorna dados de cartão.
export async function GET(req: NextRequest) {
  const session = await getCustomerSession(req);
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const customer = await prisma.customer.findUnique({
    where: { id: session.customerId },
    select: { name: true, email: true },
  });

  if (!customer) {
    return NextResponse.json({ error: "Conta não encontrada." }, { status: 404 });
  }

  const leads = await prisma.lead.findMany({
    where: { email: customer.email, manualStatus: { not: "RECUSADO" } },
    orderBy: { createdAt: "desc" },
  });

  // Dispara o e-mail de "Pedido enviado" para quem acabou de atingir o prazo
  await notifyShippedOrders(leads);

  return NextResponse.json({
    customer,
    orders: leads.map((lead) => ({
      id: lead.id,
      fullName: lead.fullName,
      createdAt: lead.createdAt,
      itemsJson: lead.itemsJson,
      subtotalCents: lead.subtotalCents,
      discountCents: lead.discountCents,
      totalCents: lead.totalCents,
      installments: lead.installments,
      paymentMethod: lead.paymentMethod,
      status: resolveOrderStatus(lead.createdAt, lead.manualStatus, lead.paymentMethod),
    })),
  });
}
