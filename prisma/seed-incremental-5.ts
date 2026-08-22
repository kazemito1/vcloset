// V.CLOSET - Seed incremental 5
// Completa a navegação (Joias, Casamento, Relógios, Acessórios, Masculino,
// Presentes, Sale), sem usar nome/marca de terceiros em nenhum lugar.
//
// Este script:
// 1) Cria a categoria "Acessórios" (upsert por slug) e 5 produtos novos com
//    fotos reais geradas via ferramenta de imagem (public/products/*.png).
// 2) Faz backfill de targetGender em produtos já existentes (alianças e
//    relógios com indicação de gênero no nome), sem duplicar produtos.
// 3) Preenche salePriceCents em 5 produtos existentes variados por categoria,
//    populando a página /sale com desconto real de 20%-30%.
//
// NÃO apaga dados existentes. Idempotente (upsert por slug / update por slug).
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type NewProduct = {
  name: string;
  description: string;
  material: string;
  priceCents: number;
  image: string;
  featured?: boolean;
};

// Faixa de preço calibrada abaixo do benchmark de mercado pesquisado
// (joalherias premium usam marcas parceiras para acessórios de luxo, ex.
// canetas/carteiras assinadas na faixa de R$ 2.900 a R$ 4.900), mantendo
// coerência com o posicionamento mais acessível do restante do catálogo.
const acessoriosProducts: NewProduct[] = [
  {
    name: "Chaveiro Couro Legítimo Café",
    description:
      "Chaveiro artesanal em couro legítimo café, argola em metal dourado, acabamento costurado à mão com fecho em botão de pressão.",
    material: "Couro Legítimo",
    priceCents: 18900,
    image: "/products/chaveiro-couro-legitimo-cafe.png",
  },
  {
    name: "Óculos de Sol Retangular Acetato Preto",
    description:
      "Óculos de sol unissex, armação em acetato preto fosco, lentes polarizadas com proteção UV400, design retangular minimalista.",
    material: "Acetato",
    priceCents: 44900,
    featured: true,
    image: "/products/oculos-sol-retangular-acetato-preto.png",
  },
  {
    name: "Porta-Joias Veludo Bordô",
    description:
      "Estojo organizador em veludo bordô com compartimentos internos para anéis, brincos, pulseiras e colares, fecho frontal em metal dourado.",
    material: "Veludo/MDF",
    priceCents: 25900,
    image: "/products/porta-joias-veludo-bordo.png",
  },
  {
    name: "Carteira Couro Slim Preta",
    description:
      "Carteira slim em couro legítimo preto, compartimentos para cartões e cédulas, costura reforçada, design minimalista.",
    material: "Couro Legítimo",
    priceCents: 32900,
    image: "/products/carteira-couro-slim-preta.png",
  },
  {
    name: "Corrente Avulsa Ouro 18k 60cm",
    description:
      "Corrente veneziana avulsa em ouro 18k, 60cm de comprimento, elos maciços, fecho tipo lagosta reforçado, ideal para uso com pingentes diversos.",
    material: "Ouro 18k",
    priceCents: 89000,
    image: "/products/corrente-avulsa-ouro-18k-60cm.png",
  },
];

// Backfill de público-alvo em produtos já existentes (curadoria /masculino),
// sem criar nem duplicar nenhum produto.
const genderBackfill: { slug: string; targetGender: "masculino" | "feminino" }[] = [
  { slug: "alianca-tungstenio-preto-masculina", targetGender: "masculino" },
  { slug: "relogio-masculino-aco-premium", targetGender: "masculino" },
  { slug: "relogio-masculino-cronografo-aco-prata", targetGender: "masculino" },
  { slug: "relogio-feminino-aco-dourado", targetGender: "feminino" },
  { slug: "relogio-feminino-ouro-rose", targetGender: "feminino" },
  { slug: "relogio-feminino-slim-couro-branco-ouro-rose", targetGender: "feminino" },
];

// Desconto realista (20%-30%, dentro do range observado em benchmarks de
// mercado) em 5 produtos existentes já variados por categoria, populando a
// página /sale sem necessidade de produtos novos.
const saleBackfill: { slug: string; discountPercent: number }[] = [
  { slug: "anel-prata-925-no-infinito", discountPercent: 20 },
  { slug: "colar-prata-925-coracao-vazado", discountPercent: 25 },
  { slug: "brinco-prata-925-gota-cristal", discountPercent: 20 },
  { slug: "pulseira-prata-925-berloques", discountPercent: 20 },
  { slug: "relogio-slim-couro-legitimo", discountPercent: 30 },
];

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function main() {
  // 1) Categoria Acessórios
  const category = await prisma.category.upsert({
    where: { slug: "acessorios" },
    update: {},
    create: { name: "Acessórios", slug: "acessorios", order: 7 },
  });
  console.log(`Categoria "Acessórios" pronta (id: ${category.id}).`);

  let created = 0;
  let skipped = 0;

  for (const p of acessoriosProducts) {
    const slug = slugify(p.name);
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      console.log(`  - Já existe, pulando: ${p.name}`);
      skipped++;
      continue;
    }

    await prisma.product.create({
      data: {
        name: p.name,
        slug,
        description: p.description,
        material: p.material,
        priceCents: p.priceCents,
        images: JSON.stringify([p.image]),
        featured: p.featured || false,
        categoryId: category.id,
      },
    });
    console.log(`  + Criado: ${p.name} (${slug})`);
    created++;
  }

  // 2) Backfill de targetGender
  let genderUpdated = 0;
  for (const entry of genderBackfill) {
    const result = await prisma.product.updateMany({
      where: { slug: entry.slug },
      data: { targetGender: entry.targetGender },
    });
    if (result.count > 0) {
      console.log(`  ~ targetGender="${entry.targetGender}" aplicado a: ${entry.slug}`);
      genderUpdated += result.count;
    } else {
      console.log(`  ! Produto não encontrado para backfill de gênero: ${entry.slug}`);
    }
  }

  // 3) Backfill de salePriceCents (produtos em promoção)
  let saleUpdated = 0;
  for (const entry of saleBackfill) {
    const product = await prisma.product.findUnique({ where: { slug: entry.slug } });
    if (!product) {
      console.log(`  ! Produto não encontrado para sale: ${entry.slug}`);
      continue;
    }
    const salePriceCents = Math.round(product.priceCents * (1 - entry.discountPercent / 100));
    await prisma.product.update({
      where: { slug: entry.slug },
      data: { salePriceCents },
    });
    console.log(
      `  % Sale ${entry.discountPercent}% aplicado a: ${entry.slug} (de ${product.priceCents} para ${salePriceCents})`
    );
    saleUpdated++;
  }

  console.log(
    `Seed incremental 5 concluído. Acessórios criados: ${created}, pulados: ${skipped}. Gênero atualizado: ${genderUpdated}. Sale atualizado: ${saleUpdated}.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
