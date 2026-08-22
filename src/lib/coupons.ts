// V.CLOSET - Resolução de cupons e códigos de indicação (Indique e Ganhe).
// Usado tanto pela API pública de validação (/api/cupons/validar) quanto pela
// criação de pedidos (/api/orders), para garantir que o desconto é sempre
// revalidado no servidor (nunca confiar apenas no que o cliente enviou).
import { prisma } from "@/lib/prisma";

export type ResolvedCode =
  | { valid: true; kind: "COUPON"; code: string; discountCents: number; couponId: string }
  | { valid: true; kind: "REFERRAL"; code: string; discountCents: number; referralId: string }
  | { valid: false; error: string };

function calcDiscount(type: string, value: number, subtotalCents: number): number {
  if (type === "PERCENT") {
    return Math.round((subtotalCents * value) / 100);
  }
  // FIXED: valor em centavos, nunca desconta mais que o subtotal
  return Math.min(value, subtotalCents);
}

export async function resolveAppliedCode(
  rawCode: string,
  subtotalCents: number
): Promise<ResolvedCode> {
  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return { valid: false, error: "Informe um código" };
  }

  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (coupon) {
    if (!coupon.active) {
      return { valid: false, error: "Este cupom não está mais ativo" };
    }
    if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
      return { valid: false, error: "Este cupom expirou" };
    }
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return { valid: false, error: "Este cupom atingiu o limite de usos" };
    }
    if (coupon.minOrderValueCents && subtotalCents < coupon.minOrderValueCents) {
      const minReais = (coupon.minOrderValueCents / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
      return { valid: false, error: `Pedido mínimo de ${minReais} para usar este cupom` };
    }

    const discountCents = calcDiscount(coupon.type, coupon.value, subtotalCents);
    return { valid: true, kind: "COUPON", code, discountCents, couponId: coupon.id };
  }

  const referral = await prisma.referral.findUnique({ where: { code } });
  if (referral) {
    if (!referral.active) {
      return { valid: false, error: "Este código de indicação não está mais ativo" };
    }
    const discountCents = calcDiscount(
      referral.referredDiscountType,
      referral.referredDiscountValue,
      subtotalCents
    );
    return { valid: true, kind: "REFERRAL", code, discountCents, referralId: referral.id };
  }

  return { valid: false, error: "Código inválido ou inexistente" };
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

export function generateReferralCode(referrerName: string): string {
  const base = referrerName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 8) || "AMIGO";
  return `${base}-${randomSuffix()}`;
}

export function generateRewardCouponCode(referrerName: string): string {
  const base = referrerName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 8) || "RECOMPENSA";
  return `GANHOU-${base}-${randomSuffix()}`;
}
