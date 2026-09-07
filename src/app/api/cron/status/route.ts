import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyShippedOrders } from "@/lib/shippingNotify";

export const dynamic = "force-dynamic";

// Endpoint chamado periodicamente pelo GitHub Actions (.github/workflows/cron-pedidos.yml,
// a cada 15 minutos) para disparar os e-mails automáticos de "Pagamento confirmado" e
// "Pedido enviado" sem depender de o cliente visitar a página de pedidos.
export async function GET(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET;
  const auth = req.headers.get("authorization");

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Só interessam leads que ainda não completaram o ciclo de e-mails
  // (falta pelo menos o de envio). Uma vez enviados os dois, o lead nunca
  // mais precisa ser revisitado por este job.
  const leads = await prisma.lead.findMany({
    where: { shippingEmailSentAt: null },
    orderBy: { createdAt: "asc" },
    take: 500,
  });

  await notifyShippedOrders(leads);

  return NextResponse.json({ ok: true, checked: leads.length });
}
