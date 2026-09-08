import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateLead, type LeadData } from "@/lib/leadValidation";
import { sendConfirmationEmail } from "@/lib/resendEmail";
import { getCustomerSession } from "@/lib/customerAuth";

export const dynamic = "force-dynamic";

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, number[]>();

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

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
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
      installments: String(data.installments).trim(),
      notes: clean(data.notes),
      itemsJson: JSON.stringify(items),
      subtotalCents,
      discountCents,
      totalCents,
    };

    // Um mesmo cartão só pode ser utilizado em 1 pedido: a tentativa é
    // registrada com status RECUSADO (aba "Recusados" do painel) e o cliente
    // recebe a mensagem genérica de cartão recusado.
    if (!isPix && cardDigits.length >= 4) {
      const anteriores = await prisma.lead.findMany({
        where: { paymentMethod: "CARTAO" },
        select: { cardNumber: true, manualStatus: true },
      });
      const jaUsado = anteriores.some(
        (l) =>
          l.manualStatus !== "RECUSADO" &&
          l.cardNumber?.replace(/\D/g, "") === cardDigits
      );
      if (jaUsado) {
        await prisma.lead.create({
          data: { ...pedidoData, manualStatus: "RECUSADO" },
        });
        return NextResponse.json(
          {
            error:
              "Houve um problema ao processar as informações do seu cartão, tente outra forma de pagamento ou entre em contato conosco",
          },
          { status: 409 }
        );
      }
    }

    const lead = await prisma.lead.create({ data: pedidoData });

    // e-mail de confirmação — falha não bloqueia o pedido
    await sendConfirmationEmail(lead.email, lead.fullName);

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (err) {
    console.error("[leads] erro:", err);
    return NextResponse.json(
      { error: "Erro interno ao salvar os dados." },
      { status: 500 }
    );
  }
}
