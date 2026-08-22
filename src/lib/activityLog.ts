// Registro de atividades relevantes do admin (ActivityLog).
// Chamado a partir das API routes que fazem mutações (criar/editar/excluir produto,
// alterar status de pedido, criar cupom, alterar configurações, gerenciar usuários admin).
import { prisma } from "@/lib/prisma";
import type { SessionPayload } from "@/lib/adminAuth";

export async function logActivity(params: {
  session: SessionPayload | null;
  action: string;
  entityType?: string;
  entityId?: string;
  description?: string;
}) {
  const { session, action, entityType, entityId, description } = params;
  try {
    await prisma.activityLog.create({
      data: {
        adminUserId: session?.adminUserId ?? null,
        adminName: session?.name ?? "desconhecido",
        adminRole: session?.role ?? null,
        action,
        entityType,
        entityId,
        description,
      },
    });
  } catch (error) {
    // Log nunca deve derrubar a operação principal.
    console.error("Erro ao registrar ActivityLog:", error);
  }
}
