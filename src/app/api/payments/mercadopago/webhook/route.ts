import { NextRequest, NextResponse } from "next/server";
import { Payment } from "mercadopago";
import { mpClient } from "@/lib/mercadopago";
import { prisma } from "@/lib/prisma";
import { processReferralCreditOnOrderPaid } from "@/lib/credits";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Mercado Pago envia notificações no formato { type: "payment", data: { id } }
    const paymentId = body?.data?.id;
    const type = body?.type;

    if (type !== "payment" || !paymentId) {
      return NextResponse.json({ received: true });
    }

    const paymentClient = new Payment(mpClient);
    const payment = await paymentClient.get({ id: paymentId });

    const orderId = payment.external_reference;

    if (orderId) {
      let status: "PENDING" | "PAID" | "FAILED" = "PENDING";
      if (payment.status === "approved") status = "PAID";
      else if (payment.status === "rejected" || payment.status === "cancelled") status = "FAILED";

      await prisma.order.update({
        where: { id: orderId },
        data: { status, paymentRef: String(payment.id) },
      });

      if (status === "PAID") {
        await processReferralCreditOnOrderPaid(orderId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erro ao processar webhook Mercado Pago:", error);
    return NextResponse.json({ error: "Erro ao processar webhook" }, { status: 500 });
  }
}
