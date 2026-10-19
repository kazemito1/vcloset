// Backup do banco: exporta todas as tabelas de negócio para um JSON.
// Uso: node scripts/backup-db.mjs  (requer DATABASE_URL no ambiente)
// Gerado para rodar no GitHub Actions (ver .github/workflows/backup.yml).
import { PrismaClient } from "@prisma/client";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

async function main() {
  const prisma = new PrismaClient();

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const outDir = join(process.cwd(), "backups");
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, `backup-${stamp}.json`);

  const [
    categories,
    products,
    productVariants,
    orders,
    orderItems,
    coupons,
    referrals,
    customers,
    customerCredits,
    creditTransactions,
    leads,
    blockedCards,
    blockedIps,
    reviews,
    expenses,
    adminUsers,
    storeSettings,
  ] = await Promise.all([
    prisma.category.findMany(),
    prisma.product.findMany(),
    prisma.productVariant.findMany(),
    prisma.order.findMany(),
    prisma.orderItem.findMany(),
    prisma.coupon.findMany(),
    prisma.referral.findMany(),
    prisma.customer.findMany({ select: { id: true, name: true, email: true, createdAt: true, updatedAt: true } }),
    prisma.customerCredit.findMany(),
    prisma.creditTransaction.findMany(),
    prisma.lead.findMany(),
    prisma.blockedCard.findMany(),
    prisma.blockedIp.findMany(),
    prisma.review.findMany(),
    prisma.expense.findMany(),
    prisma.adminUser.findMany(),
    prisma.storeSettings.findMany(),
  ]);

  // Senhas nunca saem no backup.
  const adminUsersSafe = adminUsers.map(({ passwordHash: _ph, ...rest }) => rest);
  const customersSafe = customers;

  const backup = {
    generatedAt: new Date().toISOString(),
    tables: {
      categories,
      products,
      productVariants,
      orders,
      orderItems,
      coupons,
      referrals,
      customers: customersSafe,
      customerCredits,
      creditTransactions,
      leads,
      blockedCards,
      blockedIps,
      reviews,
      expenses,
      adminUsers: adminUsersSafe,
      storeSettings,
    },
  };

  writeFileSync(outFile, JSON.stringify(backup, null, 2), "utf8");

  const counts = Object.entries(backup.tables)
    .map(([t, rows]) => `${t}=${rows.length}`)
    .join(" ");
  console.log(`Backup salvo em ${outFile}`);
  console.log(counts);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Backup falhou:", err);
  process.exit(1);
});
