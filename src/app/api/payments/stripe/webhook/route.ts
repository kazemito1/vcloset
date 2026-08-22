import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { processReferralCreditOnOrderPaid } from "@/lib/credits";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const rawBody = await req.text();

  let event: Stripe.Event;

  try {
    if (!signature || !webhookSecret) {
      // Em ambiente de teste sem webhook secret configurado, tentamos parsear direto.
      event = JSON.parse(rawBody) as Stripe.Event;
    } else {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    }
  } catch (err) {
    console.error("Erro ao validar assinatura do webhook Stripe:", err);
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object as Stripe.PaymentIntent;
        const orderId = intent.metadata?.orderId;
        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: { status: "PAID", paymentRef: intent.id },
          });
          await processReferralCreditOnOrderPaid(orderId);
        }
        break;
      }
      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        const orderId = intent.metadata?.orderId;
        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: { status: "FAILED" },
          });
        }
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erro ao processar webhook Stripe:", error);
    return NextResponse.json({ error: "Erro ao processar webhook" }, { status: 500 });
  }
}
