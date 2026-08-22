"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AdminUserFormValues {
  id?: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "OPERADOR";
  active: boolean;
}

interface Props {
  initial?: AdminUserFormValues;
  currentUserId?: string | null;
}

export function AdminUserForm({ initial, currentUserId }: Props) {
  const router = useRouter();
  const isEditing = !!initial?.id;
  const isSelf = isEditing && initial!.id === currentUserId;

  const [name, setName] = useState(initial?.name || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"SUPER_ADMIN" | "OPERADOR">(initial?.role || "OPERADOR");
  const [active, setActive] = useState(initial?.active ?? true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim()) {
      setError("Nome e e-mail são obrigatórios");
      return;
    }

    if (!isEditing && password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (password && password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    const payload: Record<string, unknown> = { name, email, role, active };
    if (password) payload.password = password;

    setSaving(true);
    const url = isEditing ? `/api/admin/usuarios/${initial!.id}` : "/api/admin/usuarios";
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erro ao salvar usuário");
      return;
    }

    router.push("/admin/usuarios");
    router.refresh();
  }

  async function handleDelete() {
    if (!initial?.id) return;
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

    setSaving(true);
    const res = await fetch(`/api/admin/usuarios/${initial.id}`, { method: "DELETE" });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erro ao excluir usuário");
      return;
    }

    router.push("/admin/usuarios");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-5">
      <div>
        <label className="admin-label">Nome completo</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Maria Silva"
          className="admin-input mt-1 w-full"
          required
        />
      </div>

      <div>
        <label className="admin-label">E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="maria@vcloset.com"
          className="admin-input mt-1 w-full"
          required
        />
      </div>

      <div>
        <label className="admin-label">
          {isEditing ? "Nova senha (deixe em branco para manter)" : "Senha"}
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          className="admin-input mt-1 w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="admin-label">Nível de acesso</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "SUPER_ADMIN" | "OPERADOR")}
            className="admin-input mt-1 w-full"
            disabled={isSelf}
          >
            <option value="OPERADOR">Operador</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm text-cream/70">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              disabled={isSelf}
            />
            Usuário ativo
          </label>
        </div>
      </div>

      {isSelf && (
        <p className="text-xs text-cream/40">
          Você não pode alterar seu próprio nível de acesso ou desativar seu próprio usuário.
        </p>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex items-center justify-between gap-3">
        <button type="submit" disabled={saving} className="admin-btn-primary">
          {saving ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar usuário"}
        </button>
        {isEditing && !isSelf && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="admin-btn-danger"
          >
            Excluir usuário
          </button>
        )}
      </div>
    </form>
  );
}
