import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
(async () => {
  const products = await prisma.product.findMany({ include: { category: true }, orderBy: [{ category: { order: "asc" } }, { name: "asc" }] });
  for (const p of products) {
    console.log(p.category.slug + " | " + p.name + " | " + p.slug + " | " + p.images);
  }
  await prisma.$disconnect();
})();
