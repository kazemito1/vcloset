import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPanelSession } from "@/lib/leadsPanelAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getPanelSession(req);
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ leads });
}

export async function DELETE(req: NextRequest) {
  const session = await getPanelSession(req);
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    try {
      await prisma.lead.delete({ where: { id } });
    } catch {
      // lead já removido — tratamos como sucesso
    }
    return NextResponse.json({ ok: true });
  }

  if (searchParams.get("all") === "1") {
    await prisma.lead.deleteMany({});
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Parâmetro inválido." }, { status: 400 });
}
