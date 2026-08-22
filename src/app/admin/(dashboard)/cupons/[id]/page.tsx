import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CouponForm } from "@/components/admin/CouponForm";
import { DeleteCouponButton } from "@/components/admin/DeleteCouponButton";

interface Props {
  params: { id: string };
}

export default async function EditarCupomPage({ params }: Props) {
  const coupon = await prisma.coupon.findUnique({ where: { id: params.id } });

  if (!coupon) {
    notFound();
  }

  return (
    <div>
      <h1 className="admin-title">Editar cupom</h1>
      <p className="admin-subtitle">{coupon!.code}</p>
      <CouponForm
        initial={{
          id: coupon!.id,
          code: coupon!.code,
          type: coupon!.type as "PERCENT" | "FIXED",
          value: coupon!.value,
          active: coupon!.active,
          expiresAt: coupon!.expiresAt ? coupon!.expiresAt.toISOString() : null,
          maxUses: coupon!.maxUses,
          minOrderValueCents: coupon!.minOrderValueCents,
        }}
      />
      <DeleteCouponButton id={coupon!.id} />
    </div>
  );
}
