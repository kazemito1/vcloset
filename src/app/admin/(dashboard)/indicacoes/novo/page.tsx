import { ReferralForm } from "@/components/admin/ReferralForm";

export default function NovaIndicacaoPage() {
  return (
    <div>
      <h1 className="admin-title">Nova indicação</h1>
      <p className="admin-subtitle">
        Cadastre um cliente indicador. Um código único será gerado automaticamente para ele
        compartilhar com amigos.
      </p>
      <ReferralForm />
    </div>
  );
}
