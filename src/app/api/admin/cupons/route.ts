import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(coupons);
}

export async function POST(req: NextRequest) {
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
    const coupon = await prisma.coupon.create({
      data: { code, type, value, active, expiresAt, maxUses, minOrderValueCents },
    });
    return NextResponse.json(coupon, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Já existe um cupom com esse código" }, { status: 409 });
  }
}
