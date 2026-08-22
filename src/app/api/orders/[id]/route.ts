import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    id: order.id,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    totalCents: order.totalCents,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentRef: order.paymentRef,
    pixQrCode: order.pixQrCode,
    pixQrCodeBase64: order.pixQrCodeBase64,
    createdAt: order.createdAt,
    items: order.items,
  });
}
