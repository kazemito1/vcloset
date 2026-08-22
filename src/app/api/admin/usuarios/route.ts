import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, isValidRole } from "@/lib/adminUsers";
import { ADMIN_COOKIE_NAME, getSessionFromToken } from "@/lib/adminAuth";
import { logActivity } from "@/lib/activityLog";

export async function GET() {
  const users = await prisma.adminUser.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true,
    },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  let role = isValidRole(body.role) ? body.role : "OPERADOR";
  const active = body.active !== false;

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Nome, e-mail e senha são obrigatórios" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "A senha deve ter pelo menos 6 caracteres" },
      { status: 400 }
    );
  }

  // Bootstrap: o primeiro usuário cadastrado (migrando da senha única ADMIN_PASSWORD)
  // vira SUPER_ADMIN automaticamente, independente do que foi selecionado no formulário.
  const existingUsersCount = await prisma.adminUser.count();
  if (existingUsersCount === 0) {
    role = "SUPER_ADMIN";
  }

  try {
    const passwordHash = await hashPassword(password);
    const user = await prisma.adminUser.create({
      data: { name, email, passwordHash, role, active: existingUsersCount === 0 ? true : active },
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    });

    const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const session = await getSessionFromToken(token);
    await logActivity({
      session,
      action: "USUARIO_CRIADO",
      entityType: "AdminUser",
      entityId: user.id,
      description: `Usuário admin criado: ${user.name} (${user.email}, ${user.role})`,
    });

    return NextResponse.json(user, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Já existe um usuário com esse e-mail" }, { status: 409 });
  }
}
