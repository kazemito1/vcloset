// Status do pedido derivado do tempo:
//   Aguardando pagamento → Pedido pago (após ORDER_AUTO_PAID_MINUTES, padrão 30 min)
//   Pedido pago → Pedido enviado (após ORDER_AUTO_SHIPPED_MINUTES, padrão 6 h)
// Ajuste os prazos via variáveis de ambiente (em minutos).

export type OrderStatus = "AGUARDANDO_PAGAMENTO" | "PAGO" | "ENVIADO";

const AUTO_PAID_MINUTES = Number(process.env.ORDER_AUTO_PAID_MINUTES || 30);
const AUTO_SHIPPED_MINUTES = Number(process.env.ORDER_AUTO_SHIPPED_MINUTES || 360);

export function getOrderStatus(createdAt: Date | string): OrderStatus {
  const created = new Date(createdAt).getTime();
  const elapsedMs = Date.now() - created;
  if (elapsedMs >= AUTO_SHIPPED_MINUTES * 60 * 1000) return "ENVIADO";
  if (elapsedMs >= AUTO_PAID_MINUTES * 60 * 1000) return "PAGO";
  return "AGUARDANDO_PAGAMENTO";
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  AGUARDANDO_PAGAMENTO: "Aguardando pagamento",
  PAGO: "Pedido pago",
  ENVIADO: "Pedido enviado",
};
