import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
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

    if (order.paymentMethod !== "CREDIT_CARD") {
      return NextResponse.json(
        { error: "Este pedido não está configurado para pagamento com cartão" },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.totalCents,
      currency: "brl",
      metadata: { orderId: order.id },
      automatic_payment_methods: { enabled: true },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentRef: paymentIntent.id },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Erro ao criar Payment Intent:", error);
    return NextResponse.json({ error: "Erro ao iniciar pagamento" }, { status: 500 });
  }
}
