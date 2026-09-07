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

// Tamanhos de blazer/sobretudo seguem a numeração de terno brasileira
const TAMANHOS_BLAZER = ["46", "48", "50", "52", "54", "56"];
const TAMANHOS_TRICOT = ["P", "M", "G", "GG", "XGG"];

const masculinoProducts: MasculinoProduct[] = [
  {
    name: "Blazer Slim Fit em Lã Fria Preto",
    description:
      "Blazer masculino slim fit em lã fria preta, com lapela entalhada e fechamento de dois botões. Caimento impecável e forro interno acetinado — a peça-chave para eventos formais e reuniões de negócios.",
    material: "Lã fria com forro em viscose",
    priceCents: 54900,
    images: [
      "/products/masculino-blazer-slim-la-preto-1.png",
      "/products/masculino-blazer-slim-la-preto-2.png",
    ],
    featured: true,
    variants: TAMANHOS_BLAZER,
  },
  {
    name: "Blazer Slim Fit Marinho Lapela Fosca",
    description:
      "Blazer slim fit em azul marinho com lapela de acabamento fosco e ombros estruturados. Versátil o suficiente para compor do traje social ao smart casual.",
    material: "Lã com elastano e forro em viscose",
    priceCents: 56900,
    images: [
      "/products/masculino-blazer-slim-marinho-1.png",
      "/products/masculino-blazer-slim-marinho-2.png",
    ],
    featured: true,
    variants: TAMANHOS_BLAZER,
  },
  {
    name: "Blazer Algodão com Elastano Grafite",
    description:
      "Blazer masculino em algodão com elastano na cor grafite, corte moderno e bolsos laterais com aba. Conforto de elastano com a estrutura de um blazer sob medida.",
    material: "Algodão com elastano",
    priceCents: 49900,
    images: [
      "/products/masculino-blazer-algodao-grafite-1.png",
      "/products/masculino-blazer-algodao-grafite-2.png",
    ],
    variants: TAMANHOS_BLAZER,
  },
  {
    name: "Blazer Xadrez Príncipe de Gales Cinza",
    description:
      "Blazer em padronagem xadrez Príncipe de Gales nos tons cinza e grafite, com alfaiataria de inspiração britânica. Personalidade e elegância na mesma peça.",
    material: "Lã com padronagem Príncipe de Gales",
    priceCents: 62900,
    images: [
      "/products/masculino-blazer-xadrez-principe-gales-1.png",
      "/products/masculino-blazer-xadrez-principe-gales-2.png",
    ],
    variants: TAMANHOS_BLAZER,
  },
  {
    name: "Sobretudo Longo em Lã Camel",
    description:
      "Sobretudo masculino longo em lã na cor camel, transpassado simples com lapela entalhada e comprimento até o joelho. A sobreposição definitiva para o inverno elegante.",
    material: "Lã batida com forro interno",
    priceCents: 89900,
    images: [
      "/products/masculino-sobretudo-la-camel-1.png",
      "/products/masculino-sobretudo-la-camel-2.png",
    ],
    featured: true,
    variants: TAMANHOS_BLAZER,
  },
  {
    name: "Trench Coat Bege Masculino",
    description:
      "Trench coat masculino em gabardine bege, transpassado duplo com cinto, ombreiras e capa protetora. Um clássico atemporal do guarda-roupa masculino.",
    material: "Gabardine de algodão",
    priceCents: 79900,
    images: [
      "/products/masculino-trench-coat-bege-1.png",
      "/products/masculino-trench-coat-bege-2.png",
    ],
    variants: TAMANHOS_BLAZER,
  },
  {
    name: "Casaco Tricot Gola Alta Preto",
    description:
      "Casaco masculino em tricô de lã merino preta com gola alta canelada. Toque macio e caimento refinado para compor por baixo do blazer ou usar sozinho.",
    material: "Lã merino",
    priceCents: 29900,
    images: [
      "/products/masculino-casaco-tricot-gola-alta-preto-1.png",
      "/products/masculino-casaco-tricot-gola-alta-preto-2.png",
    ],
    variants: TAMANHOS_TRICOT,
  },
  {
    name: "Blazer Smoking em Veludo Verde Escuro",
    description:
      "Blazer smoking em veludo verde escuro com lapela xale em cetim preto. Feito para casamentos, galas e noites em que se espera presença.",
    material: "Veludo de algodão com lapela em cetim",
    priceCents: 69900,
    images: [
      "/products/masculino-blazer-veludo-verde-1.png",
      "/products/masculino-blazer-veludo-verde-2.png",
    ],
    featured: true,
    variants: TAMANHOS_BLAZER,
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
    `Seed "${categoryData.name} (parte 3 - blazers e casacos)" concluído com ${masculinoProducts.length} produtos.`
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
