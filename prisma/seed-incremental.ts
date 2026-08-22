// V.CLOSET - Seed incremental
// Adiciona novos produtos às categorias existentes "aliancas" e "aneis"
// SEM apagar dados existentes. Usa upsert por slug (idempotente).
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type NewProduct = {
  name: string;
  description: string;
  material: string;
  priceCents: number;
  image: string;
  featured?: boolean;
  variants?: string[];
};

const ARO_VARIANTS = [
  "Aro 14",
  "Aro 16",
  "Aro 18",
  "Aro 20",
  "Aro 22",
  "Aro 24",
  "Aro 26",
];

// Faixas de preço pesquisadas no site da Vivara (joalheria premium) para
// alianças (ex.: Aliança Kisses 4mm R$ 3.250, Aliança Essence 3,6mm R$ 4.650,
// alianças finas a partir de ~R$ 1.390) e anéis solitários com diamante
// (de ~R$ 2.900 a R$ 5.000+ dependendo de quilates), usadas como referência
// para os preços abaixo.
const newProductsByCategory: Record<string, NewProduct[]> = {
  aliancas: [
    {
      name: "Aliança Clássica Ouro 18k 2mm",
      description:
        "Aliança clássica em ouro amarelo 18k, largura 2mm, perfil fino e acabamento polido espelhado. Preço unitário.",
      material: "Ouro 18k",
      priceCents: 139000,
      image: "/products/alianca-classica-ouro-18k-2mm.png",
      variants: ARO_VARIANTS,
    },
    {
      name: "Aliança Anatômica Ouro Branco 18k 3mm",
      description:
        "Aliança anatômica em ouro branco 18k, largura 3mm, perfil meia-cana que garante conforto no uso diário.",
      material: "Ouro Branco 18k",
      priceCents: 289000,
      image: "/products/alianca-anatomica-ouro-branco-3mm.png",
      variants: ARO_VARIANTS,
    },
    {
      name: "Aliança Clássica Ouro Rosé 18k 4mm",
      description:
        "Aliança em ouro rosé 18k, largura 4mm, acabamento polido arredondado, tom romântico e contemporâneo.",
      material: "Ouro Rosé 18k",
      priceCents: 345000,
      featured: true,
      image: "/products/alianca-classica-ouro-rose-4mm.png",
      variants: ARO_VARIANTS,
    },
    {
      name: "Aliança Trabalhada com Diamantes Ouro 18k 5mm",
      description:
        "Aliança em ouro amarelo 18k cravejada com fileira de diamantes, largura 5mm, brilho contínuo e sofisticado. Preço unitário.",
      material: "Ouro 18k",
      priceCents: 489000,
      featured: true,
      image: "/products/alianca-cravejada-diamantes-ouro-18k-5mm.png",
      variants: ARO_VARIANTS,
    },
    {
      name: "Aliança Prata 925 2mm",
      description:
        "Aliança em prata 925 com banho rodinado antioxidante, largura 2mm, opção acessível e elegante para o dia a dia.",
      material: "Prata 925",
      priceCents: 99000,
      image: "/products/alianca-prata-925-2mm.png",
      variants: ARO_VARIANTS,
    },
    {
      name: "Aliança Trabalhada Ouro 18k 6mm",
      description:
        "Aliança larga em ouro amarelo 18k, 6mm, com friso trabalhado à mão em relevo, design exclusivo e presença marcante.",
      material: "Ouro 18k",
      priceCents: 465000,
      image: "/products/alianca-trabalhada-ouro-18k-6mm.png",
      variants: ARO_VARIANTS,
    },
  ],
  aneis: [
    {
      name: "Anel Solitário Ouro 18k Diamante 20pts",
      description:
        "Anel solitário em ouro amarelo 18k com diamante natural central de 20 pontos, lapidação brilhante, garra clássica em 4 pontas.",
      material: "Ouro 18k",
      priceCents: 389000,
      featured: true,
      image: "/products/anel-solitario-ouro-18k-diamante.png",
      variants: ARO_VARIANTS,
    },
    {
      name: "Anel Solitário Ouro Branco 18k Diamante 15pts",
      description:
        "Anel solitário em ouro branco 18k com diamante natural de 15 pontos, engaste delicado em garras, acabamento rodinado.",
      material: "Ouro Branco 18k",
      priceCents: 329000,
      image: "/products/anel-solitario-ouro-branco-diamante.png",
      variants: ARO_VARIANTS,
    },
    {
      name: "Anel Solitário Prata Zircônia",
      description:
        "Anel solitário em prata 925 com zircônia lapidação redonda, banho rodinado, opção acessível com brilho de diamante.",
      material: "Prata 925",
      priceCents: 34900,
      image: "/products/anel-solitario-prata-zirconia.png",
      variants: ARO_VARIANTS,
    },
    {
      name: "Anel Solitário Ouro Rosé 18k Diamante 30pts",
      description:
        "Anel solitário em ouro rosé 18k com diamante natural de 30 pontos, design minimalista de haste fina que valoriza a pedra central.",
      material: "Ouro Rosé 18k",
      priceCents: 549000,
      featured: true,
      image: "/products/anel-solitario-ouro-rose-diamante.png",
      variants: ARO_VARIANTS,
    },
    {
      name: "Anel Solitário Ouro 18k Diamante Petite 10pts",
      description:
        "Anel solitário petite em ouro amarelo 18k com diamante natural de 10 pontos, haste fina, ideal para uso sobreposto.",
      material: "Ouro 18k",
      priceCents: 219000,
      image: "/products/anel-solitario-ouro-18k-diamante-petite.png",
      variants: ARO_VARIANTS,
    },
    {
      name: "Anel Solitário Prata Zircônia Princesa",
      description:
        "Anel solitário em prata 925 com zircônia lapidação princesa (quadrada), design moderno e brilho intenso.",
      material: "Prata 925",
      priceCents: 44900,
      image: "/products/anel-solitario-prata-zirconia-princess.png",
      variants: ARO_VARIANTS,
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
  for (const [catSlug, products] of Object.entries(newProductsByCategory)) {
    const category = await prisma.category.findUnique({ where: { slug: catSlug } });
    if (!category) {
      console.error(`Categoria com slug "${catSlug}" não encontrada. Pulando.`);
      continue;
    }

    console.log(`Inserindo produtos na categoria "${category.name}" (${catSlug})...`);

    for (const p of products) {
      const slug = slugify(p.name);
      const existing = await prisma.product.findUnique({ where: { slug } });
      if (existing) {
        console.log(`  - Já existe, pulando: ${p.name}`);
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
          variants: p.variants
            ? { create: p.variants.map((label) => ({ label, stock: 10 })) }
            : undefined,
        },
      });
      console.log(`  + Criado: ${p.name} (${slug})`);
    }
  }

  console.log("Seed incremental concluído com sucesso.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
