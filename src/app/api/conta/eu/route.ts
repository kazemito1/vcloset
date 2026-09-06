import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customerAuth";
import { getOrderStatus } from "@/lib/orderStatus";

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
    where: { email: customer.email },
    orderBy: { createdAt: "desc" },
    take: 50,
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
    customer,
    orders: leads.map((lead) => ({
      ...lead,
      status: getOrderStatus(lead.createdAt),
    })),
  });
}
