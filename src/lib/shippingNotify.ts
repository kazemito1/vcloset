// Dispara os e-mails automáticos de mudança de status dos pedidos, sempre
// sincronizados com o status exibido no site:
//   → "Pedido pago"     (sendPaidEmail,     uma vez por lead, 30 min após o pedido)
//   → "Pedido enviado"  (sendShippingEmail, uma vez por lead, 6 h após o pedido)
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
  paymentMethod?: string | null;
  paidEmailSentAt: Date | null;
  shippingEmailSentAt: Date | null;
}

export async function notifyShippedOrders(
  leads: NotifiableLead[]
): Promise<void> {
  for (const lead of leads) {
    const status = resolveOrderStatus(
      lead.createdAt,
      lead.manualStatus,
      lead.paymentMethod
    );

    if (status !== "PAGO" && status !== "ENVIADO") continue;

    // 1) e-mail de pagamento confirmado (30 min após o pedido, junto com o status)
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

    // 2) e-mail de pedido enviado (6 h após o pedido, junto com o status)
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
