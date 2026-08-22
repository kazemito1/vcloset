import { NextRequest, NextResponse } from "next/server";
import { mpPayment } from "@/lib/mercadopago";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "orderId é obrigatório" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    if (order.paymentMethod !== "PIX") {
      return NextResponse.json(
        { error: "Este pedido não está configurado para pagamento via PIX" },
        { status: 400 }
      );
    }

    const payment = await mpPayment.create({
      body: {
        transaction_amount: order.totalCents / 100,
        description: `Pedido ${order.id} - V.CLOSET`,
        payment_method_id: "pix",
        payer: {
          email: order.customerEmail,
          first_name: order.customerName.split(" ")[0],
        },
        metadata: { order_id: order.id },
        external_reference: order.id,
      },
    });

    const qrCode = payment.point_of_interaction?.transaction_data?.qr_code;
    const qrCodeBase64 = payment.point_of_interaction?.transaction_data?.qr_code_base64;

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentRef: String(payment.id),
        pixQrCode: qrCode || null,
        pixQrCodeBase64: qrCodeBase64 || null,
      },
    });

    return NextResponse.json({
      paymentId: payment.id,
      qrCode,
      qrCodeBase64,
      status: payment.status,
    });
  } catch (error) {
    console.error("Erro ao criar pagamento PIX:", error);
    return NextResponse.json({ error: "Erro ao gerar PIX" }, { status: 500 });
  }
}
