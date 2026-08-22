import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { AdminUserForm } from "@/components/admin/AdminUserForm";
import { ADMIN_COOKIE_NAME, getSessionFromToken } from "@/lib/adminAuth";

interface Props {
  params: { id: string };
}

export default async function EditarUsuarioPage({ params }: Props) {
  const user = await prisma.adminUser.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, email: true, role: true, active: true },
  });

  if (!user) {
    notFound();
  }

  const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
  const session = await getSessionFromToken(token);

  return (
    <div>
      <h1 className="admin-title">Editar usuário</h1>
      <p className="admin-subtitle">{user!.name}</p>
      <AdminUserForm
        initial={{
          id: user!.id,
          name: user!.name,
          email: user!.email,
          role: user!.role as "SUPER_ADMIN" | "OPERADOR",
          active: user!.active,
        }}
        currentUserId={session?.adminUserId ?? null}
      />
    </div>
  );
}
