import { NextRequest, NextResponse } from "next/server";
import { createSessionToken } from "@/lib/adminAuth";
import { hashPassword } from "@/lib/adminUsers";
import { prisma } from "@/lib/prisma";
import {
  CUSTOMER_COOKIE_NAME,
  CUSTOMER_COOKIE_OPTIONS,
} from "@/lib/customerAuth";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (name.length < 3 || !name.includes(" ")) {
    return NextResponse.json(
      { error: "Informe seu nome e sobrenome." },
      { status: 400 }
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "A senha deve ter pelo menos 6 caracteres." },
      { status: 400 }
    );
  }

  const existing = await prisma.customer.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Já existe uma conta com este e-mail. Faça login." },
      { status: 409 }
    );
  }

  const customer = await prisma.customer.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
    },
  });

  const token = await createSessionToken({
    adminUserId: customer.id,
    name: customer.name,
    role: "OPERADOR",
  });

  const res = NextResponse.json({ ok: true, name: customer.name });
  res.cookies.set(CUSTOMER_COOKIE_NAME, token, CUSTOMER_COOKIE_OPTIONS);
  return res;
}
