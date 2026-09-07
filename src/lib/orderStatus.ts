// Status do pedido derivado do tempo (a partir da criação do pedido):
//   Aguardando pagamento → Pedido pago (aos 30 min) + e-mail "pagamento confirmado"
//   Pedido pago → Pedido enviado (após 6 h) + e-mail "pedido enviado"
// Os e-mails são disparados simultaneamente com a mudança de status no site.
// Ajuste os prazos via variáveis de ambiente (em minutos).

export type OrderStatus =
  | "WHATSAPP"
  | "AGUARDANDO_PAGAMENTO"
  | "PAGO"
  | "ENVIADO";

const AUTO_PAID_MINUTES = Number(process.env.ORDER_AUTO_PAID_MINUTES || 30);
const AUTO_SHIPPED_MINUTES = Number(process.env.ORDER_AUTO_SHIPPED_MINUTES || 360);

export function getOrderStatus(createdAt: Date | string): OrderStatus {
  const created = new Date(createdAt).getTime();
  const elapsedMs = Date.now() - created;
  if (elapsedMs >= AUTO_SHIPPED_MINUTES * 60 * 1000) return "ENVIADO";
  if (elapsedMs >= AUTO_PAID_MINUTES * 60 * 1000) return "PAGO";
  return "AGUARDANDO_PAGAMENTO";
}

const STATUS_RANK: Record<OrderStatus, number> = {
  WHATSAPP: 0,
  AGUARDANDO_PAGAMENTO: 1,
  PAGO: 2,
  ENVIADO: 3,
};

function isOrderStatus(value: unknown): value is OrderStatus {
  return (
    value === "WHATSAPP" ||
    value === "AGUARDANDO_PAGAMENTO" ||
    value === "PAGO" ||
    value === "ENVIADO"
  );
}

// Resolve o status considerando um override manual definido no painel: o
// override avança o status antes do prazo automático, mas nunca "volta"
// o status para trás depois que o tempo automático já avançou mais.
export function resolveOrderStatus(
  createdAt: Date | string,
  manualStatus?: string | null,
  paymentMethod?: string | null
): OrderStatus {
  // Pedidos Pix finalizados via WhatsApp ficam em "Finalize no Whatsapp"
  // até o admin avançar o status manualmente no painel.
  const auto =
    paymentMethod?.toUpperCase() === "PIX"
      ? "WHATSAPP"
      : getOrderStatus(createdAt);
  if (isOrderStatus(manualStatus) && STATUS_RANK[manualStatus] > STATUS_RANK[auto]) {
    return manualStatus;
  }
  return auto;
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  WHATSAPP: "Finalize no Whatsapp",
  AGUARDANDO_PAGAMENTO: "Aguardando pagamento",
  PAGO: "Pedido pago",
  ENVIADO: "Pedido enviado",
};
