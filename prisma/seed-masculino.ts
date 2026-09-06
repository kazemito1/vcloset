import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type MasculinoProduct = {
  name: string;
  description: string;
  material: string;
  priceCents: number;
  image: string;
  featured?: boolean;
  variants: string[];
};

const categoryData = {
  name: "Masculino",
  slug: "masculino",
  order: 9,
};

const masculinoProducts: MasculinoProduct[] = [
  {
    name: "Anel Vivara Man em Prata 925 com Ródio Negro e Quartzo",
    description: "Anel masculino em prata 925 com acabamento em ródio negro e quartzo escuro. Uma peça marcante para composições contemporâneas.",
    material: "Prata 925, ródio negro e quartzo",
    priceCents: 109000,
    image: "/products/masculino-anel-signet-prata-onix.png",
    featured: true,
    variants: ["15", "16", "17", "18", "19", "20", "22"],
  },
  {
    name: "Anel Square em Prata 925 com Ródio Negro e Esmalte",
    description: "Anel de assinatura em prata 925, ródio negro e detalhe esmaltado geométrico. Design urbano para uso diário.",
    material: "Prata 925, ródio negro e esmalte",
    priceCents: 55000,
    image: "/products/masculino-anel-square-prata-rodio-negro.png",
    variants: ["15", "16", "17", "18", "19", "20", "22"],
  },
  {
    name: "Anel Origem em Ouro Amarelo 18k",
    description: "Anel masculino em ouro amarelo 18k, de perfil reto e acabamento acetinado. Elegância essencial e atemporal.",
    material: "Ouro amarelo 18k",
    priceCents: 649000,
    image: "/products/masculino-alianca-ouro-amarelo.png",
    featured: true,
    variants: ["15", "16", "17", "18", "19", "20", "22"],
  },
  {
    name: "Pulseira Masculina em Couro e Aço",
    description: "Pulseira masculina de couro preto com fecho de aço polido. Um acessório versátil com acabamento sofisticado.",
    material: "Couro e aço inoxidável",
    priceCents: 39000,
    image: "/products/masculino-pulseira-couro-aco.png",
    variants: ["18 cm", "19 cm", "20 cm", "21 cm"],
  },
  {
    name: "Pulseira Origem em Prata 925",
    description: "Pulseira em prata 925 com elos marcantes e acabamento polido. Presença e personalidade em uma joia clássica.",
    material: "Prata 925",
    priceCents: 115000,
    image: "/products/masculino-pulseira-grumet-prata.png",
    variants: ["18 cm", "19 cm", "20 cm", "21 cm"],
  },
  {
    name: "Pulseira Forza em Prata 925 com Ródio Negro",
    description: "Pulseira masculina em couro trançado, prata 925 e ródio negro. Texturas contrastantes para um visual moderno.",
    material: "Prata 925, ródio negro e couro",
    priceCents: 175000,
    image: "/products/masculino-pulseira-couro-prata.png",
    variants: ["18 cm", "19 cm", "20 cm", "21 cm"],
  },
  {
    name: "Corrente Life em Prata 925, 40 cm",
    description: "Corrente em prata 925 com malha torcida e brilho equilibrado. Uma base versátil para usar sozinha ou com pingentes.",
    material: "Prata 925",
    priceCents: 67000,
    image: "/products/masculino-corrente-prata-torcao.png",
    variants: ["40 cm"],
  },
  {
    name: "Colar Masculino em Aço Dourado, 60 cm",
    description: "Colar masculino de aço com banho dourado e corrente de elos clássicos. Acabamento refinado para looks de presença.",
    material: "Aço inoxidável com banho dourado",
    priceCents: 59000,
    image: "/products/masculino-corrente-ouro-figaro.png",
    variants: ["60 cm"],
  },
  {
    name: "Pingente Vivara Man em Prata 925, 35,5 mm",
    description: "Pingente em prata 925 com linhas geométricas e visual contemporâneo. Ideal para personalizar correntes masculinas.",
    material: "Prata 925",
    priceCents: 38500,
    image: "/products/masculino-pingente-prata-geometrico.png",
    variants: ["35,5 mm"],
  },
  {
    name: "Carteira Masculina Couro Preto",
    description: "Carteira masculina compacta em couro preto com acabamento minimalista. Organização e sofisticação em todos os detalhes.",
    material: "Couro legítimo",
    priceCents: 35000,
    image: "/products/masculino-carteira-couro-preta.png",
    variants: ["Único"],
  },
  {
    name: "Relógio Vivara Biomas Tapete Verde Masculino Aço",
    description: "Relógio masculino em aço com mostrador verde profundo, pulseira metálica e desenho versátil para diferentes ocasiões.",
    material: "Aço inoxidável e cristal mineral",
    priceCents: 95000,
    image: "/products/masculino-relogio-aco-verde.png",
    featured: true,
    variants: ["Único"],
  },
  {
    name: "Relógio Bulova Series B Masculino Silicone Azul 96B460N",
    description: "Relógio cronógrafo masculino com caixa em aço, mostrador azul e pulseira de silicone. Design esportivo de alta precisão.",
    material: "Aço inoxidável, silicone e cristal",
    priceCents: 469000,
    image: "/products/masculino-relogio-cronografo-preto.png",
    variants: ["Único"],
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
  const category = await prisma.category.upsert({
    where: { slug: categoryData.slug },
    update: { name: categoryData.name, order: categoryData.order },
    create: categoryData,
  });

  for (const product of masculinoProducts) {
    const slug = slugify(product.name);
    const data = {
      name: product.name,
      description: product.description,
      material: product.material,
      priceCents: product.priceCents,
      targetGender: "masculino",
      images: JSON.stringify([product.image]),
      featured: product.featured ?? false,
      categoryId: category.id,
    };

    await prisma.product.upsert({
      where: { slug },
      update: data,
      create: {
        ...data,
        slug,
        variants: {
          create: product.variants.map((label) => ({ label, stock: 10 })),
        },
      },
    });
  }

  console.log(`Seed "${categoryData.name}" concluído com ${masculinoProducts.length} produtos.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });