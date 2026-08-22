import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { name: "Anéis", slug: "aneis", order: 1, image: "/products/placeholder-aneis.svg" },
  { name: "Colares", slug: "colares", order: 2, image: "/products/placeholder-colares.svg" },
  { name: "Brincos", slug: "brincos", order: 3, image: "/products/placeholder-brincos.svg" },
  { name: "Pulseiras", slug: "pulseiras", order: 4, image: "/products/placeholder-pulseiras.svg" },
  { name: "Relógios", slug: "relogios", order: 5, image: "/products/placeholder-relogios.svg" },
  { name: "Alianças", slug: "aliancas", order: 6, image: "/products/placeholder-aliancas.svg" },
];

const productsByCategory: Record<
  string,
  { name: string; description: string; material: string; priceCents: number; featured?: boolean; variants?: string[] }[]
> = {
  aneis: [
    {
      name: "Anel Solitário Ouro 18k",
      description: "Anel solitário em ouro amarelo 18k com zircônia lapidação brilhante, acabamento polido espelhado.",
      material: "Ouro 18k",
      priceCents: 249900,
      featured: true,
      variants: ["Aro 14", "Aro 16", "Aro 18", "Aro 20"],
    },
    {
      name: "Anel Meia Aliança Cravejado",
      description: "Meia aliança em ouro 18k cravejada com zircônias em fileira, design clássico e atemporal.",
      material: "Ouro 18k",
      priceCents: 349900,
      variants: ["Aro 14", "Aro 16", "Aro 18"],
    },
    {
      name: "Anel Prata 925 Nó Infinito",
      description: "Anel em prata 925 com design nó infinito, acabamento rodinado que evita oxidação.",
      material: "Prata 925",
      priceCents: 29900,
      variants: ["Aro 14", "Aro 16", "Aro 18", "Aro 20"],
    },
    {
      name: "Anel Duo Ouro e Ródio Negro",
      description: "Anel bicolor combinando ouro 18k e ródio negro, design contemporâneo e sofisticado.",
      material: "Ouro 18k",
      priceCents: 499900,
      variants: ["Aro 16", "Aro 18", "Aro 20"],
    },
  ],
  colares: [
    {
      name: "Colar Gravata Veneziana Ouro 18k",
      description: "Colar corrente veneziana em ouro 18k, elos finos e brilho intenso, 45cm de comprimento.",
      material: "Ouro 18k",
      priceCents: 399900,
      featured: true,
    },
    {
      name: "Colar Ponto de Luz Diamante",
      description: "Colar ponto de luz em ouro branco 18k com diamante natural lapidação brilhante 10pts.",
      material: "Ouro Branco 18k",
      priceCents: 189900,
    },
    {
      name: "Colar Prata 925 Coração Vazado",
      description: "Colar delicado em prata 925 com pingente coração vazado, corrente cadeado ajustável.",
      material: "Prata 925",
      priceCents: 19900,
    },
    {
      name: "Colar Choker Folheado a Ouro",
      description: "Choker moderno folheado a ouro 18k, fecho reforçado, acabamento antialérgico.",
      material: "Folheado a ouro",
      priceCents: 14900,
    },
  ],
  brincos: [
    {
      name: "Brinco Argola Média Ouro 18k",
      description: "Argola média em ouro amarelo 18k, tubo oco leve para conforto no uso diário.",
      material: "Ouro 18k",
      priceCents: 159900,
      featured: true,
    },
    {
      name: "Brinco Ponto de Luz Zircônia",
      description: "Brinco solitário ponto de luz em ouro 18k com zircônia, tarraxa de rosca segura.",
      material: "Ouro 18k",
      priceCents: 89900,
    },
    {
      name: "Brinco Prata 925 Gota Cristal",
      description: "Brinco pendente em prata 925 com cristal facetado em formato gota.",
      material: "Prata 925",
      priceCents: 24900,
    },
    {
      name: "Brinco Ear Cuff Folheado",
      description: "Ear cuff folheado a ouro 18k, dispensa furo na orelha, ajuste flexível.",
      material: "Folheado a ouro",
      priceCents: 12900,
    },
  ],
  pulseiras: [
    {
      name: "Pulseira Elos Cartier Ouro 18k",
      description: "Pulseira estilo elos cartier em ouro 18k maciço, fecho mosquetão reforçado.",
      material: "Ouro 18k",
      priceCents: 459900,
      featured: true,
      variants: ["16cm", "18cm", "20cm"],
    },
    {
      name: "Pulseira Riviera Zircônias",
      description: "Pulseira riviera em ouro 18k cravejada com zircônias em toda extensão.",
      material: "Ouro 18k",
      priceCents: 329900,
      variants: ["16cm", "18cm"],
    },
    {
      name: "Pulseira Prata 925 Berloques",
      description: "Pulseira em prata 925 com berloques removíveis, ajustável em 3 tamanhos.",
      material: "Prata 925",
      priceCents: 34900,
      variants: ["16cm", "18cm", "20cm"],
    },
    {
      name: "Bracelete Rígido Folheado a Ouro",
      description: "Bracelete rígido folheado a ouro 18k, abertura articulada e acabamento brilhante.",
      material: "Folheado a ouro",
      priceCents: 17900,
    },
  ],
  relogios: [
    {
      name: "Relógio Feminino Ouro Rosé",
      description: "Relógio analógico banhado a ouro rosé 18k, pulseira em malha milanesa, resistente à água.",
      material: "Banhado a ouro rosé",
      priceCents: 899900,
      featured: true,
    },
    {
      name: "Relógio Masculino Aço Premium",
      description: "Relógio masculino em aço inoxidável com mostrador preto, movimento quartzo suíço.",
      material: "Aço inoxidável",
      priceCents: 129900,
    },
    {
      name: "Relógio Bicolor Ouro e Aço",
      description: "Relógio unissex bicolor combinando aço e detalhes banhados a ouro 18k.",
      material: "Aço e ouro 18k",
      priceCents: 249900,
    },
    {
      name: "Relógio Slim Couro Legítimo",
      description: "Relógio slim com caixa fina, pulseira em couro legítimo e mostrador minimalista.",
      material: "Aço e couro",
      priceCents: 79900,
    },
  ],
  aliancas: [
    {
      name: "Aliança Clássica Ouro 18k 4mm",
      description: "Par de alianças clássicas em ouro amarelo 18k, largura 4mm, acabamento polido. Preço unitário.",
      material: "Ouro 18k",
      priceCents: 389900,
      featured: true,
      variants: ["Aro 14", "Aro 16", "Aro 18", "Aro 20", "Aro 22"],
    },
    {
      name: "Aliança Diamantada Ouro Branco",
      description: "Aliança em ouro branco 18k com friso diamantado central, brilho refinado. Preço unitário.",
      material: "Ouro Branco 18k",
      priceCents: 449900,
      variants: ["Aro 14", "Aro 16", "Aro 18", "Aro 20"],
    },
    {
      name: "Aliança Anatômica Bicolor",
      description: "Aliança anatômica bicolor ouro amarelo e branco 18k, conforto para uso prolongado. Preço unitário.",
      material: "Ouro 18k",
      priceCents: 419900,
      variants: ["Aro 16", "Aro 18", "Aro 20"],
    },
    {
      name: "Aliança Prata 925 Compromisso",
      description: "Aliança em prata 925 rodinada, opção acessível para compromisso. Preço unitário.",
      material: "Prata 925",
      priceCents: 59900,
      variants: ["Aro 14", "Aro 16", "Aro 18", "Aro 20"],
    },
  ],
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function main() {
  console.log("Limpando dados existentes...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  console.log("Criando categorias...");
  const categoryMap: Record<string, string> = {};
  for (const cat of categories) {
    const created = await prisma.category.create({
      data: { name: cat.name, slug: cat.slug, order: cat.order },
    });
    categoryMap[cat.slug] = created.id;
  }

  console.log("Criando produtos...");
  for (const [catSlug, products] of Object.entries(productsByCategory)) {
    const categoryId = categoryMap[catSlug];
    const image = categories.find((c) => c.slug === catSlug)!.image;

    for (const p of products) {
      const slug = slugify(p.name);
      await prisma.product.create({
        data: {
          name: p.name,
          slug,
          description: p.description,
          material: p.material,
          priceCents: p.priceCents,
          images: JSON.stringify([image]),
          featured: p.featured || false,
          categoryId,
          variants: p.variants
            ? { create: p.variants.map((label) => ({ label, stock: 10 })) }
            : undefined,
        },
      });
    }
  }

  console.log("Seed concluído com sucesso.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
