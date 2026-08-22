// V.CLOSET - Seed incremental de cupons de exemplo
// Cria 3 cupons de teste (idempotente via upsert por código), sem apagar
// nenhum dado existente.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  const coupons = [
    {
      code: "BEMVINDO10",
      type: "PERCENT",
      value: 10,
      active: true,
      expiresAt: daysFromNow(90),
      maxUses: null,
      minOrderValueCents: null,
    },
    {
      code: "FRETE20",
      type: "FIXED",
      value: 2000, // R$ 20,00 em centavos
      active: true,
      expiresAt: daysFromNow(90),
      maxUses: null,
      minOrderValueCents: null,
    },
    {
      code: "VIP15",
      type: "PERCENT",
      value: 15,
      active: true,
      expiresAt: daysFromNow(90),
      maxUses: 50,
      minOrderValueCents: 30000, // pedido mínimo de R$ 300,00
    },
  ];

  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: {},
      create: coupon,
    });
    console.log(`Cupom ${coupon.code} ok.`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
