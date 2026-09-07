// V.CLOSET - Backfill de variantes (tamanhos)
// Adiciona opções de tamanho para produtos que ainda não possuem nenhuma
// variante cadastrada, categorizando por tipo de peça:
// - Colares/correntes: comprimento (cm)
// - Brincos de argola/ear cuff: diâmetro/tamanho de encaixe
// - Brincos solitário/gota (par fixo, sem variação real de tamanho): mantidos
//   com opção única "Par Único"
// - Pulseiras de elos: comprimento (cm)
// - Braceletes rígidos: tamanho de punho (P/M/G)
// - Relógios e acessórios sem dimensão de tamanho real: "Único"
// NÃO apaga produtos. Só cria variantes em produtos com variants.length === 0.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const COLAR_PADRAO = ["40cm", "45cm", "50cm", "60cm"];
const COLAR_AJUSTAVEL_CURTO = ["40cm", "42cm", "45cm"];
const CHOKER = ["35cm", "38cm", "40cm"];
const PULSEIRA_ELOS = ["16cm", "18cm", "20cm"];
const BRACELETE_RIGIDO = ["P (16cm)", "M (18cm)", "G (20cm)"];
const ARGOLA = ["Pequena (1,5cm)", "Média (2,5cm)", "Grande (3,5cm)"];
const EAR_CUFF = ["P", "M", "G"];
const PAR_UNICO = ["Par Único"];
const UNICO = ["Único"];
const CORRENTE_AVULSA = ["45cm", "50cm", "60cm", "70cm"];

const backfill: { slug: string; variants: string[] }[] = [
  // seed.ts
  { slug: "colar-gravata-veneziana-ouro-18k", variants: COLAR_PADRAO },
  { slug: "colar-ponto-de-luz-diamante", variants: COLAR_PADRAO },
  { slug: "colar-prata-925-coracao-vazado", variants: COLAR_PADRAO },
  { slug: "colar-choker-folheado-a-ouro", variants: CHOKER },
  { slug: "brinco-argola-media-ouro-18k", variants: ARGOLA },
  { slug: "brinco-ponto-de-luz-zirconia", variants: PAR_UNICO },
  { slug: "brinco-prata-925-gota-cristal", variants: PAR_UNICO },
  { slug: "brinco-ear-cuff-folheado", variants: EAR_CUFF },
  { slug: "bracelete-rigido-folheado-a-ouro", variants: BRACELETE_RIGIDO },
  { slug: "relogio-feminino-ouro-rose", variants: UNICO },
  { slug: "relogio-masculino-aco-premium", variants: UNICO },
  { slug: "relogio-bicolor-ouro-e-aco", variants: UNICO },
  { slug: "relogio-slim-couro-legitimo", variants: UNICO },
  // seed-incremental-2.ts
  { slug: "colar-ponto-de-luz-ouro-18k", variants: COLAR_AJUSTAVEL_CURTO },
  { slug: "brinco-argola-ouro-18k", variants: ARGOLA },
  { slug: "relogio-feminino-aco-dourado", variants: UNICO },
  // seed-incremental-4.ts
  { slug: "colar-riviera-diamantes-ouro-branco-18k", variants: COLAR_PADRAO },
  { slug: "colar-estrela-prata-925-zirconia", variants: COLAR_AJUSTAVEL_CURTO },
  { slug: "brinco-argola-tubular-ouro-18k", variants: ARGOLA },
  { slug: "brinco-solitario-diamante-ouro-branco-18k", variants: PAR_UNICO },
  { slug: "brinco-gota-vazada-prata-925-zirconia", variants: PAR_UNICO },
  { slug: "pulseira-coracao-ouro-rose-18k", variants: PULSEIRA_ELOS },
  { slug: "bracelete-martelado-ouro-18k", variants: BRACELETE_RIGIDO },
  { slug: "relogio-masculino-cronografo-aco-prata", variants: UNICO },
  { slug: "relogio-feminino-slim-couro-branco-ouro-rose", variants: UNICO },
  // seed-incremental-5.ts
  { slug: "chaveiro-couro-legitimo-cafe", variants: UNICO },
  { slug: "oculos-de-sol-retangular-acetato-preto", variants: UNICO },
  { slug: "porta-joias-veludo-bordo", variants: UNICO },
  { slug: "carteira-couro-slim-preta", variants: UNICO },
  { slug: "corrente-avulsa-ouro-18k-60cm", variants: CORRENTE_AVULSA },
];

// Produtos que já tinham 1 única variante de comprimento e devem ser
// atualizados para múltiplas opções (substitui, em vez de só adicionar).
const replaceSingle: { slug: string; variants: string[] }[] = [
  { slug: "corrente-life-em-prata-925-40-cm", variants: ["40cm", "50cm", "60cm", "70cm"] },
  { slug: "colar-masculino-em-aco-dourado-60-cm", variants: ["50cm", "60cm", "70cm"] },
  {
    slug: "corrente-vivara-man-grumet-em-prata-925-60-cm",
    variants: ["45 cm", "50 cm", "60 cm", "70 cm"],
  },
];

async function main() {
  let added = 0;
  let skipped = 0;
  let notFound = 0;

  for (const entry of replaceSingle) {
    const product = await prisma.product.findUnique({
      where: { slug: entry.slug },
      include: { variants: true },
    });
    if (!product) {
      console.log(`  ! Produto não encontrado (replace): ${entry.slug}`);
      continue;
    }
    if (product.variants.length > 1) {
      console.log(`  - Já diversificado, pulando: ${entry.slug}`);
      continue;
    }
    await prisma.productVariant.deleteMany({ where: { productId: product.id } });
    await prisma.productVariant.createMany({
      data: entry.variants.map((label) => ({
        productId: product.id,
        label,
        stock: 10,
      })),
    });
    console.log(`  ~ Variantes substituídas em ${entry.slug}: ${entry.variants.join(", ")}`);
  }

  for (const entry of backfill) {
    const product = await prisma.product.findUnique({
      where: { slug: entry.slug },
      include: { variants: true },
    });

    if (!product) {
      console.log(`  ! Produto não encontrado: ${entry.slug}`);
      notFound++;
      continue;
    }

    if (product.variants.length > 0) {
      console.log(`  - Já possui variantes, pulando: ${entry.slug}`);
      skipped++;
      continue;
    }

    await prisma.productVariant.createMany({
      data: entry.variants.map((label) => ({
        productId: product.id,
        label,
        stock: 10,
      })),
    });
    console.log(`  + Variantes adicionadas a ${entry.slug}: ${entry.variants.join(", ")}`);
    added++;
  }

  console.log(
    `Backfill de variantes concluído. Produtos atualizados: ${added}, já ok: ${skipped}, não encontrados: ${notFound}.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
