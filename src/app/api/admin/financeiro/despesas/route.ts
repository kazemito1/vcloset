import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE_NAME, getSessionFromToken } from "@/lib/adminAuth";
import { logActivity } from "@/lib/activityLog";

export async function GET() {
  const expenses = await prisma.expense.findMany({
    orderBy: { date: "desc" },
  });
  return NextResponse.json(expenses);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const amountCents = Number(body.amountCents);
  const category = typeof body.category === "string" ? body.category.trim() : "";
  const date = body.date ? new Date(body.date) : null;

  if (!description || !category) {
    return NextResponse.json(
      { error: "Descrição e categoria são obrigatórias" },
      { status: 400 }
    );
  }

  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    return NextResponse.json({ error: "Valor da despesa inválido" }, { status: 400 });
  }

  if (!date || isNaN(date.getTime())) {
    return NextResponse.json({ error: "Data inválida" }, { status: 400 });
  }

  const expense = await prisma.expense.create({
    data: { description, amountCents: Math.round(amountCents), category, date },
  });

  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = await getSessionFromToken(token);
  await logActivity({
    session,
    action: "DESPESA_CRIADA",
    entityType: "Expense",
    entityId: expense.id,
    description: `Despesa cadastrada: ${expense.description} (${category})`,
  });

  return NextResponse.json(expense, { status: 201 });
}
