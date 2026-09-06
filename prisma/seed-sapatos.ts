import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type ShoeProduct = {
  name: string;
  description: string;
  material: string;
  priceCents: number;
  image: string;
  featured?: boolean;
};

const categoryData = {
  name: "Sapatos",
  slug: "sapatos",
  order: 10,
};

const sizes = ["34", "35", "36", "37", "38", "39", "40"];

const shoes: ShoeProduct[] = [
  {
    name: "Scarpin Clássico em Couro Preto",
    description: "Scarpin de bico fino em couro preto, com salto alto elegante e acabamento refinado. Um essencial para produções formais.",
    material: "Couro legítimo",
    priceCents: 34990,
    image: "/products/sapato-scarpin-couro-preto.png",
    featured: true,
  },
  {
    name: "Scarpin Slingback Verniz Marsala",
    description: "Slingback em verniz marsala com bico fino, salto médio e fivela ajustável. Um toque de cor sofisticado para o look.",
    material: "Verniz premium",
    priceCents: 29990,
    image: "/products/sapato-slingback-verniz-marsala.png",
  },
  {
    name: "Scarpin Salto Bloco Couro Bege",
    description: "Scarpin bege em couro de bico fino e salto bloco médio. Une elegância e estabilidade para a rotina profissional.",
    material: "Couro legítimo",
    priceCents: 32990,
    image: "/products/sapato-scarpin-salto-bloco-bege.png",
  },
  {
    name: "Mocassim Couro Preto com Bridão",
    description: "Mocassim em couro preto com bridão dourado e acabamento polido. Clássico, confortável e versátil para o escritório.",
    material: "Couro legítimo e metal dourado",
    priceCents: 31990,
    image: "/products/sapato-mocassim-couro-preto.png",
    featured: true,
  },
  {
    name: "Mule Couro Caramelo Salto Médio",
    description: "Mule em couro caramelo com bico fino e salto bloco médio. Leveza e sofisticação para completar produções elegantes.",
    material: "Couro legítimo",
    priceCents: 32990,
    image: "/products/sapato-mule-couro-caramelo.png",
  },
  {
    name: "Oxford Verniz Preto",
    description: "Oxford feminino em verniz preto com cadarço e salto baixo. Um modelo atemporal, ideal para visuais de alfaiataria.",
    material: "Verniz premium",
    priceCents: 29990,
    image: "/products/sapato-oxford-verniz-preto.png",
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

  for (const shoe of shoes) {
    const slug = slugify(shoe.name);
    const data = {
      name: shoe.name,
      description: shoe.description,
      material: shoe.material,
      priceCents: shoe.priceCents,
      targetGender: "feminino",
      images: JSON.stringify([shoe.image]),
      featured: shoe.featured ?? false,
      categoryId: category.id,
    };

    await prisma.product.upsert({
      where: { slug },
      update: data,
      create: {
        ...data,
        slug,
        variants: {
          create: sizes.map((label) => ({ label, stock: 10 })),
        },
      },
    });
  }

  console.log(`Seed "${categoryData.name}" concluído com ${shoes.length} produtos.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });