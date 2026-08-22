import { ProductForm } from "@/components/admin/ProductForm";

export default function NovoProdutoPage() {
  return (
    <div>
      <h1 className="admin-title">Novo produto</h1>
      <p className="admin-subtitle">Cadastre um novo produto na loja</p>
      <ProductForm />
    </div>
  );
}
