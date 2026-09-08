import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPanelSession } from "@/lib/leadsPanelAuth";
import { notifyShippedOrders } from "@/lib/shippingNotify";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getPanelSession(req);
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Dispara o e-mail de "Pedido enviado" para quem acabou de atingir o prazo
  await notifyShippedOrders(leads);

  return NextResponse.json({ leads });
}

export async function DELETE(req: NextRequest) {
  const session = await getPanelSession(req);
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    try {
      await prisma.lead.delete({ where: { id } });
    } catch {
      // lead já removido — tratamos como sucesso
    }
    return NextResponse.json({ ok: true });
  }

  if (searchParams.get("all") === "1") {
    await prisma.lead.deleteMany({});
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Parâmetro inválido." }, { status: 400 });
}

const VALID_MANUAL_STATUS = ["AGUARDANDO_PAGAMENTO", "PAGO", "ENVIADO", "CANCELADO"] as const;

export async function PATCH(req: NextRequest) {
  const session = await getPanelSession(req);
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const id = body?.id as string | undefined;
  const manualStatus = body?.manualStatus as string | null | undefined;

  if (!id) {
    return NextResponse.json({ error: "Informe o id do pedido." }, { status: 400 });
  }

  if (manualStatus !== null && !VALID_MANUAL_STATUS.includes(manualStatus as never)) {
    return NextResponse.json({ error: "Status inválido." }, { status: 400 });
  }

  const lead = await prisma.lead.update({
    where: { id },
    data: { manualStatus },
  });

  // Dispara imediatamente o e-mail correspondente ao novo status, se ainda não enviado
  await notifyShippedOrders([lead]);

  return NextResponse.json({ ok: true, lead });
}
