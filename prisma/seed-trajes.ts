// V.CLOSET - Limpeza dos produtos da categoria TRAJES adicionados com
// ilustrações de placeholder. Os produtos serão recadastrados com fotos
// reais quando o gerador de imagens estiver disponível novamente.
// Este seed roda no build e garante que os produtos não voltem em nenhum
// ambiente (o banco de produção é limpo no próximo deploy).
// A categoria "Trajes" é mantida no banco.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PRODUCT_SLUGS = [
  "blazer-alfaiataria-cropped-off-white",
  "blazer-longo-alfaiataria-preto",
  "conjunto-alfaiataria-bege",
  "conjunto-trico-canelado-caramelo",
  "calca-pantalona-alfaiataria-preta",
  "vestido-midi-alfaiataria",
];

async function main() {
  const deleted = await prisma.product.deleteMany({
    where: { slug: { in: PRODUCT_SLUGS } },
  });
  console.log(`Produtos de Trajes removidos: ${deleted.count}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
