import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOrderSchema } from "@/lib/validation";
import { resolveAppliedCode, generateRewardCouponCode } from "@/lib/coupons";
import { applyCreditToOrder } from "@/lib/credits";
import { notifyNewOrder } from "@/lib/telegram";
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);
    });

    notifyNewOrder({
      id: order.id,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      totalCents: order.totalCents,
      paymentMethod: order.paymentMethod,
      items: order.items.map((item) => ({
        productName: item.productName,
        variantLabel: item.variantLabel,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
      })),
    });

    return NextResponse.json(
      {
        id: order.id,

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      customerName,
      customerEmail,
      customerPhone,
      customerCpf,
      shippingAddress,
      paymentMethod,
      items,
      appliedCode,
      useCredit,
      creditCustomerEmail,
    } = parsed.data;

    const subtotalCents = items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0);

    let discountCents = 0;
    let couponCode: string | null = null;
    let referralCode: string | null = null;
    let appliedCouponId: string | null = null;
    let appliedReferralId: string | null = null;

    // Revalida o código de cupom/indicação sempre no servidor: nunca confia
    // no valor de desconto vindo do client.
    if (appliedCode && appliedCode.trim()) {
      const resolved = await resolveAppliedCode(appliedCode, subtotalCents);
      if (!resolved.valid) {
        return NextResponse.json({ error: resolved.error }, { status: 400 });
      }
      discountCents = resolved.discountCents;
      if (resolved.kind === "COUPON") {
        couponCode = resolved.code;
        appliedCouponId = resolved.couponId;
      } else {
        referralCode = resolved.code;
        appliedReferralId = resolved.referralId;
      }
    }

    const totalAfterDiscountCents = Math.max(0, subtotalCents - discountCents);

    // Crédito virtual: aplicado sobre o e-mail informado (do próprio cliente,
    // usado como identificador de saldo). Nunca confia em valor vindo do client:
    // o valor efetivamente usado é calculado no servidor a partir do saldo real.
    const creditEmail = useCredit ? (creditCustomerEmail || customerEmail) : null;

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          customerName,
          customerEmail,
          customerPhone,
          customerCpf,
          shippingAddress: JSON.stringify(shippingAddress),
          totalCents: totalAfterDiscountCents,
          discountCents,
          couponCode,
          referralCode,
          status: "PENDING",
          paymentMethod,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              variantLabel: item.variantLabel,
              quantity: item.quantity,
              unitPriceCents: item.unitPriceCents,
            })),
          },
        },
        include: { items: true },
      });

      // Crédito virtual: aplicado sobre o e-mail informado (do próprio cliente,
      // usado como identificador de saldo). Nunca confia em valor vindo do client:
      // o valor efetivamente usado é calculado no servidor a partir do saldo real.
      let creditUsedCents = 0;
      if (creditEmail) {
        creditUsedCents = await applyCreditToOrder(tx, {
          email: creditEmail,
          requestedAmountCents: totalAfterDiscountCents,
          orderId: created.id,
        });
        if (creditUsedCents > 0) {
          await tx.order.update({
            where: { id: created.id },
            data: {
              creditUsedCents,
              totalCents: Math.max(0, totalAfterDiscountCents - creditUsedCents),
            },
          });
          created.creditUsedCents = creditUsedCents;
          created.totalCents = Math.max(0, totalAfterDiscountCents - creditUsedCents);
        }
      }

      if (appliedCouponId) {
        await tx.coupon.update({
          where: { id: appliedCouponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      if (appliedReferralId) {
        const referral = await tx.referral.update({
          where: { id: appliedReferralId },
          data: { usedCount: { increment: 1 } },
        });

        // Gera automaticamente o cupom-recompensa para quem indicou.
        await tx.coupon.create({
          data: {
            code: generateRewardCouponCode(referral.referrerName),
            type: referral.rewardType,
            value: referral.rewardValue,
            active: true,
            sourceReferralId: referral.id,
            sourceOrderId: created.id,
          },
        });
      }

      return created;
    });

    return NextResponse.json(
      {
        id: order.id,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        totalCents: order.totalCents,
        discountCents: order.discountCents,
        creditUsedCents: order.creditUsedCents,
        couponCode: order.couponCode,
        referralCode: order.referralCode,
        status: order.status,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    return NextResponse.json({ error: "Erro interno ao criar pedido" }, { status: 500 });
  }
}
