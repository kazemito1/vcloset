const TELEGRAM_API = "https://api.telegram.org";

function getTelegramConfig() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return null;
  return { token, chatId };
}

export async function sendTelegramMessage(text: string): Promise<boolean> {
  try {
    const config = getTelegramConfig();
    if (!config) return false;

    const url = `${TELEGRAM_API}/bot${config.token}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: config.chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.error("Telegram notification failed:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error("Telegram notification error:", error);
    return false;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function notifyNewOrder(order: {
  id: string;
  customerName: string;
  customerEmail: string;
  totalCents: number;
  paymentMethod: string;
  items: {
    productName: string;
    variantLabel?: string | null;
    quantity: number;
    unitPriceCents: number;
  }[];
}): void {
  const paymentLabel =
    order.paymentMethod === "CREDIT_CARD" ? "Cartão de crédito" : order.paymentMethod;

  const lines = [
    "🛍️ <b>Novo pedido criado</b>",
    "",
    `<b>Pedido:</b> ${escapeHtml(order.id)}`,
    `<b>Cliente:</b> ${escapeHtml(order.customerName)}`,
    `<b>E-mail:</b> ${escapeHtml(order.customerEmail)}`,
    `<b>Pagamento:</b> ${escapeHtml(paymentLabel)}`,
    `<b>Total:</b> ${formatCents(order.totalCents)}`,
    "",
    "<b>Itens</b>",
    ...order.items.map((item) => {
      const label = item.variantLabel ? ` (${item.variantLabel})` : "";
      return `• ${item.quantity}x ${escapeHtml(item.productName)}${escapeHtml(label)} — ${formatCents(item.unitPriceCents * item.quantity)}`;
    }),
  ];

  sendTelegramMessage(lines.join("\n"));
}

export function notifyNewVisit(info: { path: string; referer: string }): void {
  const lines = [
    "👀 <b>Novo acesso ao site</b>",
    "",
    `<b>Página:</b> ${escapeHtml(info.path || "/")}`,
    `<b>Origem:</b> ${escapeHtml(info.referer || "direta")}`,
  ];

  sendTelegramMessage(lines.join("\n"));
}
