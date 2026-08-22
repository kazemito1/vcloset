import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, createSessionToken } from "@/lib/adminAuth";
import { findActiveAdminByEmail, verifyPassword } from "@/lib/adminUsers";
import { logActivity } from "@/lib/activityLog";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  // Caminho 1: login multiusuário (tabela AdminUser), quando email é informado.
  if (email) {
    const adminUser = await findActiveAdminByEmail(email);
    if (!adminUser || !(await verifyPassword(password, adminUser.passwordHash))) {
      return NextResponse.json({ error: "E-mail ou senha inválidos" }, { status: 401 });
    }

    const role = adminUser.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "OPERADOR";
    const token = await createSessionToken({
      adminUserId: adminUser.id,
      name: adminUser.name,
      role,
    });

    const res = NextResponse.json({ ok: true });
    setSessionCookie(res, token);

    await logActivity({
      session: { exp: 0, adminUserId: adminUser.id, name: adminUser.name, role },
      action: "LOGIN",
      description: `Login de ${adminUser.name} (${adminUser.email})`,
    });

    return res;
  }

  // Caminho 2 (compatibilidade): senha única via ADMIN_PASSWORD, sem email.
  // Migração suave: continua funcionando exatamente como antes, sempre como SUPER_ADMIN.
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD não configurado no servidor" },
      { status: 500 }
    );
  }

  if (password !== adminPassword) {
    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
  }

  const token = await createSessionToken({
    adminUserId: null,
    name: "Administrador",
    role: "SUPER_ADMIN",
  });
  const res = NextResponse.json({ ok: true });
  setSessionCookie(res, token);

  await logActivity({
    session: { exp: 0, adminUserId: null, name: "Administrador", role: "SUPER_ADMIN" },
    action: "LOGIN",
    description: "Login via senha única (ADMIN_PASSWORD)",
  });

  return res;
}

function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 60 * 60,
  });
}
