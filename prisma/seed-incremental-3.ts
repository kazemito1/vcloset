// V.CLOSET - Seed incremental 3
// Atualiza o campo `images` dos produtos que ainda estavam usando placeholder
// SVG genérico, apontando para as novas fotos still geradas em public/products/.
// NÃO apaga nada (sem deleteMany). Apenas update pontual por slug.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const updates: { slug: string; image: string }[] = [
  // aneis
  { slug: "anel-duo-ouro-e-rodio-negro", image: "/products/anel-duo-ouro-e-rodio-negro.png" },
  { slug: "anel-meia-alianca-cravejado", image: "/products/anel-meia-alianca-cravejado.png" },
  { slug: "anel-prata-925-no-infinito", image: "/products/anel-prata-925-no-infinito.png" },
  { slug: "anel-solitario-ouro-18k", image: "/products/anel-solitario-ouro-18k.png" },
  // colares
  { slug: "colar-choker-folheado-a-ouro", image: "/products/colar-choker-folheado-a-ouro.png" },
  { slug: "colar-gravata-veneziana-ouro-18k", image: "/products/colar-gravata-veneziana-ouro-18k.png" },
  { slug: "colar-ponto-de-luz-diamante", image: "/products/colar-ponto-de-luz-diamante.png" },
  { slug: "colar-prata-925-coracao-vazado", image: "/products/colar-prata-925-coracao-vazado.png" },
  // brincos
  { slug: "brinco-argola-media-ouro-18k", image: "/products/brinco-argola-media-ouro-18k.png" },
  { slug: "brinco-ear-cuff-folheado", image: "/products/brinco-ear-cuff-folheado.png" },
  { slug: "brinco-ponto-de-luz-zirconia", image: "/products/brinco-ponto-de-luz-zirconia.png" },
  { slug: "brinco-prata-925-gota-cristal", image: "/products/brinco-prata-925-gota-cristal.png" },
  // pulseiras
  { slug: "bracelete-rigido-folheado-a-ouro", image: "/products/bracelete-rigido-folheado-a-ouro.png" },
  { slug: "pulseira-elos-cartier-ouro-18k", image: "/products/pulseira-elos-cartier-ouro-18k.png" },
  { slug: "pulseira-prata-925-berloques", image: "/products/pulseira-prata-925-berloques.png" },
  { slug: "pulseira-riviera-zirconias", image: "/products/pulseira-riviera-zirconias.png" },
  // relogios
  { slug: "relogio-bicolor-ouro-e-aco", image: "/products/relogio-bicolor-ouro-e-aco.png" },
  { slug: "relogio-feminino-ouro-rose", image: "/products/relogio-feminino-ouro-rose.png" },
  { slug: "relogio-masculino-aco-premium", image: "/products/relogio-masculino-aco-premium.png" },
  { slug: "relogio-slim-couro-legitimo", image: "/products/relogio-slim-couro-legitimo.png" },
  // aliancas
  { slug: "alianca-anatomica-bicolor", image: "/products/alianca-anatomica-bicolor.png" },
  { slug: "alianca-classica-ouro-18k-4mm", image: "/products/alianca-classica-ouro-18k-4mm.png" },
  { slug: "alianca-diamantada-ouro-branco", image: "/products/alianca-diamantada-ouro-branco.png" },
  { slug: "alianca-prata-925-compromisso", image: "/products/alianca-prata-925-compromisso.png" },
];

async function main() {
  let updated = 0;
  let skipped = 0;
  for (const u of updates) {
    const existing = await prisma.product.findUnique({ where: { slug: u.slug } });
    if (!existing) {
      console.log(`  ! Produto não encontrado, pulando: ${u.slug}`);
      skipped++;
      continue;
    }
    await prisma.product.update({
      where: { slug: u.slug },
      data: { images: JSON.stringify([u.image]) },
    });
    console.log(`  ✓ Atualizado: ${u.slug} -> ${u.image}`);
    updated++;
  }
  console.log(`Seed incremental 3 concluído. Atualizados: ${updated}, pulados: ${skipped}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
