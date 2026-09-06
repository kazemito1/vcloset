// Status do pedido derivado do tempo: "Aguardando pagamento" vira "Pedido pago"
// automaticamente após o prazo configurado (padrão: 3 minutos).
// Ajuste via variável de ambiente ORDER_AUTO_PAID_MINUTES (em minutos).

export type OrderStatus = "AGUARDANDO_PAGAMENTO" | "PAGO";

const AUTO_PAID_MINUTES = Number(process.env.ORDER_AUTO_PAID_MINUTES || 3);

export function getOrderStatus(createdAt: Date | string): OrderStatus {
  const created = new Date(createdAt).getTime();
  const elapsedMs = Date.now() - created;
  return elapsedMs >= AUTO_PAID_MINUTES * 60 * 1000 ? "PAGO" : "AGUARDANDO_PAGAMENTO";
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  AGUARDANDO_PAGAMENTO: "Aguardando pagamento",
  PAGO: "Pedido pago",
};
