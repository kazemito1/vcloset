import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processReferralCreditOnOrderPaid } from "@/lib/credits";

interface Params {
  params: { id: string };
}

const VALID_STATUSES = ["PENDING", "PAID", "FAILED", "CANCELED"];

export async function GET(_req: NextRequest, { params }: Params) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  });
  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }
  return NextResponse.json(order);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const body = await req.json().catch(() => ({}));
  const status = body.status;

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  try {
    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status },
      include: { items: true },
    });
    if (status === "PAID") {
      await processReferralCreditOnOrderPaid(order.id);
    }
    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar pedido" }, { status: 400 });
  }
}
