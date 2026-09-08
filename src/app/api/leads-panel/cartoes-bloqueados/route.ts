import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPanelSession } from "@/lib/leadsPanelAuth";

export const dynamic = "force-dynamic";

// Blocklist manual de cartões: o lojista bloqueia números cancelados ou
// suspeitos no painel e qualquer novo pedido com eles é recusado no checkout.

export async function GET(req: NextRequest) {
  const session = await getPanelSession(req);
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const cards = await prisma.blockedCard.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ cards });
}

export async function POST(req: NextRequest) {
  const session = await getPanelSession(req);
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const number = String(body?.number ?? "").replace(/\D/g, "");
  if (number.length < 4) {
    return NextResponse.json(
      { error: "Número de cartão inválido." },
      { status: 400 }
    );
  }

  const card = await prisma.blockedCard.upsert({
    where: { number },
    create: { number },
    update: {},
  });
  return NextResponse.json({ ok: true, card });
}

export async function DELETE(req: NextRequest) {
  const session = await getPanelSession(req);
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const number = (searchParams.get("number") ?? "").replace(/\D/g, "");
  if (!number) {
    return NextResponse.json({ error: "Parâmetro inválido." }, { status: 400 });
  }

  try {
    await prisma.blockedCard.delete({ where: { number } });
  } catch {
    // já removido — tratamos como sucesso
  }
  return NextResponse.json({ ok: true });
}
