import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: Params) {
  const coupon = await prisma.coupon.findUnique({ where: { id: params.id } });
  if (!coupon) {
    return NextResponse.json({ error: "Cupom não encontrado" }, { status: 404 });
  }
  return NextResponse.json(coupon);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const body = await req.json().catch(() => ({}));
  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  const type = body.type === "FIXED" ? "FIXED" : "PERCENT";
  const value = typeof body.value === "number" ? body.value : NaN;
  const active = body.active !== false;
  const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
  const maxUses =
    typeof body.maxUses === "number" && body.maxUses > 0 ? Math.trunc(body.maxUses) : null;
  const minOrderValueCents =
    typeof body.minOrderValueCents === "number" && body.minOrderValueCents > 0
      ? Math.trunc(body.minOrderValueCents)
      : null;

  if (!code || isNaN(value) || value <= 0) {
    return NextResponse.json({ error: "Código e valor são obrigatórios" }, { status: 400 });
  }

  if (type === "PERCENT" && value > 100) {
    return NextResponse.json({ error: "Percentual não pode ser maior que 100" }, { status: 400 });
  }

  try {
    const coupon = await prisma.coupon.update({
      where: { id: params.id },
      data: { code, type, value, active, expiresAt, maxUses, minOrderValueCents },
    });
    return NextResponse.json(coupon);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar cupom" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await prisma.coupon.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro ao excluir cupom" }, { status: 400 });
  }
}
