// V.CLOSET - Seed incremental 4
// Adiciona 15 produtos novos premium, distribuídos entre as 6 categorias
// existentes (aneis, aliancas, colares, brincos, pulseiras, relogios), cada
// um com foto still de catálogo gerada em public/products/.
// NÃO apaga dados existentes. Usa upsert por slug (idempotente).
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

const PULSEIRA_VARIANTS = ["16cm", "18cm", "20cm"];

// Faixas de preço pesquisadas em joalherias premium (referência de estilo e
// posicionamento de preço, ex.: Vivara — usado apenas como benchmark de
// mercado, sem qualquer uso de marca/logo nas peças ou imagens):
// - Meia aliança cravejada ouro 18k: ~R$ 3.500 - R$ 5.200
// - Anel vintage esmeralda + halo diamantes ouro 18k: ~R$ 6.500 - R$ 12.000
// - Anel duplo prata com zircônia: ~R$ 350 - R$ 650
// - Aliança bicolor fosco/polido ouro 18k: ~R$ 1.600 - R$ 2.400
// - Aliança tungstênio preta masculina: ~R$ 280 - R$ 550
// - Colar riviera diamantes ouro branco 18k: ~R$ 7.900 - R$ 15.000
// - Colar estrela prata com zircônia: ~R$ 650 - R$ 1.100
// - Brinco argola tubular ouro 18k: ~R$ 1.200 - R$ 1.800
// - Brinco solitário diamante ouro branco 18k (par): ~R$ 2.900 - R$ 4.200
// - Brinco gota vazada prata com zircônia: ~R$ 600 - R$ 950
// - Pulseira coração ouro rosé 18k: ~R$ 2.100 - R$ 3.200
// - Pulseira tênis prata com zircônia: ~R$ 900 - R$ 1.600
// - Bracelete martelado ouro 18k maciço: ~R$ 2.900 - R$ 4.500
// - Relógio masculino cronógrafo aço prata: ~R$ 1.590 - R$ 2.590
// - Relógio feminino slim couro branco ouro rosé: ~R$ 990 - R$ 1.690
const newProductsByCategory: Record<string, NewProduct[]> = {
  aneis: [
    {
      name: "Anel Eternity Diamantes Ouro 18k",
      description:
        "Anel meia aliança eternity em ouro amarelo 18k, cravejado com fileira contínua de diamantes naturais lapidação brilhante em rail setting, haste inferior lisa e confortável, acabamento polido espelhado.",
      material: "Ouro 18k",
      priceCents: 439000,
      featured: true,
      image: "/products/anel-eternity-diamantes-ouro-18k.png",
      variants: ARO_VARIANTS,
    },
    {
      name: "Anel Esmeralda Vintage Ouro 18k",
      description:
        "Anel vintage em ouro amarelo 18k com esmeralda natural lapidação esmeralda (retangular) como pedra central, halo de diamantes naturais ao redor e detalhes de filigrana trabalhados à mão na base, peça statement exclusiva.",
      material: "Ouro 18k",
      priceCents: 894000,
      featured: true,
      image: "/products/anel-esmeralda-vintage-ouro-18k.png",
      variants: ARO_VARIANTS,
    },
    {
      name: "Anel Duplo Trançado Prata 925 Zircônia",
      description:
        "Anel duplo em prata 925 com design trançado entrelaçado, cravejado com zircônias lapidação redonda nos vãos, banho ródio antioxidante, acabamento polido brilhante.",
      material: "Prata 925",
      priceCents: 54900,
      image: "/products/anel-duplo-trancado-prata-925-zirconia.png",
      variants: ARO_VARIANTS,
    },
  ],
  aliancas: [
    {
      name: "Aliança Duo Fosco Polido Ouro 18k 3mm",
      description:
        "Aliança em ouro amarelo 18k, largura 3mm, com acabamento bicolor combinando textura fosca acetinada de um lado e polimento espelhado do outro, contraste elegante e contemporâneo. Preço unitário.",
      material: "Ouro 18k",
      priceCents: 199000,
      image: "/products/alianca-duo-fosco-polido-ouro-18k-3mm.png",
      variants: ARO_VARIANTS,
    },
    {
      name: "Aliança Tungstênio Preto Masculina",
      description:
        "Aliança masculina em tungstênio preto, largura 6mm, extremamente resistente a riscos, acabamento fosco escovado no centro com bisel polido nas bordas, design robusto e moderno. Preço unitário.",
      material: "Tungstênio",
      priceCents: 39900,
      image: "/products/alianca-tungstenio-preto-masculina.png",
      variants: ARO_VARIANTS,
    },
  ],
  colares: [
    {
      name: "Colar Riviera Diamantes Ouro Branco 18k",
      description:
        "Colar riviera em ouro branco 18k, cravejado com diamantes naturais lapidação brilhante em toda a extensão da corrente, engaste em garras individuais, fecho tipo argola de segurança. Peça statement de alta joalheria.",
      material: "Ouro Branco 18k",
      priceCents: 1090000,
      featured: true,
      image: "/products/colar-riviera-diamantes-ouro-branco-18k.png",
    },
    {
      name: "Colar Estrela Prata 925 Zircônia",
      description:
        "Colar delicado em prata 925 com pingente em formato de estrela cravejado com zircônias lapidação redonda, corrente cabo fina, banho ródio antioxidante, comprimento ajustável de 40cm a 45cm.",
      material: "Prata 925",
      priceCents: 89900,
      image: "/products/colar-estrela-prata-925-zirconia.png",
    },
  ],
  brincos: [
    {
      name: "Brinco Argola Tubular Ouro 18k",
      description:
        "Brinco argola tubular em ouro amarelo 18k, formato clássico redondo, tubo oco leve para uso confortável no dia a dia, fecho de click seguro, acabamento polido espelhado. Par.",
      material: "Ouro 18k",
      priceCents: 149000,
      image: "/products/brinco-argola-tubular-ouro-18k.png",
    },
    {
      name: "Brinco Solitário Diamante Ouro Branco 18k",
      description:
        "Brinco solitário em ouro branco 18k com diamante natural de 15 pontos em cada peça, lapidação brilhante, engaste em quatro garras clássico, acabamento rodinado. Par.",
      material: "Ouro Branco 18k",
      priceCents: 349000,
      featured: true,
      image: "/products/brinco-solitario-diamante-ouro-branco-18k.png",
    },
    {
      name: "Brinco Gota Vazada Prata 925 Zircônia",
      description:
        "Brinco gota vazada em prata 925 com zircônias lapidação redonda contornando a estrutura vazada em formato de lágrima, fecho tipo argola francesa, banho ródio antioxidante. Par.",
      material: "Prata 925",
      priceCents: 79900,
      image: "/products/brinco-gota-vazada-prata-925-zirconia.png",
    },
  ],
  pulseiras: [
    {
      name: "Pulseira Coração Ouro Rosé 18k",
      description:
        "Pulseira delicada em ouro rosé 18k com pingente de coração em relevo, corrente cadeado fina, fecho tipo lagosta com extensor, acabamento polido espelhado.",
      material: "Ouro Rosé 18k",
      priceCents: 259000,
      image: "/products/pulseira-coracao-ouro-rose-18k.png",
    },
    {
      name: "Pulseira Tênis Prata 925 Zircônia",
      description:
        "Pulseira tênis em prata 925 cravejada com zircônias lapidação brilhante em toda a extensão, engaste em quatro garras, fecho oitavo de segurança, banho ródio antioxidante.",
      material: "Prata 925",
      priceCents: 129000,
      image: "/products/pulseira-tenis-prata-925-zirconia.png",
      variants: PULSEIRA_VARIANTS,
    },
    {
      name: "Bracelete Martelado Ouro 18k",
      description:
        "Bracelete rígido maciço em ouro amarelo 18k, design aberto tipo bangle com textura martelada artesanal na face externa e acabamento polido espelhado nas bordas internas e laterais.",
      material: "Ouro 18k",
      priceCents: 359000,
      featured: true,
      image: "/products/bracelete-martelado-ouro-18k.png",
    },
  ],
  relogios: [
    {
      name: "Relógio Masculino Cronógrafo Aço Prata",
      description:
        "Relógio masculino em aço inoxidável prata, função cronógrafo com três sub-mostradores e calendário, bezel polido, pulseira em metal maciço com fecho dobrável, resistente à água, movimento quartzo preciso.",
      material: "Aço Inoxidável",
      priceCents: 219000,
      featured: true,
      image: "/products/relogio-masculino-cronografo-aco-prata.png",
    },
    {
      name: "Relógio Feminino Slim Couro Branco Ouro Rosé",
      description:
        "Relógio feminino em ouro rosé com pulseira em couro legítimo branco, caixa slim minimalista, mostrador branco com marcadores em ouro rosé, resistente à água, movimento quartzo preciso.",
      material: "Ouro Rosé",
      priceCents: 159000,
      image: "/products/relogio-feminino-slim-couro-branco-ouro-rose.png",
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
  let created = 0;
  let skipped = 0;

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
          variants: p.variants
            ? { create: p.variants.map((label) => ({ label, stock: 10 })) }
            : undefined,
        },
      });
      console.log(`  + Criado: ${p.name} (${slug})`);
      created++;
    }
  }

  console.log(`Seed incremental 4 concluído. Criados: ${created}, pulados: ${skipped}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
