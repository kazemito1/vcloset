import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE_NAME, getSessionFromToken } from "@/lib/adminAuth";
import { logActivity } from "@/lib/activityLog";

// Atualiza diretamente a quantidade em estoque de uma variante de produto.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  const stock = Number(body.stock);

  if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) {
    return NextResponse.json({ error: "Quantidade de estoque inválida" }, { status: 400 });
  }

  const variant = await prisma.productVariant.findUnique({
    where: { id: params.id },
    include: { product: true },
  });

  if (!variant) {
    return NextResponse.json({ error: "Variante não encontrada" }, { status: 404 });
  }

  const updated = await prisma.productVariant.update({
    where: { id: params.id },
    data: { stock },
  });

  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = await getSessionFromToken(token);
  await logActivity({
    session,
    action: "ESTOQUE_ATUALIZADO",
    entityType: "ProductVariant",
    entityId: variant.id,
    description: `Estoque de "${variant.product.name} (${variant.label})" alterado para ${stock}`,
  });

  return NextResponse.json(updated);
}
