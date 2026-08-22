import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: Params) {
  const referral = await prisma.referral.findUnique({ where: { id: params.id } });
  if (!referral) {
    return NextResponse.json({ error: "Indicação não encontrada" }, { status: 404 });
  }
  return NextResponse.json(referral);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const body = await req.json().catch(() => ({}));
  const referrerName = typeof body.referrerName === "string" ? body.referrerName.trim() : "";
  const referrerEmail = typeof body.referrerEmail === "string" ? body.referrerEmail.trim() : "";
  const active = body.active !== false;
  const referredDiscountType = body.referredDiscountType === "FIXED" ? "FIXED" : "PERCENT";
  const referredDiscountValue =
    typeof body.referredDiscountValue === "number" ? body.referredDiscountValue : 10;
  const rewardType = body.rewardType === "PERCENT" ? "PERCENT" : "FIXED";
  const rewardValue = typeof body.rewardValue === "number" ? body.rewardValue : 2000;

  if (!referrerName || !referrerEmail) {
    return NextResponse.json(
      { error: "Nome e e-mail do indicador são obrigatórios" },
      { status: 400 }
    );
  }

  try {
    const referral = await prisma.referral.update({
      where: { id: params.id },
      data: {
        referrerName,
        referrerEmail,
        active,
        referredDiscountType,
        referredDiscountValue,
        rewardType,
        rewardValue,
      },
    });
    return NextResponse.json(referral);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar indicação" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await prisma.referral.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro ao excluir indicação" }, { status: 400 });
  }
}
