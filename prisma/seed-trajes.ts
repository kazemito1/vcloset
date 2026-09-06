// V.CLOSET - Seed da categoria "Trajes Femininos"
// Cria a categoria e 10 produtos inspirados no catálogo AMARO, com nomes,
// preços e referências espelhadas do site oficial. O script é idempotente
// (upsert por slug) e pode ser rodado novamente sem duplicar produtos.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type TrajeProduct = {
  name: string;
  description: string;
  material: string;
  priceCents: number;
  image: string;
  featured?: boolean;
  variants?: string[];
};

const CATEGORY = {
  name: "Trajes Femininos",
  slug: "trajes-femininos",
  order: 8,
};

// Produtos baseados no catálogo AMARO (nomes e preços espelhados).
const trajesProducts: TrajeProduct[] = [
  {
    name: "Blusa Manga Longa de Tricot - Azul",
    description:
      "Blusa de tricot com manga longa, modelagem reta e textura canelada. Tom azul versátil, ideal para sobreposições e looks urbanos no dia a dia.",
    material: "Tricot acrílico com elastano",
    priceCents: 32990,
    image: "/products/trajes-blusa-manga-longa-tricot-azul.png",
    featured: true,
    variants: ["PP", "P", "M", "G", "GG"],
  },
  {
    name: "Calça Wide Leg Sarja - Vinho",
    description:
      "Calça wide leg em sarja de algodão com caimento fluido, cós médio e pernas amplas. Cor vinho sofisticada para compor looks de escritório ou eventos casuais.",
    material: "Sarja de algodão",
    priceCents: 28990,
    image: "/products/trajes-calca-wide-leg-sarja-vinho.png",
    variants: ["34", "36", "38", "40", "42"],
  },
  {
    name: "Blusa Gola Role de Malha - Bege",
    description:
      "Blusa básica de malha com gola role, manga curta e caimento confortável. Bege neutro, perfeita como peça coringa para diversas combinações.",
    material: "Malha de algodão",
    priceCents: 9990,
    image: "/products/trajes-blusa-gola-role-malha-bege.png",
    variants: ["PP", "P", "M", "G", "GG"],
  },
  {
    name: "Blusa Gola Alta de Tricot - Preto",
    description:
      "Blusa de tricot com gola alta e manga longa, modelagem justa ao corpo. Preta e atemporal, combina com calças jeans, saias e sobretudos.",
    material: "Tricot acrílico",
    priceCents: 19990,
    image: "/products/trajes-blusa-gola-alta-tricot-preto.png",
    variants: ["PP", "P", "M", "G", "GG"],
  },
  {
    name: "Calça com Barra Virada Jeans - Jeans Escuro",
    description:
      "Calça jeans reta com barra virada, lavagem escura e modelagem confortável. Acabamento clássico que valoriza silhuetas de todos os biótipos.",
    material: "Jeans de algodão",
    priceCents: 29990,
    image: "/products/trajes-calca-barra-virada-jeans-escuro.png",
    variants: ["34", "36", "38", "40", "42"],
  },
  {
    name: "Calça Mom Jeans - Preto",
    description:
      "Calça mom jeans com cintura alta, perna levemente afunilada e lavagem preta. Visual retrô moderno, ideal para looks casuais e urbanos.",
    material: "Jeans de algodão",
    priceCents: 29990,
    image: "/products/trajes-calca-mom-jeans-preto.png",
    variants: ["34", "36", "38", "40", "42"],
  },
  {
    name: "Casaco com Punho Largo - Marrom",
    description:
      "Casaco oversized com punho largo, abotoamento frontal e tecido estruturado. Marrom quente, perfeito para sobreposições elegantes nos dias frios.",
    material: "Poliéster com recorte de lã",
    priceCents: 42990,
    image: "/products/trajes-casaco-punho-largo-marrom.png",
    featured: true,
    variants: ["PP", "P", "M", "G", "GG"],
  },
  {
    name: "Calça Texturizada em Poliamida - Preto",
    description:
      "Calça de poliamida texturizada com caimento ajustado, cós elástico e toque levemente acetinado. Preta e versátil, une conforto e sofisticação.",
    material: "Poliamida texturizada",
    priceCents: 34990,
    image: "/products/trajes-calca-texturizada-poliamida-preto.png",
    variants: ["PP", "P", "M", "G", "GG"],
  },
  {
    name: "Saia Midi Essential - Preto",
    description:
      "Saia midi essential com cintura alta, corte evasê e comprimento abaixo do joelho. Preta e elegante, base atemporal para produções formais e casuais.",
    material: "Viscose com elastano",
    priceCents: 17990,
    image: "/products/trajes-saia-midi-essential-preto.png",
    variants: ["PP", "P", "M", "G", "GG"],
  },
  {
    name: "Vestido Polo - Azul Marinho",
    description:
      "Vestido polo em piquet de algodão, gola com botões, manga curta e caimento reto. Azul marinho discreto, ideal para o dia a dia com elegância.",
    material: "Algodão piquet",
    priceCents: 22990,
    image: "/products/trajes-vestido-polo-azul-marinho.png",
    featured: true,
    variants: ["PP", "P", "M", "G", "GG"],
  },
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
  console.log(`Preparando categoria "${CATEGORY.name}"...`);
  const category = await prisma.category.upsert({
    where: { slug: CATEGORY.slug },
    update: {},
    create: {
      name: CATEGORY.name,
      slug: CATEGORY.slug,
      order: CATEGORY.order,
    },
  });
  console.log(`Categoria pronta (id: ${category.id}).`);

  let created = 0;
  let skipped = 0;

  for (const p of trajesProducts) {
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
        targetGender: "feminino",
        images: JSON.stringify([p.image]),
        featured: p.featured || false,
        categoryId: category.id,
        variants: p.variants
          ? { create: p.variants.map((label) => ({ label, stock: 10 })) }
          : undefined,
      },
    });
    console.log(`  + Criado: ${p.name} (${slug})`);
    created++;
  }

  console.log(
    `Seed "Trajes Femininos" concluído. Criados: ${created}, pulados: ${skipped}.`
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
