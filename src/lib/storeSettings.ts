// Configurações gerais da loja (StoreSettings), lidas pelo site público em vez de
// constantes fixas em código. Linha única na tabela (id fixo "default").
import { prisma } from "@/lib/prisma";

export interface StoreSettingsData {
  storeName: string;
  storeSlogan: string | null;
  freeShippingCents: number;
  whatsappNumber: string;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  // Valor único e global (em centavos) de crédito virtual concedido ao indicador
  // quando um pedido feito com o código dele é confirmado (status PAID).
  referralCreditCents: number;
}

const DEFAULTS: StoreSettingsData = {
  storeName: "V.CLOSET",
  storeSlogan: null,
  freeShippingCents: 29900,
  whatsappNumber: "5511999999999",
  instagramUrl: null,
  facebookUrl: null,
  tiktokUrl: null,
  referralCreditCents: 1000,
};

export async function getStoreSettings(): Promise<StoreSettingsData> {
  try {
    const settings = await prisma.storeSettings.findUnique({ where: { id: "default" } });
    if (!settings) return DEFAULTS;
    return {
      storeName: settings.storeName,
      storeSlogan: settings.storeSlogan,
      freeShippingCents: settings.freeShippingCents,
      whatsappNumber: settings.whatsappNumber || DEFAULTS.whatsappNumber,
      instagramUrl: settings.instagramUrl,
      facebookUrl: settings.facebookUrl,
      tiktokUrl: settings.tiktokUrl,
      referralCreditCents: settings.referralCreditCents,
    };
  } catch (error) {
    // Fallback defensivo: nunca deixar o site público quebrar por erro de leitura de config.
    console.error("Erro ao ler StoreSettings, usando defaults:", error);
    return DEFAULTS;
  }
}

export async function upsertStoreSettings(data: Partial<StoreSettingsData>) {
  return prisma.storeSettings.upsert({
    where: { id: "default" },
    create: { id: "default", ...DEFAULTS, ...data },
    update: { ...data },
  });
}
