// V.CLOSET - Seed incremental 2
// Adiciona 1 produto novo (com foto gerada) para cada categoria que ainda
// não tinha foto real de boa qualidade: colares, brincos, pulseiras, relógios.
// Categorias "aneis" e "aliancas" já foram cobertas em seed-incremental.ts.
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

// Faixas de preço pesquisadas no site da Vivara (joalheria premium) usadas
// como referência:
// - Colar ponto de luz ouro 18k: ~R$ 1.900 - R$ 2.400
// - Argola ouro 18k: ~R$ 1.500 - R$ 7.850 (varia com diamantes/tamanho)
// - Pulseira riviera/tênis com diamantes: ~R$ 3.000 - R$ 20.000+ (varia com quilates)
// - Relógio feminino aço dourado: ~R$ 950 - R$ 1.390
const newProductsByCategory: Record<string, NewProduct[]> = {
  colares: [
    {
      name: "Colar Ponto de Luz Ouro 18k",
      description:
        "Colar ponto de luz em ouro amarelo 18k com diamante natural lapidação brilhante de 10 pontos, corrente cadeado ajustável de 40cm a 45cm, acabamento polido espelhado.",
      material: "Ouro 18k",
      priceCents: 219000,
      featured: true,
      image: "/products/colar-ponto-de-luz-ouro-18k.png",
    },
  ],
  brincos: [
    {
      name: "Brinco Argola Ouro 18k",
      description:
        "Brinco argola em ouro amarelo 18k, tubo oco leve, fecho de pressão seguro, acabamento polido espelhado. Par.",
      material: "Ouro 18k",
      priceCents: 179000,
      featured: true,
      image: "/products/brinco-argola-ouro-18k.png",
    },
  ],
  pulseiras: [
    {
      name: "Pulseira Tênis Diamantes",
      description:
        "Pulseira tênis (riviera) em ouro branco 18k cravejada com diamantes naturais lapidação brilhante em toda extensão, fecho oitavo de segurança.",
      material: "Ouro Branco 18k",
      priceCents: 429000,
      featured: true,
      image: "/products/pulseira-tenis-diamantes.png",
      variants: ["16cm", "18cm", "20cm"],
    },
  ],
  relogios: [
    {
      name: "Relógio Feminino Aço Dourado",
      description:
        "Relógio feminino em aço inoxidável banhado a ouro dourado, caixa fina, mostrador madrepérola, resistente à água, movimento quartzo preciso.",
      material: "Aço Dourado",
      priceCents: 139000,
      featured: true,
      image: "/products/relogio-feminino-aco-dourado.png",
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

  console.log("Seed incremental 2 concluído com sucesso.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
