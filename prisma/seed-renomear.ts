// V.CLOSET — Renomeia produtos antigos cujo nome continha o nome de outra loja.
// Idempotente. Só altera o campo `name` — slugs (e links de pedidos antigos)
// permanecem inalterados.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const RENAMES: { slug: string; name: string }[] = [
  { slug: "anel-vivara-man-em-prata-925-com-rodio-negro-e-quartzo", name: "Anel Signet em Prata 925 com Ródio Negro e Quartzo" },
  { slug: "pingente-vivara-man-em-prata-925-35-5-mm", name: "Pingente Geométrico em Prata 925, 35,5 mm" },
  { slug: "relogio-vivara-biomas-tapete-verde-masculino-aco", name: "Relógio Masculino Aço Verde Musgo" },
  { slug: "abotoadura-vivara-man-em-prata-925-com-rodio-negro", name: "Abotoadura em Prata 925 com Ródio Negro" },
  { slug: "porta-cartao-vivara-man-em-couro-preto", name: "Porta-Cartão em Couro Preto" },
  { slug: "porta-passaporte-vivara-man-em-couro-marrom", name: "Porta-Passaporte em Couro Marrom" },
  { slug: "caneta-vivara-man-em-aco-e-resina-preta", name: "Caneta em Aço e Resina Preta" },
  { slug: "chaveiro-vivara-man-trancado-em-couro-e-prata-925", name: "Chaveiro Trançado em Couro e Prata 925" },
  { slug: "relogio-vivara-man-automatico-aco-preto", name: "Relógio Automático Aço Preto" },
  { slug: "relogio-vivara-man-couro-marrom-fundo-branco", name: "Relógio Couro Marrom Fundo Branco" },
  { slug: "pulseira-vivara-man-elos-cartier-em-prata-925", name: "Pulseira Elos Intercalados em Prata 925" },
  { slug: "pulseira-vivara-man-couro-trancado-marrom-com-aco", name: "Pulseira Couro Trançado Marrom com Aço" },
  { slug: "corrente-vivara-man-grumet-em-prata-925-60-cm", name: "Corrente Grumet em Prata 925, 60 cm" },
];

async function main() {
  let renamed = 0;
  for (const r of RENAMES) {
    const res = await prisma.product.updateMany({
      where: { slug: r.slug },
      data: { name: r.name },
    });
    renamed += res.count;
  }
  console.log(`Renomeados: ${renamed}/${RENAMES.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
