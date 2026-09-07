import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type MasculinoProduct = {
  name: string;
  description: string;
  material: string;
  priceCents: number;
  images: string[];
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
    name: "Abotoadura Vivara Man em Prata 925 com Ródio Negro",
    description:
      "Par de abotoaduras em prata 925 com acabamento em ródio negro e design geométrico. O toque final para camisas de punho duplo em ocasiões formais.",
    material: "Prata 925 e ródio negro",
    priceCents: 89000,
    images: [
      "/products/masculino-abotoadura-prata-rodio-negro-1.png",
      "/products/masculino-abotoadura-prata-rodio-negro-2.png",
    ],
    featured: true,
    variants: ["Único"],
  },
  {
    name: "Porta-Cartão Vivara Man em Couro Preto",
    description:
      "Porta-cartão slim em couro legítimo preto, com acabamento minimalista e placa metálica. Praticidade e sofisticação no bolso.",
    material: "Couro legítimo",
    priceCents: 29000,
    images: [
      "/products/masculino-porta-cartao-couro-preto-1.png",
      "/products/masculino-porta-cartao-couro-preto-2.png",
    ],
    variants: ["Único"],
  },
  {
    name: "Porta-Passaporte Vivara Man em Couro Marrom",
    description:
      "Porta-passaporte em couro legítimo marrom com textura natural. Um companheiro elegante para viagens de negócios e lazer.",
    material: "Couro legítimo",
    priceCents: 35000,
    images: [
      "/products/masculino-porta-passaporte-couro-marrom-1.png",
      "/products/masculino-porta-passaporte-couro-marrom-2.png",
    ],
    variants: ["Único"],
  },
  {
    name: "Caneta Vivara Man em Aço e Resina Preta",
    description:
      "Caneta esferográfica em aço escovado com corpo em resina preta. Um item de assinatura para mesas de reunião e presentes corporativos.",
    material: "Aço inoxidável e resina",
    priceCents: 42000,
    images: [
      "/products/masculino-caneta-aco-resina-preta-1.png",
      "/products/masculino-caneta-aco-resina-preta-2.png",
    ],
    variants: ["Único"],
  },
  {
    name: "Chaveiro Vivara Man Trançado em Couro e Prata 925",
    description:
      "Chaveiro trançado em couro legítimo com argola e detalhe em prata 925. Um acessório discreto e resistente para o dia a dia.",
    material: "Couro trançado e prata 925",
    priceCents: 32000,
    images: [
      "/products/masculino-chaveiro-trancado-couro-prata-1.png",
      "/products/masculino-chaveiro-trancado-couro-prata-2.png",
    ],
    variants: ["Único"],
  },
  {
    name: "Relógio Vivara Man Automático Aço Preto",
    description:
      "Relógio automático masculino com caixa e pulseira em aço preto, mostrador preto com janela de data. Precisão e presença em um só instrumento.",
    material: "Aço inoxidável e cristal mineral",
    priceCents: 189000,
    images: [
      "/products/masculino-relogio-automatico-aco-preto-1.png",
      "/products/masculino-relogio-automatico-aco-preto-2.png",
    ],
    featured: true,
    variants: ["Único"],
  },
  {
    name: "Relógio Vivara Man Couro Marrom Fundo Branco",
    description:
      "Relógio de vestir com pulseira em couro marrom, caixa em aço e mostrador branco de marcadores finos. Discrição elegante para o traje social.",
    material: "Couro legítimo, aço e cristal mineral",
    priceCents: 69000,
    images: [
      "/products/masculino-relogio-couro-marrom-fundo-branco-1.png",
      "/products/masculino-relogio-couro-marrom-fundo-branco-2.png",
    ],
    variants: ["Único"],
  },
  {
    name: "Pulseira Vivara Man Elos Cartier em Prata 925",
    description:
      "Pulseira em prata 925 com elos cartier polidos, design atemporal que combina com relógios e composições formais.",
    material: "Prata 925",
    priceCents: 45000,
    images: [
      "/products/masculino-pulseira-cartier-prata-1.png",
      "/products/masculino-pulseira-cartier-prata-2.png",
    ],
    variants: ["18 cm", "19 cm", "20 cm", "21 cm"],
  },
  {
    name: "Pulseira Vivara Man Couro Trançado Marrom com Aço",
    description:
      "Pulseira masculina em couro trançado marrom com fecho magnético em aço escovado. Textura marcante para o uso casual e social.",
    material: "Couro trançado e aço inoxidável",
    priceCents: 18000,
    images: [
      "/products/masculino-pulseira-couro-trancado-marrom-aco-1.png",
      "/products/masculino-pulseira-couro-trancado-marrom-aco-2.png",
    ],
    variants: ["18 cm", "19 cm", "20 cm", "21 cm"],
  },
  {
    name: "Corrente Vivara Man Grumet em Prata 925, 60 cm",
    description:
      "Corrente masculina em prata 925 com malha grumet e acabamento polido de alto brilho. Uma base clássica para pingentes ou uso solo.",
    material: "Prata 925",
    priceCents: 39000,
    images: [
      "/products/masculino-corrente-grumet-prata-1.png",
      "/products/masculino-corrente-grumet-prata-2.png",
    ],
    variants: ["60 cm"],
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
      images: JSON.stringify(product.images),
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

  console.log(
    `Seed "${categoryData.name} (parte 2)" concluído com ${masculinoProducts.length} produtos.`
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
