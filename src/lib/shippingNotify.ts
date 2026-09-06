// Dispara o e-mail de "Pedido enviado" para leads que acabaram de atingir
// o status ENVIADO e ainda não foram notificados (flag shippingEmailSentAt).
// Chamado quando as listas de pedidos são carregadas (site ou painel), que é
// o momento em que o status muda visivelmente. Falha no envio não bloqueia a
// resposta — a flag só é gravada se o e-mail sair, então tentamos de novo na
// próxima leitura.

import { prisma } from "@/lib/prisma";
import { sendShippingEmail } from "@/lib/resendEmail";
import { getOrderStatus } from "@/lib/orderStatus";

interface NotifiableLead {
  id: string;
  email: string;
  fullName: string;
  createdAt: Date;
  shippingEmailSentAt: Date | null;
}

export async function notifyShippedOrders(
  leads: NotifiableLead[]
): Promise<void> {
  for (const lead of leads) {
    if (lead.shippingEmailSentAt) continue;
    if (getOrderStatus(lead.createdAt) !== "ENVIADO") continue;

    try {
      const result = await sendShippingEmail(lead.email, lead.fullName);
      if (result.sent) {
        await prisma.lead.update({
          where: { id: lead.id },
          data: { shippingEmailSentAt: new Date() },
        });
      }
    } catch (err) {
      console.error("[shipping-notify] falha ao notificar lead:", lead.id, err);
    }
  }
}
