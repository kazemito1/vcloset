import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, isValidRole } from "@/lib/adminUsers";
import { ADMIN_COOKIE_NAME, getSessionFromToken } from "@/lib/adminAuth";
import { logActivity } from "@/lib/activityLog";

interface Params {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: Params) {
  const user = await prisma.adminUser.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }
  return NextResponse.json(user);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const role = isValidRole(body.role) ? body.role : "OPERADOR";
  const active = body.active !== false;
  const password = typeof body.password === "string" ? body.password : "";

  if (!name || !email) {
    return NextResponse.json({ error: "Nome e e-mail são obrigatórios" }, { status: 400 });
  }

  const existing = await prisma.adminUser.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  // Evita remover o privilégio do último SUPER_ADMIN ativo, para não travar o acesso ao painel.
  if (existing.role === "SUPER_ADMIN" && (role !== "SUPER_ADMIN" || !active)) {
    const otherActiveSuperAdmins = await prisma.adminUser.count({
      where: { role: "SUPER_ADMIN", active: true, id: { not: params.id } },
    });
    if (otherActiveSuperAdmins === 0) {
      return NextResponse.json(
        { error: "Não é possível remover o último SUPER_ADMIN ativo" },
        { status: 400 }
      );
    }
  }

  const data: Record<string, unknown> = { name, email, role, active };
  if (password) {
    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      );
    }
    data.passwordHash = await hashPassword(password);
  }

  try {
    const user = await prisma.adminUser.update({
      where: { id: params.id },
      data,
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    });

    const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const session = await getSessionFromToken(token);
    await logActivity({
      session,
      action: "USUARIO_ATUALIZADO",
      entityType: "AdminUser",
      entityId: user.id,
      description: `Usuário admin atualizado: ${user.name} (${user.email}, ${user.role})`,
    });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Já existe um usuário com esse e-mail" }, { status: 409 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = await getSessionFromToken(token);

  if (session?.adminUserId === params.id) {
    return NextResponse.json(
      { error: "Você não pode excluir seu próprio usuário" },
      { status: 400 }
    );
  }

  const existing = await prisma.adminUser.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  if (existing.role === "SUPER_ADMIN") {
    const otherActiveSuperAdmins = await prisma.adminUser.count({
      where: { role: "SUPER_ADMIN", active: true, id: { not: params.id } },
    });
    if (otherActiveSuperAdmins === 0) {
      return NextResponse.json(
        { error: "Não é possível excluir o último SUPER_ADMIN ativo" },
        { status: 400 }
      );
    }
  }

  try {
    await prisma.adminUser.delete({ where: { id: params.id } });

    await logActivity({
      session,
      action: "USUARIO_EXCLUIDO",
      entityType: "AdminUser",
      entityId: params.id,
      description: `Usuário admin excluído: ${existing.name} (${existing.email})`,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro ao excluir usuário" }, { status: 400 });
  }
}
