import { NextRequest, NextResponse } from "next/server";
import { createSessionToken } from "@/lib/adminAuth";
import { verifyPassword } from "@/lib/adminUsers";
import { prisma } from "@/lib/prisma";
import {
  CUSTOMER_COOKIE_NAME,
  CUSTOMER_COOKIE_OPTIONS,
} from "@/lib/customerAuth";

export const dynamic = "force-dynamic";

const MAX_ATTEMPTS = 10;
const WINDOW_MS = 10 * 60 * 1000;
const attempts = new Map<string, number[]>();

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_ATTEMPTS) {
    attempts.set(ip, recent);
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." },
      { status: 429 }
    );
  }
  recent.push(now);
  attempts.set(ip, recent);

  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Informe e-mail e senha." },
      { status: 400 }
    );
  }

  const customer = await prisma.customer.findUnique({ where: { email } });
  if (!customer || !(await verifyPassword(password, customer.passwordHash))) {
    return NextResponse.json(
      { error: "E-mail ou senha inválidos." },
      { status: 401 }
    );
  }

  const token = await createSessionToken({
    adminUserId: customer.id,
    name: customer.name,
    role: "OPERADOR",
  });

  const res = NextResponse.json({ ok: true, name: customer.name });
  res.cookies.set(CUSTOMER_COOKIE_NAME, token, CUSTOMER_COOKIE_OPTIONS);
  return res;
}
