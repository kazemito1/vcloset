import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type TxClient = Prisma.TransactionClient | PrismaClient;

/**
 * Retorna o saldo de crédito virtual do cliente pelo e-mail (case-insensitive).
 * Se não houver registro, o saldo é 0 (nenhuma linha é criada até o primeiro crédito).
 */
export async function getCreditBalance(email: string): Promise<number> {
  const normalized = email.trim().toLowerCase();
  const credit = await prisma.customerCredit.findUnique({
    where: { customerEmail: normalized },
  });
  return credit?.balanceCents ?? 0;
}

async function getOrCreateCredit(tx: TxClient, email: string) {
  const normalized = email.trim().toLowerCase();
  const existing = await tx.customerCredit.findUnique({ where: { customerEmail: normalized } });
  if (existing) return existing;
  return tx.customerCredit.create({ data: { customerEmail: normalized, balanceCents: 0 } });
}

/**
 * Concede o crédito de indicação ao indicador (referrerEmail) quando um pedido
 * feito com o código dele é confirmado (PAID). Idempotente: o chamador deve
 * garantir que `Order.referralCreditGranted` ainda seja false antes de chamar,
 * e marcar como true dentro da mesma transação.
 */
export async function grantReferralCredit(
  tx: TxClient,
  params: { referrerEmail: string; amountCents: number; orderId: string }
) {
  const { referrerEmail, amountCents, orderId } = params;
  if (amountCents <= 0) return;

  const credit = await getOrCreateCredit(tx, referrerEmail);
  await tx.customerCredit.update({
    where: { id: credit.id },
    data: { balanceCents: { increment: amountCents } },
  });
  await tx.creditTransaction.create({
    data: {
      creditId: credit.id,
      type: "GANHO_POR_INDICACAO",
      amountCents,
      orderId,
      description: `Crédito por indicação confirmada (pedido ${orderId})`,
    },
  });
}

/**
 * Processa a confirmação de pagamento de um pedido: se o pedido tiver um código
 * de indicação aplicado e o crédito ainda não tiver sido concedido, credita o
 * indicador com o valor configurado em StoreSettings.referralCreditCents.
 * Idempotente via campo Order.referralCreditGranted.
 */
export async function processReferralCreditOnOrderPaid(orderId: string) {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order || !order.referralCode || order.referralCreditGranted) return;

    const referral = await tx.referral.findUnique({ where: { code: order.referralCode } });
    if (!referral) return;

    const settings = await tx.storeSettings.findUnique({ where: { id: "default" } });
    const amountCents = settings?.referralCreditCents ?? 1000;

    await grantReferralCredit(tx, {
      referrerEmail: referral.referrerEmail,
      amountCents,
      orderId,
    });

    await tx.order.update({
      where: { id: orderId },
      data: { referralCreditGranted: true },
    });
  });
}

/**
 * Usa crédito virtual do cliente como desconto em uma compra. Retorna o valor
 * efetivamente usado (limitado ao saldo disponível e ao valor solicitado).
 */
export async function applyCreditToOrder(
  tx: TxClient,
  params: { email: string; requestedAmountCents: number; orderId: string }
): Promise<number> {
  const { email, requestedAmountCents, orderId } = params;
  if (requestedAmountCents <= 0) return 0;

  const credit = await getOrCreateCredit(tx, email);
  const amountToUse = Math.min(credit.balanceCents, requestedAmountCents);
  if (amountToUse <= 0) return 0;

  await tx.customerCredit.update({
    where: { id: credit.id },
    data: { balanceCents: { decrement: amountToUse } },
  });
  await tx.creditTransaction.create({
    data: {
      creditId: credit.id,
      type: "USADO_EM_COMPRA",
      amountCents: -amountToUse,
      orderId,
      description: `Crédito usado no pedido ${orderId}`,
    },
  });

  return amountToUse;
}

/**
 * Ajuste manual de crédito feito pelo admin (SUPER_ADMIN). amountCents pode ser
 * positivo (adicionar crédito) ou negativo (remover crédito).
 */
export async function adjustCreditManually(params: {
  email: string;
  amountCents: number;
  description?: string;
}) {
  const { email, amountCents, description } = params;
  return prisma.$transaction(async (tx) => {
    const credit = await getOrCreateCredit(tx, email);
    const newBalance = credit.balanceCents + amountCents;
    if (newBalance < 0) {
      throw new Error("Saldo insuficiente para o ajuste solicitado");
    }
    const updated = await tx.customerCredit.update({
      where: { id: credit.id },
      data: { balanceCents: newBalance },
    });
    await tx.creditTransaction.create({
      data: {
        creditId: credit.id,
        type: "AJUSTE_MANUAL",
        amountCents,
        description: description || "Ajuste manual pelo admin",
      },
    });
    return updated;
  });
}
