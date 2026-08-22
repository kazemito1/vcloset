import { AdminUserForm } from "@/components/admin/AdminUserForm";

export default function NovoUsuarioPage() {
  return (
    <div>
      <h1 className="admin-title">Novo usuário</h1>
      <p className="admin-subtitle">Cadastre um novo usuário com acesso ao painel admin</p>
      <AdminUserForm />
    </div>
  );
}
