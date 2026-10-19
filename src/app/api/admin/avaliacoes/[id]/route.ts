import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

// Painel: aprova/desaprova (PUT) ou exclui (DELETE) uma avaliação.
export async function PUT(req: NextRequest, { params }: Params) {
  const body = await req.json().catch(() => ({}));
  const approved = body.approved === true;

  try {
    await prisma.review.update({
      where: { id: params.id },
      data: { approved },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Avaliação não encontrada" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await prisma.review.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Avaliação não encontrada" }, { status: 404 });
  }
}
