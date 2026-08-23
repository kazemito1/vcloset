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

export async function notifyNewOrder(order: {
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
}): Promise<void> {
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

  await sendTelegramMessage(lines.join("\n"));
}

function formatVisitTime(date: Date = new Date()): string {
  return date.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

function parseUserAgent(ua: string) {
  const source = (ua || "").toLowerCase();

  const isTablet =
    /ipad|tablet|kindle|silk/.test(source) ||
    (source.includes("android") && !source.includes("mobi"));
  const isMobile = /mobi|android|iphone|ipod/.test(source);
  const device = isTablet ? "Tablet" : isMobile ? "Celular" : "Desktop";

  let browser = "Navegador";
  if (/edg\//.test(source)) browser = "Edge";
  else if (/opr\//.test(source) || source.includes("opera")) browser = "Opera";
  else if (/crios/.test(source) || /chrome/.test(source)) browser = "Chrome";
  else if (/firefox|fxios/.test(source)) browser = "Firefox";
  else if (/safari/.test(source)) browser = "Safari";
  else if (/msie|trident/.test(source)) browser = "Internet Explorer";

  let os = "Sistema";
  if (/windows/.test(source)) os = "Windows";
  else if (/android/.test(source)) os = "Android";
  else if (/iphone|ipad|ipod/.test(source)) os = "iOS";
  else if (/mac os x|macintosh/.test(source)) os = "macOS";
  else if (/linux/.test(source)) os = "Linux";

  return { device, browser, os };
}

export async function notifyNewVisit(info: {
  path: string;
  referer: string;
  userAgent: string;
  lang: string;
  timezone: string;
  screen: string;
  first: boolean;
}): Promise<void> {
  const { device, browser, os } = parseUserAgent(info.userAgent);

  const lines = [
    info.first ? "👀 <b>Novo acesso ao site</b>" : "🔍 <b>Navegação no site</b>",
    "",
    `<b>Horário:</b> ${formatVisitTime()}`,
    `<b>Página:</b> ${escapeHtml(info.path || "/")}`,
    `<b>Origem:</b> ${escapeHtml(info.referer || "direta")}`,
    `<b>Dispositivo:</b> ${escapeHtml(device)}`,
    `<b>Navegador:</b> ${escapeHtml(browser)}`,
    `<b>Sistema:</b> ${escapeHtml(os)}`,
  ];

  if (info.screen) lines.push(`<b>Tela:</b> ${escapeHtml(info.screen)}`);
  if (info.lang) lines.push(`<b>Idioma:</b> ${escapeHtml(info.lang)}`);
  if (info.timezone) lines.push(`<b>Fuso:</b> ${escapeHtml(info.timezone)}`);

  await sendTelegramMessage(lines.join("\n"));
}
