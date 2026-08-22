import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ReferralForm } from "@/components/admin/ReferralForm";
import { DeleteReferralButton } from "@/components/admin/DeleteReferralButton";

interface Props {
  params: { id: string };
}

export default async function EditarIndicacaoPage({ params }: Props) {
  const referral = await prisma.referral.findUnique({ where: { id: params.id } });

  if (!referral) {
    notFound();
  }

  return (
    <div>
      <h1 className="admin-title">Editar indicação</h1>
      <p className="admin-subtitle">{referral!.referrerName}</p>
      <ReferralForm
        initial={{
          id: referral!.id,
          code: referral!.code,
          referrerName: referral!.referrerName,
          referrerEmail: referral!.referrerEmail,
          active: referral!.active,
          referredDiscountType: referral!.referredDiscountType as "PERCENT" | "FIXED",
          referredDiscountValue: referral!.referredDiscountValue,
          rewardType: referral!.rewardType as "PERCENT" | "FIXED",
          rewardValue: referral!.rewardValue,
        }}
      />
      <DeleteReferralButton id={referral!.id} />
    </div>
  );
}
