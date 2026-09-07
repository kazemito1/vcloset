// Dispara os e-mails automáticos de mudança de status dos pedidos:
//   → "Pedido pago"     (sendPaidEmail,     uma vez por lead)
//   → "Pedido enviado"  (sendShippingEmail, uma vez por lead, 6h após o e-mail de pagamento confirmado)
// Chamado quando as listas de pedidos são carregadas (site ou painel), que é
// o momento em que o status muda visivelmente. Falha no envio não bloqueia a
// resposta — as flags (paidEmailSentAt / shippingEmailSentAt) só são gravadas
// se o e-mail sair, então tentamos de novo na próxima leitura.

import { prisma } from "@/lib/prisma";
import { sendPaidEmail, sendShippingEmail } from "@/lib/resendEmail";
import { resolveOrderStatus } from "@/lib/orderStatus";

interface NotifiableLead {
  id: string;
  email: string;
  fullName: string;
  createdAt: Date;
  manualStatus?: string | null;
  paidEmailSentAt: Date | null;
  shippingEmailSentAt: Date | null;
}

const AUTO_SHIPPED_MINUTES = Number(process.env.ORDER_AUTO_SHIPPED_MINUTES || 360);

export async function notifyShippedOrders(
  leads: NotifiableLead[]
): Promise<void> {
  for (const lead of leads) {
    const status = resolveOrderStatus(lead.createdAt, lead.manualStatus);

    if (status !== "PAGO" && status !== "ENVIADO") continue;

    // 1) e-mail de pagamento confirmado
    if (!lead.paidEmailSentAt) {
      try {
        const result = await sendPaidEmail(lead.email, lead.fullName);
        if (result.sent) {
          await prisma.lead.update({
            where: { id: lead.id },
            data: { paidEmailSentAt: new Date() },
          });
        }
      } catch (err) {
        console.error("[status-notify] falha ao notificar pago:", lead.id, err);
      }
    }

    // 2) e-mail de pedido enviado (6h após o e-mail de pagamento confirmado)
    if (status === "ENVIADO" && !lead.shippingEmailSentAt && lead.paidEmailSentAt) {
      const paidAt = new Date(lead.paidEmailSentAt).getTime();
      const elapsedMs = Date.now() - paidAt;
      if (elapsedMs >= AUTO_SHIPPED_MINUTES * 60 * 1000) {
        try {
          const result = await sendShippingEmail(lead.email, lead.fullName);
          if (result.sent) {
            await prisma.lead.update({
              where: { id: lead.id },
              data: { shippingEmailSentAt: new Date() },
            });
          }
        } catch (err) {
          console.error("[status-notify] falha ao notificar envio:", lead.id, err);
        }
      }
    }
  }
}
