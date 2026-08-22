import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateReferralCode } from "@/lib/coupons";

export async function GET() {
  const referrals = await prisma.referral.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Para cada indicação, busca o(s) cupom(ns) de recompensa já gerados
  // (permite ao lojista ver/copiar o cupom para repassar ao indicador).
  const rewards = await prisma.coupon.findMany({
    where: { sourceReferralId: { in: referrals.map((r) => r.id) } },
    orderBy: { createdAt: "desc" },
  });

  const data = referrals.map((r) => ({
    ...r,
    rewardCoupons: rewards.filter((c) => c.sourceReferralId === r.id),
  }));

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const referrerName = typeof body.referrerName === "string" ? body.referrerName.trim() : "";
  const referrerEmail = typeof body.referrerEmail === "string" ? body.referrerEmail.trim() : "";
  const active = body.active !== false;
  const referredDiscountType = body.referredDiscountType === "FIXED" ? "FIXED" : "PERCENT";
  const referredDiscountValue =
    typeof body.referredDiscountValue === "number" ? body.referredDiscountValue : 10;
  const rewardType = body.rewardType === "PERCENT" ? "PERCENT" : "FIXED";
  const rewardValue = typeof body.rewardValue === "number" ? body.rewardValue : 2000;
  const customCode =
    typeof body.code === "string" && body.code.trim() ? body.code.trim().toUpperCase() : "";

  if (!referrerName || !referrerEmail) {
    return NextResponse.json(
      { error: "Nome e e-mail do indicador são obrigatórios" },
      { status: 400 }
    );
  }

  const code = customCode || generateReferralCode(referrerName);

  try {
    const referral = await prisma.referral.create({
      data: {
        code,
        referrerName,
        referrerEmail,
        active,
        referredDiscountType,
        referredDiscountValue,
        rewardType,
        rewardValue,
      },
    });
    return NextResponse.json(referral, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Já existe uma indicação com esse código" }, { status: 409 });
  }
}
