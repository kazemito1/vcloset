import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE_NAME, getSessionFromToken } from "@/lib/adminAuth";
import { logActivity } from "@/lib/activityLog";

interface Params {
  params: { id: string };
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const existing = await prisma.expense.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Despesa não encontrada" }, { status: 404 });
  }

  try {
    await prisma.expense.delete({ where: { id: params.id } });

    const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const session = await getSessionFromToken(token);
    await logActivity({
      session,
      action: "DESPESA_EXCLUIDA",
      entityType: "Expense",
      entityId: params.id,
      description: `Despesa excluída: ${existing.description}`,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro ao excluir despesa" }, { status: 400 });
  }
}
