import { NextRequest, NextResponse } from "next/server";
import { getStoreSettings, upsertStoreSettings } from "@/lib/storeSettings";
import { ADMIN_COOKIE_NAME, getSessionFromToken } from "@/lib/adminAuth";
import { logActivity } from "@/lib/activityLog";

export async function GET() {
  const settings = await getStoreSettings();
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const freeShippingCents = Number(body.freeShippingCents);
  if (!Number.isFinite(freeShippingCents) || freeShippingCents < 0) {
    return NextResponse.json(
      { error: "Valor mínimo de frete grátis inválido" },
      { status: 400 }
    );
  }

  const referralCreditCents = Number(body.referralCreditCents);
  if (!Number.isFinite(referralCreditCents) || referralCreditCents < 0) {
    return NextResponse.json(
      { error: "Valor de crédito de indicação inválido" },
      { status: 400 }
    );
  }

  const data = {
    storeName: typeof body.storeName === "string" && body.storeName.trim() ? body.storeName.trim() : "V.CLOSET",
    storeSlogan: typeof body.storeSlogan === "string" ? body.storeSlogan.trim() || null : null,
    freeShippingCents: Math.round(freeShippingCents),
    whatsappNumber: typeof body.whatsappNumber === "string" ? body.whatsappNumber.replace(/\D/g, "") : "",
    instagramUrl: typeof body.instagramUrl === "string" ? body.instagramUrl.trim() || null : null,
    facebookUrl: typeof body.facebookUrl === "string" ? body.facebookUrl.trim() || null : null,
    tiktokUrl: typeof body.tiktokUrl === "string" ? body.tiktokUrl.trim() || null : null,
    referralCreditCents: Math.round(referralCreditCents),
  };

  const updated = await upsertStoreSettings(data);

  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = await getSessionFromToken(token);
  await logActivity({
    session,
    action: "CONFIGURACOES_ATUALIZADAS",
    entityType: "StoreSettings",
    description: "Configurações da loja atualizadas",
  });

  return NextResponse.json(updated);
}
