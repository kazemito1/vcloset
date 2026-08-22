import { StoreSettingsForm } from "@/components/admin/StoreSettingsForm";

export default function ConfiguracoesPage() {
  return (
    <div>
      <h1 className="admin-title">Configurações da loja</h1>
      <p className="admin-subtitle">
        Edite as informações gerais exibidas no site público
      </p>
      <div className="mt-6">
        <StoreSettingsForm />
      </div>
    </div>
  );
}
