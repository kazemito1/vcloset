// V.CLOSET - Seed incremental da categoria TRAJES (conjuntos, blazers e
// alfaiataria sofisticada, com preços no padrão do mercado — referência Amaro).
// Idempotente via upsert por slug; não apaga nenhum dado existente.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORY = {
  name: "Trajes",
  slug: "trajes",
  order: 8,
};

// Preços em centavos, espelhando a faixa praticada pelo Amaro
// (blazers R$ 300–400, conjuntos R$ 440–500, calça/vestido R$ 200–260).
const PRODUCTS = [
  {
    slug: "blazer-alfaiataria-cropped-off-white",
    name: "Blazer Alfaiataria Cropped Off-White",
    description:
      "Blazer cropped de alfaiataria estruturada em off-white, com ombros marcados e botões dourados. Peça versátil que transita do escritório ao jantar com elegância.",
    material: "65% Poliéster Reciclado, 33% Viscose, 2% Elastano",
    priceCents: 29990,
    images: ["/products/traje-blazer-cropped-off-white.svg"],
  },
  {
    slug: "blazer-longo-alfaiataria-preto",
    name: "Blazer Longo Alfaiataria Preto",
    description:
      "Blazer longo de corte reto em tecido de alfaiataria premium preto. Silhueta fluida e sofisticada, perfeito para composições monochrome de impacto.",
    material: "70% Poliéster, 27% Viscose, 3% Elastano",
    priceCents: 34990,
    images: ["/products/traje-blazer-longo-preto.svg"],
  },
  {
    slug: "conjunto-alfaiataria-bege",
    name: "Conjunto Alfaiataria Bege (Blazer + Calça)",
    description:
      "Conjunto de alfaiataria em tom bege areia: blazer de corte relaxed com calça pantalona de cintura alta no mesmo tecido. Elegância atemporal em peça única.",
    material: "68% Poliéster, 30% Viscose, 2% Elastano",
    priceCents: 49990,
    images: ["/products/traje-conjunto-alfaiataria-bege.svg"],
  },
  {
    slug: "conjunto-trico-canelado-caramelo",
    name: "Conjunto Tricô Canelado Caramelo",
    description:
      "Conjunto dois-peças em tricô canelado caramelo: top estruturado e saia midi de cintura alta. Conforto sofisticado com caimento que valoriza a silhueta.",
    material: "52% Viscose, 45% Poliamida, 3% Elastano",
    priceCents: 43990,
    images: ["/products/traje-conjunto-trico-caramelo.svg"],
  },
  {
    slug: "calca-pantalona-alfaiataria-preta",
    name: "Calça Pantalona Alfaiataria Preta",
    description:
      "Calça pantalona de alfaiataria com cintura alta, pregas frontais e caimento amplo. Coringa do guarda-roupa, eleva qualquer produção.",
    material: "64% Poliéster, 34% Viscose, 2% Elastano",
    priceCents: 19990,
    images: ["/products/traje-calca-pantalona-preta.svg"],
  },
  {
    slug: "vestido-midi-alfaiataria",
    name: "Vestido Midi Alfaiataria",
    description:
      "Vestido midi de alfaiataria com decote transpassado, cintura marcada e saia estruturada. Sofisticação minimalista para ocasiões especiais.",
    material: "66% Poliéster, 32% Viscose, 2% Elastano",
    priceCents: 25990,
    images: ["/products/traje-vestido-midi-alfaiataria.svg"],
  },
];

async function main() {
  const category = await prisma.category.upsert({
    where: { slug: CATEGORY.slug },
    update: { name: CATEGORY.name },
    create: CATEGORY,
  });
  console.log(`Categoria ${category.name} (${category.slug}) ok.`);

  for (const product of PRODUCTS) {
    const existing = await prisma.product.findUnique({
      where: { slug: product.slug },
    });

    if (existing) {
      console.log(`Produto ${product.slug} já existe — mantido.`);
      continue;
    }

    await prisma.product.create({
      data: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        material: product.material,
        priceCents: product.priceCents,
        images: JSON.stringify(product.images),
        categoryId: category.id,
      },
    });
    console.log(`Produto ${product.name} criado.`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
