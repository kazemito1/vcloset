import { CouponForm } from "@/components/admin/CouponForm";

export default function NovoCupomPage() {
  return (
    <div>
      <h1 className="admin-title">Novo cupom</h1>
      <p className="admin-subtitle">Crie um novo cupom de desconto para a loja</p>
      <CouponForm />
    </div>
  );
}
