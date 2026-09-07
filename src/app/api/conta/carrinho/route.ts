import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customerAuth";

export const dynamic = "force-dynamic";

// Carrinho salvo na conta do cliente: permite recuperar a sacola em outro
// dispositivo/navegador e depois de fechar o site.

export async function GET(req: NextRequest) {
  const session = await getCustomerSession(req);
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const customer = await prisma.customer.findUnique({
    where: { id: session.customerId },
    select: { cartJson: true },
  });

  if (!customer) {
    return NextResponse.json({ error: "Conta não encontrada." }, { status: 404 });
  }

  let cart: { items: unknown[]; appliedCode: unknown } = {
    items: [],
    appliedCode: null,
  };
  if (customer.cartJson) {
    try {
      const parsed = JSON.parse(customer.cartJson);
      if (Array.isArray(parsed.items)) {
        cart = { items: parsed.items, appliedCode: parsed.appliedCode ?? null };
      }
    } catch {
      // JSON corrompido: retorna carrinho vazio
    }
  }

  return NextResponse.json({ cart });
}

export async function PUT(req: NextRequest) {
  const session = await getCustomerSession(req);
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || !Array.isArray(body.items)) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  // Limite de segurança: no máximo 50 linhas de carrinho
  const items = body.items.slice(0, 50);

  await prisma.customer.update({
    where: { id: session.customerId },
    data: {
      cartJson: JSON.stringify({ items, appliedCode: body.appliedCode ?? null }),
    },
  });

  return NextResponse.json({ ok: true });
}
