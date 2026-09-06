// Dispara os e-mails automáticos de mudança de status dos pedidos:
//   → "Pedido pago"     (sendPaidEmail,     uma vez por lead)
//   → "Pedido enviado"  (sendShippingEmail, uma vez por lead)
// Chamado quando as listas de pedidos são carregadas (site ou painel), que é
// o momento em que o status muda visivelmente. Falha no envio não bloqueia a
// resposta — as flags (paidEmailSentAt / shippingEmailSentAt) só são gravadas
// se o e-mail sair, então tentamos de novo na próxima leitura.

import { prisma } from "@/lib/prisma";
import { sendPaidEmail, sendShippingEmail } from "@/lib/resendEmail";
import { getOrderStatus } from "@/lib/orderStatus";

interface NotifiableLead {
  id: string;
  email: string;
  fullName: string;
  createdAt: Date;
  paidEmailSentAt: Date | null;
  shippingEmailSentAt: Date | null;
}

export async function notifyShippedOrders(
  leads: NotifiableLead[]
): Promise<void> {
  for (const lead of leads) {
    const status = getOrderStatus(lead.createdAt);

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

    // 2) e-mail de pedido enviado (somente quando já está em ENVIADO)
    if (status === "ENVIADO" && !lead.shippingEmailSentAt) {
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
