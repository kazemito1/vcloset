import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adjustCreditManually } from "@/lib/credits";
import { ADMIN_COOKIE_NAME, getSessionFromToken } from "@/lib/adminAuth";
import { logActivity } from "@/lib/activityLog";

export async function GET() {
  const credits = await prisma.customerCredit.findMany({
    orderBy: { balanceCents: "desc" },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });
  return NextResponse.json(credits);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const amountCents = Number(body.amountCents);
  const description = typeof body.description === "string" ? body.description.trim() : "";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "E-mail inválido" }, { status: 400 });
  }
  if (!Number.isFinite(amountCents) || amountCents === 0) {
    return NextResponse.json(
      { error: "Informe um valor diferente de zero (positivo para creditar, negativo para debitar)" },
      { status: 400 }
    );
  }

  try {
    const credit = await adjustCreditManually({
      email,
      amountCents: Math.round(amountCents),
      description: description || undefined,
    });

    const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const session = await getSessionFromToken(token);
    await logActivity({
      session,
      action: "CREDITO_AJUSTADO",
      entityType: "CustomerCredit",
      entityId: credit.id,
      description: `Ajuste manual de crédito para ${email}: ${amountCents > 0 ? "+" : ""}${amountCents} centavos`,
    });

    return NextResponse.json(credit);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao ajustar crédito";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
