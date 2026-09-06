import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const productImages: Record<string, string[]> = {
  "anel-solitario-ouro-18k": [
    "/products/anel-solitario-ouro-18k-1.png",
    "/products/anel-solitario-ouro-18k-2.png",
  ],
  "anel-meia-alianca-cravejado": [
    "/products/anel-meia-alianca-cravejado-1.png",
    "/products/anel-meia-alianca-cravejado-2.png",
  ],
  "anel-prata-925-no-infinito": [
    "/products/anel-prata-no-infinito-1.png",
    "/products/anel-prata-no-infinito-2.png",
  ],
  "anel-duo-ouro-e-rodio-negro": [
    "/products/anel-duo-ouro-rodio-1.png",
    "/products/anel-duo-ouro-rodio-2.png",
  ],
  "colar-gravata-veneziana-ouro-18k": [
    "/products/colar-gravata-veneziana-1.png",
    "/products/colar-gravata-veneziana-2.png",
  ],
  "colar-ponto-de-luz-diamante": [
    "/products/colar-ponto-luz-diamante-1.png",
    "/products/colar-ponto-luz-diamante-2.png",
  ],
  "colar-prata-925-coracao-vazado": [
    "/products/colar-prata-coracao-1.png",
    "/products/colar-prata-coracao-2.png",
  ],
  "colar-choker-folheado-a-ouro": [
    "/products/colar-choker-ouro-1.png",
    "/products/colar-choker-ouro-2.png",
  ],
  "brinco-argola-media-ouro-18k": [
    "/products/brinco-argola-ouro-1.png",
    "/products/brinco-argola-ouro-2.png",
  ],
  "brinco-ponto-de-luz-zirconia": [
    "/products/brinco-ponto-luz-1.png",
    "/products/brinco-ponto-luz-2.png",
  ],
  "brinco-prata-925-gota-cristal": [
    "/products/brinco-gota-prata-1.png",
    "/products/brinco-gota-prata-2.png",
  ],
  "brinco-ear-cuff-folheado": [
    "/products/brinco-ear-cuff-1.png",
    "/products/brinco-ear-cuff-2.png",
  ],
  "pulseira-elos-cartier-ouro-18k": [
    "/products/pulseira-cartier-ouro-1.png",
    "/products/pulseira-cartier-ouro-2.png",
  ],
  "pulseira-riviera-zirconias": [
    "/products/pulseira-riviera-1.png",
    "/products/pulseira-riviera-2.png",
  ],
  "pulseira-prata-925-berloques": [
    "/products/pulseira-berloques-prata-1.png",
    "/products/pulseira-berloques-prata-2.png",
  ],
  "bracelete-rigido-folheado-a-ouro": [
    "/products/bracelete-rigido-ouro-1.png",
    "/products/bracelete-rigido-ouro-2.png",
  ],
  "relogio-feminino-ouro-rose": [
    "/products/relogio-feminino-rose-1.png",
    "/products/relogio-feminino-rose-2.png",
  ],
  "relogio-masculino-aco-premium": [
    "/products/relogio-masculino-aco-1.png",
    "/products/relogio-masculino-aco-2.png",
  ],
  "relogio-bicolor-ouro-e-aco": [
    "/products/relogio-bicolor-1.png",
    "/products/relogio-bicolor-2.png",
  ],
  "relogio-slim-couro-legitimo": [
    "/products/relogio-slim-couro-1.png",
    "/products/relogio-slim-couro-2.png",
  ],
  "alianca-classica-ouro-18k-4mm": [
    "/products/alianca-classica-ouro-1.png",
    "/products/alianca-classica-ouro-2.png",
  ],
  "alianca-diamantada-ouro-branco": [
    "/products/alianca-diamantada-branco-1.png",
    "/products/alianca-diamantada-branco-2.png",
  ],
  "alianca-anatomica-bicolor": [
    "/products/alianca-anatomica-bicolor-1.png",
    "/products/alianca-anatomica-bicolor-2.png",
  ],
  "alianca-prata-925-compromisso": [
    "/products/alianca-prata-compromisso-1.png",
    "/products/alianca-prata-compromisso-2.png",
  ],
  "blusa-manga-longa-de-tricot-azul": [
    "/products/trajes-blusa-manga-longa-tricot-azul-1.png",
    "/products/trajes-blusa-manga-longa-tricot-azul-2.png",
  ],
  "calca-wide-leg-sarja-vinho": [
    "/products/trajes-calca-wide-leg-sarja-vinho-1.png",
    "/products/trajes-calca-wide-leg-sarja-vinho-2.png",
  ],
  "blusa-gola-role-de-malha-bege": [
    "/products/trajes-blusa-gola-role-malha-bege-1.png",
    "/products/trajes-blusa-gola-role-malha-bege-2.png",
  ],
  "blusa-gola-alta-de-tricot-preto": [
    "/products/trajes-blusa-gola-alta-tricot-preto-1.png",
    "/products/trajes-blusa-gola-alta-tricot-preto-2.png",
  ],
  "calca-com-barra-virada-jeans-jeans-escuro": [
    "/products/trajes-calca-barra-virada-jeans-escuro-1.png",
    "/products/trajes-calca-barra-virada-jeans-escuro-2.png",
  ],
  "calca-mom-jeans-preto": [
    "/products/trajes-calca-mom-jeans-preto-1.png",
    "/products/trajes-calca-mom-jeans-preto-2.png",
  ],
  "casaco-com-punho-largo-marrom": [
    "/products/trajes-casaco-punho-largo-marrom-1.png",
    "/products/trajes-casaco-punho-largo-marrom-2.png",
  ],
  "calca-texturizada-em-poliamida-preto": [
    "/products/trajes-calca-texturizada-poliamida-preto-1.png",
    "/products/trajes-calca-texturizada-poliamida-preto-2.png",
  ],
  "saia-midi-essential-preto": [
    "/products/trajes-saia-midi-essential-preto-1.png",
    "/products/trajes-saia-midi-essential-preto-2.png",
  ],
  "vestido-polo-azul-marinho": [
    "/products/trajes-vestido-polo-azul-marinho-1.png",
    "/products/trajes-vestido-polo-azul-marinho-2.png",
  ],
  "anel-vivara-man-em-prata-925-com-rodio-negro-e-quartzo": [
    "/products/masculino-anel-signet-prata-onix-1.png",
    "/products/masculino-anel-signet-prata-onix-2.png",
  ],
  "anel-square-em-prata-925-com-rodio-negro-e-esmalte": [
    "/products/masculino-anel-square-prata-rodio-negro-1.png",
    "/products/masculino-anel-square-prata-rodio-negro-2.png",
  ],
  "anel-origem-em-ouro-amarelo-18k": [
    "/products/masculino-alianca-ouro-amarelo-1.png",
    "/products/masculino-alianca-ouro-amarelo-2.png",
  ],
  "pulseira-masculina-em-couro-e-aco": [
    "/products/masculino-pulseira-couro-aco-1.png",
    "/products/masculino-pulseira-couro-aco-2.png",
  ],
  "pulseira-origem-em-prata-925": [
    "/products/masculino-pulseira-grumet-prata-1.png",
    "/products/masculino-pulseira-grumet-prata-2.png",
  ],
  "pulseira-forza-em-prata-925-com-rodio-negro": [
    "/products/masculino-pulseira-couro-prata-1.png",
    "/products/masculino-pulseira-couro-prata-2.png",
  ],
  "corrente-life-em-prata-925-40-cm": [
    "/products/masculino-corrente-prata-torcao-1.png",
    "/products/masculino-corrente-prata-torcao-2.png",
  ],
  "colar-masculino-em-aco-dourado-60-cm": [
    "/products/masculino-corrente-ouro-figaro-1.png",
    "/products/masculino-corrente-ouro-figaro-2.png",
  ],
  "pingente-vivara-man-em-prata-925-35-5-mm": [
    "/products/masculino-pingente-prata-geometrico-1.png",
    "/products/masculino-pingente-prata-geometrico-2.png",
  ],
  "carteira-masculina-couro-preto": [
    "/products/masculino-carteira-couro-preta-1.png",
    "/products/masculino-carteira-couro-preta-2.png",
  ],
  "relogio-vivara-biomas-tapete-verde-masculino-aco": [
    "/products/masculino-relogio-aco-verde-1.png",
    "/products/masculino-relogio-aco-verde-2.png",
  ],
  "relogio-bulova-series-b-masculino-silicone-azul-96b460n": [
    "/products/masculino-relogio-cronografo-preto-1.png",
    "/products/masculino-relogio-cronografo-preto-2.png",
  ],
  "scarpin-classico-em-couro-preto": [
    "/products/sapato-scarpin-couro-preto-1.png",
    "/products/sapato-scarpin-couro-preto-2.png",
  ],
  "scarpin-slingback-verniz-marsala": [
    "/products/sapato-slingback-verniz-marsala-1.png",
    "/products/sapato-slingback-verniz-marsala-2.png",
  ],
  "scarpin-salto-bloco-couro-bege": [
    "/products/sapato-scarpin-salto-bloco-bege-1.png",
    "/products/sapato-scarpin-salto-bloco-bege-2.png",
  ],
  "mocassim-couro-preto-com-bridao": [
    "/products/sapato-mocassim-couro-preto-1.png",
    "/products/sapato-mocassim-couro-preto-2.png",
  ],
  "mule-couro-caramelo-salto-medio": [
    "/products/sapato-mule-couro-caramelo-1.png",
    "/products/sapato-mule-couro-caramelo-2.png",
  ],
  "oxford-verniz-preto": [
    "/products/sapato-oxford-verniz-preto-1.png",
    "/products/sapato-oxford-verniz-preto-2.png",
  ],
};

async function main() {
  const entries = Object.entries(productImages);

  const updates = await Promise.all(
    entries.map(([slug, images]) =>
      prisma.product.updateMany({
        where: { slug },
        data: { images: JSON.stringify(images) },
      })
    )
  );

  const missing = updates
    .map((update, index) => ({ count: update.count, slug: entries[index][0] }))
    .filter((update) => update.count !== 1)
    .map((update) => update.slug);

  if (missing.length > 0) {
    throw new Error(`Produtos não encontrados: ${missing.join(", ")}`);
  }

  console.log(`Fotos atualizadas para ${entries.length} produtos.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });