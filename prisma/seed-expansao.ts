// V.CLOSET — Expansão do catálogo: +10 produtos por categoria, distribuídos
// entre as subcategorias. Nomes, fotos e preços são genéricos (sem marcas).
// Idempotente: upsert por slug; variantes são recriadas a cada execução.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const RING = ["14", "16", "18", "20"];
const COLAR = ["40cm", "45cm", "50cm", "60cm"];
const CHOKER = ["35cm", "38cm", "40cm"];
const PULSEIRA = ["16cm", "18cm", "20cm"];
const BRACELETE = ["P (16cm)", "M (18cm)", "G (20cm)"];
const ARGOLA = ["Pequena (1,5cm)", "Média (2,5cm)", "Grande (3,5cm)"];
const EAR_CUFF = ["P", "M", "G"];
const PAR_UNICO = ["Par Único"];
const UNICO = ["Único"];
const ROUPA = ["P", "M", "G", "GG"];
const TERNO = ["48", "50", "52", "54"];
const CINTO = ["38", "40", "42", "44"];
const SAPATO_FEM = ["34", "35", "36", "37", "38", "39"];

interface NewProduct {
  slug: string;
  name: string;
  description: string;
  material: string;
  priceCents: number;
  targetGender: "feminino" | "masculino" | "unissex";
  category: string;
  images: string[];
  variants: string[];
}

function img(slug: string): string[] {
  return [`/products/${slug}-1.jpg`, `/products/${slug}-2.jpg`];
}

const PRODUCTS: NewProduct[] = [
  // ─── ANÉIS (10) ───────────────────────────────────────────────
  { slug: "anel-cravejado-gotas-ouro-18k", name: "Anel Cravejado Gotas Ouro 18k", description: "Anel em ouro 18k com fileira de gotas cravejadas em zircônias, brilho contínuo no dorso da mão.", material: "Ouro 18k", priceCents: 429000, targetGender: "feminino", category: "aneis", images: img("anel-cravejado-gotas-ouro-18k"), variants: RING },
  { slug: "anel-papillon-diamantes-ouro-branco-18k", name: "Anel Papillon Diamantes Ouro Branco 18k", description: "Asas em ouro branco 18k cravejadas de diamantes, design inspirado em borboletas.", material: "Ouro Branco 18k", priceCents: 699000, targetGender: "feminino", category: "aneis", images: img("anel-papillon-diamantes-ouro-branco-18k"), variants: RING },
  { slug: "anel-formatura-jade-ouro-18k", name: "Anel Formatura Jade Ouro 18k", description: "Anel de formatura em ouro 18k com jade central lapidado e laterais polidas.", material: "Ouro 18k", priceCents: 219000, targetGender: "unissex", category: "aneis", images: img("anel-formatura-jade-ouro-18k"), variants: RING },
  { slug: "anel-trabalhado-filigrana-prata-925", name: "Anel Trabalhado Filigrana Prata 925", description: "Anel amplo em prata 925 com filigrana artesanal em relevo, acabamento ródiado.", material: "Prata 925", priceCents: 59000, targetGender: "feminino", category: "aneis", images: img("anel-trabalhado-filigrana-prata-925"), variants: RING },
  { slug: "anel-pedra-lua-ouro-rose-18k", name: "Anel Pedra da Lua Ouro Rosé 18k", description: "Pedra da lua oval com brilho leitoso, cravada em ouro rosé 18k de acabamento acetinado.", material: "Ouro Rosé 18k", priceCents: 289000, targetGender: "feminino", category: "aneis", images: img("anel-pedra-lua-ouro-rose-18k"), variants: RING },
  { slug: "anel-turmalina-paraiba-ouro-18k", name: "Anel Turmalina Paraíba Ouro 18k", description: "Turmalina de tom azul-turquesa envolta em halo de zircônias, em ouro 18k.", material: "Ouro 18k", priceCents: 749000, targetGender: "feminino", category: "aneis", images: img("anel-turmalina-paraiba-ouro-18k"), variants: RING },
  { slug: "anel-margarida-perolas-ouro-18k", name: "Anel Margarida Pérolas Ouro 18k", description: "Pétalas em ouro 18k ao redor de pérola cultivada central, delicado e romântico.", material: "Ouro 18k", priceCents: 189000, targetGender: "feminino", category: "aneis", images: img("anel-margarida-perolas-ouro-18k"), variants: RING },
  { slug: "anel-signet-unissex-ouro-18k", name: "Anel Signet Unissex Ouro 18k", description: "Anel signet de face larga lisa, perfeito para gravações, em ouro 18k maciço.", material: "Ouro 18k", priceCents: 349000, targetGender: "unissex", category: "aneis", images: img("anel-signet-unissex-ouro-18k"), variants: RING },
  { slug: "anel-safira-azul-ouro-branco-18k", name: "Anel Safira Azul Ouro Branco 18k", description: "Safira azul oval em moldura de ouro branco 18k com pequenos brilhantes laterais.", material: "Ouro Branco 18k", priceCents: 499000, targetGender: "feminino", category: "aneis", images: img("anel-safira-azul-ouro-branco-18k"), variants: RING },
  { slug: "anel-diamantes-azuleiro-ouro-18k", name: "Anel Diamantes Azuleiro Ouro 18k", description: "Três diamantes em cravação azuleiro sobre anel de ouro 18k, elegância atemporal.", material: "Ouro 18k", priceCents: 569000, targetGender: "feminino", category: "aneis", images: img("anel-diamantes-azuleiro-ouro-18k"), variants: RING },

  // ─── COLARES (10) ─────────────────────────────────────────────
  { slug: "colar-gargantilha-losango-ouro-18k", name: "Colar Gargantilha Losango Ouro 18k", description: "Gargantilha de losango vazado em ouro 18k, presença marcante no colo.", material: "Ouro 18k", priceCents: 329000, targetGender: "feminino", category: "colares", images: img("colar-gargantilha-losango-ouro-18k"), variants: COLAR },
  { slug: "colar-pedra-lua-ouro-rose-18k", name: "Colar Pedra da Lua Ouro Rosé 18k", description: "Pingente de pedra da lua em cabo de ouro rosé 18k, mistério e luminosidade.", material: "Ouro Rosé 18k", priceCents: 259000, targetGender: "feminino", category: "colares", images: img("colar-pedra-lua-ouro-rose-18k"), variants: COLAR },
  { slug: "colar-perolas-cultivadas-ouro-18k", name: "Colar Pérolas Cultivadas Ouro 18k", description: "Pérolas cultivadas intercaladas em corrente de ouro 18k, clássico renovado.", material: "Ouro 18k", priceCents: 419000, targetGender: "feminino", category: "colares", images: img("colar-perolas-cultivadas-ouro-18k"), variants: COLAR },
  { slug: "colar-coracao-madreperola-prata-925", name: "Colar Coração Madrepérola Prata 925", description: "Coração vazado em madrepérola suspenso em corrente fina de prata 925.", material: "Prata 925", priceCents: 69000, targetGender: "feminino", category: "colares", images: img("colar-coracao-madreperola-prata-925"), variants: COLAR },
  { slug: "colar-corrente-figaro-prata-925", name: "Colar Corrente Figaro Prata 925", description: "Corrente figaro de elos alternados em prata 925, versátil para o dia a dia.", material: "Prata 925", priceCents: 89000, targetGender: "unissex", category: "colares", images: img("colar-corrente-figaro-prata-925"), variants: COLAR },
  { slug: "colar-terno-em-v-ouro-18k", name: "Colar Terno em V Ouro 18k", description: "Colar terno em formato V com elos polidos, cai perfeitamente sobre o decote.", material: "Ouro 18k", priceCents: 299000, targetGender: "feminino", category: "colares", images: img("colar-terno-em-v-ouro-18k"), variants: COLAR },
  { slug: "colar-gota-esmeralda-ouro-18k", name: "Colar Gota Esmeralda Ouro 18k", description: "Gota de esmeralda em engaste de ouro 18k com zircônias de apoio.", material: "Ouro 18k", priceCents: 589000, targetGender: "feminino", category: "colares", images: img("colar-gota-esmeralda-ouro-18k"), variants: COLAR },
  { slug: "colar-escapulario-ouro-18k", name: "Colar Escapulário Ouro 18k", description: "Escapulário delicado em ouro 18k, fé e proteção em um símbolo atemporal.", material: "Ouro 18k", priceCents: 179000, targetGender: "unissex", category: "colares", images: img("colar-escapulario-ouro-18k"), variants: COLAR },
  { slug: "colar-pedra-turquesa-prata-925", name: "Colar Pedra Turquesa Prata 925", description: "Turquesa natural em pingente orgânico sobre corrente baixa de prata 925.", material: "Prata 925", priceCents: 79000, targetGender: "feminino", category: "colares", images: img("colar-pedra-turquesa-prata-925"), variants: COLAR },
  { slug: "colar-choker-cravejado-ouro-18k", name: "Colar Choker Cravejado Ouro 18k", description: "Choker ajustável cravejada de zircônias, impacto discretamente luxuoso.", material: "Ouro 18k", priceCents: 369000, targetGender: "feminino", category: "colares", images: img("colar-choker-cravejado-ouro-18k"), variants: CHOKER },

  // ─── BRINCOS (10) ─────────────────────────────────────────────
  { slug: "brinco-ear-hook-esmeraldas-ouro-18k", name: "Brinco Ear Hook Esmeraldas Ouro 18k", description: "Ear hook envolvente com esmeraldas e zircônias, movimento e brilho ao rosto.", material: "Ouro 18k", priceCents: 459000, targetGender: "feminino", category: "brincos", images: img("brinco-ear-hook-esmeraldas-ouro-18k"), variants: PAR_UNICO },
  { slug: "brinco-argola-fina-ouro-rose-18k", name: "Brinco Argola Fina Ouro Rosé 18k", description: "Par de argolas finas em ouro rosé 18k, leveza para o uso diário.", material: "Ouro Rosé 18k", priceCents: 159000, targetGender: "feminino", category: "brincos", images: img("brinco-argola-fina-ouro-rose-18k"), variants: ARGOLA },
  { slug: "brinco-geometrico-cravejado-ouro-branco-18k", name: "Brinco Geométrico Cravejado Ouro Branco 18k", description: "Formas geométricas entrelaçadas cravejadas em ouro branco 18k, ar arquitetônico.", material: "Ouro Branco 18k", priceCents: 329000, targetGender: "feminino", category: "brincos", images: img("brinco-geometrico-cravejado-ouro-branco-18k"), variants: PAR_UNICO },
  { slug: "brinco-perola-barroca-ouro-18k", name: "Brinco Pérola Barroca Ouro 18k", description: "Pérolas barrocas de formato único penduradas em ganchos de ouro 18k.", material: "Ouro 18k", priceCents: 229000, targetGender: "feminino", category: "brincos", images: img("brinco-perola-barroca-ouro-18k"), variants: PAR_UNICO },
  { slug: "brinco-ear-cuff-zirconias-prata-925", name: "Brinco Ear Cuff Zircônias Prata 925", description: "Ear cuff sem furo cravejado de zircônias em prata 925, moderno e confortável.", material: "Prata 925", priceCents: 49000, targetGender: "feminino", category: "brincos", images: img("brinco-ear-cuff-zirconias-prata-925"), variants: EAR_CUFF },
  { slug: "brinco-gota-turmalina-ouro-18k", name: "Brinco Gota Turmalina Ouro 18k", description: "Gotas de turmalina rosada balançando em finos cabos de ouro 18k.", material: "Ouro 18k", priceCents: 299000, targetGender: "feminino", category: "brincos", images: img("brinco-gota-turmalina-ouro-18k"), variants: PAR_UNICO },
  { slug: "brinco-argola-martelada-prata-925", name: "Brinco Argola Martelada Prata 925", description: "Argolas de textura martelada em prata 925, luz refletida a cada movimento.", material: "Prata 925", priceCents: 64000, targetGender: "feminino", category: "brincos", images: img("brinco-argola-martelada-prata-925"), variants: ARGOLA },
  { slug: "brinco-ponto-luz-safira-ouro-18k", name: "Brinco Ponto de Luz Safira Ouro 18k", description: "Safiras azuis redondas em engaste de quatro garras, clássico ponto de luz.", material: "Ouro 18k", priceCents: 199000, targetGender: "feminino", category: "brincos", images: img("brinco-ponto-luz-safira-ouro-18k"), variants: PAR_UNICO },
  { slug: "brinco-maxi-argola-ouro-18k", name: "Brinco Maxi Argola Ouro 18k", description: "Argolas maxi de perfil plano em ouro 18k, statement elegante.", material: "Ouro 18k", priceCents: 249000, targetGender: "feminino", category: "brincos", images: img("brinco-maxi-argola-ouro-18k"), variants: ARGOLA },
  { slug: "brinco-cravejado-par-ouro-rose-18k", name: "Brinco Cravejado Par Ouro Rosé 18k", description: "Par de brincos botão totalmente cravejados em ouro rosé 18k, brilho intenso.", material: "Ouro Rosé 18k", priceCents: 389000, targetGender: "feminino", category: "brincos", images: img("brinco-cravejado-par-ouro-rose-18k"), variants: PAR_UNICO },

  // ─── PULSEIRAS (10) ───────────────────────────────────────────
  { slug: "pulseira-rigida-cravejada-ouro-18k", name: "Pulseira Rígida Cravejada Ouro 18k", description: "Bracelete rígido cravejado em ouro 18k com fecho de segurança duplo.", material: "Ouro 18k", priceCents: 499000, targetGender: "feminino", category: "pulseiras", images: img("pulseira-rigida-cravejada-ouro-18k"), variants: BRACELETE },
  { slug: "pulseira-elos-ovalados-prata-925", name: "Pulseira Elos Ovalados Prata 925", description: "Elos ovalados generosos em prata 925, brilho suave no pulso.", material: "Prata 925", priceCents: 89000, targetGender: "unissex", category: "pulseiras", images: img("pulseira-elos-ovalados-prata-925"), variants: PULSEIRA },
  { slug: "pulseira-perolas-cultivadas-ouro-18k", name: "Pulseira Pérolas Cultivadas Ouro 18k", description: "Pérolas cultivadas enfileiradas com fecho em ouro 18k, feminilidade clássica.", material: "Ouro 18k", priceCents: 329000, targetGender: "feminino", category: "pulseiras", images: img("pulseira-perolas-cultivadas-ouro-18k"), variants: PULSEIRA },
  { slug: "pulseira-turmalinas-coloridas-ouro-18k", name: "Pulseira Turmalinas Coloridas Ouro 18k", description: "Turmalinas multicoloridas alternadas em ouro 18k, alegria sofisticada.", material: "Ouro 18k", priceCents: 279000, targetGender: "feminino", category: "pulseiras", images: img("pulseira-turmalinas-coloridas-ouro-18k"), variants: PULSEIRA },
  { slug: "pulseira-berloques-prata-925", name: "Pulseira Berloques Prata 925", description: "Base para berloques em prata 925, comece a contar a sua história.", material: "Prata 925", priceCents: 69000, targetGender: "feminino", category: "pulseiras", images: img("pulseira-berloques-prata-925"), variants: PULSEIRA },
  { slug: "pulseira-gargantilha-punho-ouro-18k", name: "Pulseira Gargantilha Punho Ouro 18k", description: "Bracelete gargantilha de perfil largo em ouro 18k, presença marcante.", material: "Ouro 18k", priceCents: 549000, targetGender: "feminino", category: "pulseiras", images: img("pulseira-gargantilha-punho-ouro-18k"), variants: BRACELETE },
  { slug: "pulseira-elos-intercaldados-ouro-rose-18k", name: "Pulseira Elos Intercalados Ouro Rosé 18k", description: "Elos planos intercalados em ouro rosé 18k, brilho fluido e elegante.", material: "Ouro Rosé 18k", priceCents: 389000, targetGender: "feminino", category: "pulseiras", images: img("pulseira-elos-intercaldados-ouro-rose-18k"), variants: PULSEIRA },
  { slug: "pulseira-corrente-singela-prata-925", name: "Pulseira Corrente Singela Prata 925", description: "Corrente singela de elos miúdos em prata 925, ideal para sobreposição.", material: "Prata 925", priceCents: 54000, targetGender: "feminino", category: "pulseiras", images: img("pulseira-corrente-singela-prata-925"), variants: PULSEIRA },
  { slug: "pulseira-cravejada-estrelas-ouro-18k", name: "Pulseira Cravejada Estrelas Ouro 18k", description: "Estrelas cravejadas distribuídas em ouro 18k, céu no seu pulso.", material: "Ouro 18k", priceCents: 359000, targetGender: "feminino", category: "pulseiras", images: img("pulseira-cravejada-estrelas-ouro-18k"), variants: PULSEIRA },
  { slug: "pulseira-cordao-torcido-ouro-18k", name: "Pulseira Cordão Torcido Ouro 18k", description: "Cordão torcido de brilho intenso em ouro 18k, sofisticação solta no pulso.", material: "Ouro 18k", priceCents: 299000, targetGender: "feminino", category: "pulseiras", images: img("pulseira-cordao-torcido-ouro-18k"), variants: PULSEIRA },

  // ─── RELÓGIOS (10) ────────────────────────────────────────────
  { slug: "relogio-feminino-madreperola-aco-dourado", name: "Relógio Feminino Madrepérola Aço Dourado", description: "Mostrador em madrepérola com bracelete de aço dourado, delicadeza no pulso.", material: "Aço Dourado", priceCents: 189000, targetGender: "feminino", category: "relogios", images: img("relogio-feminino-madreperola-aco-dourado"), variants: UNICO },
  { slug: "relogio-feminino-malha-milanesa-ouro-rose", name: "Relógio Feminino Malha Milanesa Ouro Rosé", description: "Caixa slim com malha milanesa em ouro rosé, textura fluida e elegante.", material: "Ouro Rosé", priceCents: 169000, targetGender: "feminino", category: "relogios", images: img("relogio-feminino-malha-milanesa-ouro-rose"), variants: UNICO },
  { slug: "relogio-feminino-couro-azul-aco", name: "Relógio Feminino Couro Azul Aço", description: "Pulseira de couro azul-marinho com caixa em aço prata, contraste refinado.", material: "Aço e Couro", priceCents: 129000, targetGender: "feminino", category: "relogios", images: img("relogio-feminino-couro-azul-aco"), variants: UNICO },
  { slug: "relogio-masculino-automatico-aco-prata", name: "Relógio Masculino Automático Aço Prata", description: "Movimento automático visível no fundo, caixa em aço prata escovado.", material: "Aço Inoxidável", priceCents: 369000, targetGender: "masculino", category: "relogios", images: img("relogio-masculino-automatico-aco-prata"), variants: UNICO },
  { slug: "relogio-masculino-couro-caramelo", name: "Relógio Masculino Couro Caramelo", description: "Couro caramelo costurado com mostrador creme, ar vintage.", material: "Aço e Couro", priceCents: 189000, targetGender: "masculino", category: "relogios", images: img("relogio-masculino-couro-caramelo"), variants: UNICO },
  { slug: "relogio-masculino-esqueleto-aco-dourado", name: "Relógio Masculino Esqueleto Aço Dourado", description: "Mecanismo esqueleto aparente em aço dourado, engenharia como joia.", material: "Aço Dourado", priceCents: 299000, targetGender: "masculino", category: "relogios", images: img("relogio-masculino-esqueleto-aco-dourado"), variants: UNICO },
  { slug: "relogio-feminino-quadriculado-aco-prata", name: "Relógio Feminino Quadriculado Aço Prata", description: "Mostrador quadriculado discreto com bracelete de aço prata polido.", material: "Aço Inoxidável", priceCents: 149000, targetGender: "feminino", category: "relogios", images: img("relogio-feminino-quadriculado-aco-prata"), variants: UNICO },
  { slug: "relogio-masculino-piloto-couro-verde", name: "Relógio Masculino Piloto Couro Verde", description: "Estilo aviador com mostrador verde-oliva e pulseira de couro marrom.", material: "Aço e Couro", priceCents: 249000, targetGender: "masculino", category: "relogios", images: img("relogio-masculino-piloto-couro-verde"), variants: UNICO },
  { slug: "relogio-feminino-minimalista-aco-prata", name: "Relógio Feminino Minimalista Aço Prata", description: "Design minimalista de linhas puras, caixa fina em aço prata.", material: "Aço Inoxidável", priceCents: 99000, targetGender: "feminino", category: "relogios", images: img("relogio-feminino-minimalista-aco-prata"), variants: UNICO },
  { slug: "relogio-masculino-cronografo-aco-dourado", name: "Relógio Masculino Cronógrafo Aço Dourado", description: "Cronógrafo com detalhes dourados sobre aço, precisão com presença.", material: "Aço Dourado", priceCents: 269000, targetGender: "masculino", category: "relogios", images: img("relogio-masculino-cronografo-aco-dourado"), variants: UNICO },

  // ─── ALIANÇAS (10) ────────────────────────────────────────────
  { slug: "alianca-classica-ouro-18k-5mm", name: "Aliança Clássica Ouro 18k 5mm", description: "Perfil confortável e polimento espelhado em ouro 18k, 5mm de largura.", material: "Ouro 18k", priceCents: 429000, targetGender: "unissex", category: "aliancas", images: img("alianca-classica-ouro-18k-5mm"), variants: RING },
  { slug: "alianca-comfort-fit-ouro-18k-4mm", name: "Aliança Comfort Fit Ouro 18k 4mm", description: "Interior arredondado para conforto total, ouro 18k com 4mm.", material: "Ouro 18k", priceCents: 389000, targetGender: "unissex", category: "aliancas", images: img("alianca-comfort-fit-ouro-18k-4mm"), variants: RING },
  { slug: "alianca-cravejada-meia-volta-ouro-branco-18k", name: "Aliança Cravejada Meia Volta Ouro Branco 18k", description: "Meia volta de diamantes engastados em ouro branco 18k, brilho eterno.", material: "Ouro Branco 18k", priceCents: 459000, targetGender: "unissex", category: "aliancas", images: img("alianca-cravejada-meia-volta-ouro-branco-18k"), variants: RING },
  { slug: "alianca-milanesada-ouro-18k-3mm", name: "Aliança Milanesada Ouro 18k 3mm", description: "Padronagem milanesada artesanal em ouro 18k, textura que encanta.", material: "Ouro 18k", priceCents: 299000, targetGender: "unissex", category: "aliancas", images: img("alianca-milanesada-ouro-18k-3mm"), variants: RING },
  { slug: "alianca-quadrada-ouro-rose-18k-4mm", name: "Aliança Quadrada Ouro Rosé 18k 4mm", description: "Perfil reto e moderno em ouro rosé 18k, para casais de estilo próprio.", material: "Ouro Rosé 18k", priceCents: 369000, targetGender: "unissex", category: "aliancas", images: img("alianca-quadrada-ouro-rose-18k-4mm"), variants: RING },
  { slug: "alianca-fina-ouro-18k-2mm", name: "Aliança Fina Ouro 18k 2mm", description: "Delicadeza em 2mm de ouro 18k, perfeita para empilhar com outras alianças.", material: "Ouro 18k", priceCents: 199000, targetGender: "unissex", category: "aliancas", images: img("alianca-fina-ouro-18k-2mm"), variants: RING },
  { slug: "alianca-titanio-fosca-masculina", name: "Aliança Titânio Fosca Masculina", description: "Titânio leve e resistente com acabamento fosco, sofisticação discreta.", material: "Titânio", priceCents: 89000, targetGender: "masculino", category: "aliancas", images: img("alianca-titanio-fosca-masculina"), variants: RING },
  { slug: "alianca-prata-925-4mm-par", name: "Aliança Prata 925 4mm", description: "Par de alianças em prata 925 polida, 4mm de largura, brilho espelhado.", material: "Prata 925", priceCents: 69000, targetGender: "unissex", category: "aliancas", images: img("alianca-prata-925-4mm-par"), variants: RING },
  { slug: "alianca-trabalhada-romana-ouro-18k-5mm", name: "Aliança Trabalhada Romana Ouro 18k 5mm", description: "Gravação romana artesanal em alto-relevo, ouro 18k de 5mm.", material: "Ouro 18k", priceCents: 499000, targetGender: "unissex", category: "aliancas", images: img("alianca-trabalhada-romana-ouro-18k-5mm"), variants: RING },
  { slug: "alianca-duo-ouro-rose-ouro-18k", name: "Aliança Duo Ouro Rosé e Ouro 18k", description: "Dois tons de ouro entrelaçados em movimento contínuo, união perfeita.", material: "Ouro 18k e Ouro Rosé", priceCents: 419000, targetGender: "unissex", category: "aliancas", images: img("alianca-duo-ouro-rose-ouro-18k"), variants: RING },

  // ─── MASCULINO (10, distribuídos nas subcategorias) ──────────
  { slug: "blazer-linho-areia-masculino", name: "Blazer Linho Areia Masculino", description: "Blazer de linho respirável em tom areia, alfaiataria descontraída para o calor.", material: "Linho", priceCents: 64900, targetGender: "masculino", category: "masculino", images: img("blazer-linho-areia-masculino"), variants: TERNO },
  { slug: "blazer-tricoline-azul-royal", name: "Blazer Tricoline Azul Royal", description: "Corte slim em tricoline de algodão, azul royal vivo para reuniões e jantares.", material: "Tricoline de Algodão", priceCents: 54900, targetGender: "masculino", category: "masculino", images: img("blazer-tricoline-azul-royal"), variants: TERNO },
  { slug: "casaco-overcoat-cinza-mescla", name: "Casaco Overcoat Cinza Mescla", description: "Overcoat longo em lã mescla, camada impecável sobre o terno ou no look casual.", material: "Lã Mescla", priceCents: 99900, targetGender: "masculino", category: "masculino", images: img("casaco-overcoat-cinza-mescla"), variants: TERNO },
  { slug: "casaco-gabardine-preto", name: "Casaco Gabardine Preto", description: "Gabardine estruturada em preto profundo, corte reto atemporal.", material: "Gabardine de Algodão", priceCents: 84900, targetGender: "masculino", category: "masculino", images: img("casaco-gabardine-preto"), variants: TERNO },
  { slug: "anel-sigilo-onix-prata-925", name: "Anel Sigilo Ônix Prata 925", description: "Face retangular de ônix negro em prata 925 envelhecida, presença silenciosa.", material: "Prata 925 e Ônix", priceCents: 79000, targetGender: "masculino", category: "masculino", images: img("anel-sigilo-onix-prata-925"), variants: RING },
  { slug: "pulseira-couro-preto-fivela-aco", name: "Pulseira Couro Preto Fivela Aço", description: "Couro preto legítimo com fivela em aço escovado, masculinidade discreta.", material: "Couro e Aço Inoxidável", priceCents: 39000, targetGender: "masculino", category: "masculino", images: img("pulseira-couro-preto-fivela-aco"), variants: PULSEIRA },
  { slug: "corrente-italiana-prata-925", name: "Corrente Italiana Prata 925", description: "Elos italianos entrelaçados em prata 925 ródiada, caimento pesado e nobre.", material: "Prata 925", priceCents: 69000, targetGender: "masculino", category: "masculino", images: img("corrente-italiana-prata-925"), variants: ["50cm", "60cm"] },
  { slug: "relogio-masculino-couro-preto-classico", name: "Relógio Masculino Couro Preto Clássico", description: "Mostrador prata com índices bar, pulseira de couro preto legítimo.", material: "Aço e Couro", priceCents: 129000, targetGender: "masculino", category: "masculino", images: img("relogio-masculino-couro-preto-classico"), variants: UNICO },
  { slug: "cinto-couro-marrom-fivela-polido", name: "Cinto Couro Marrom Fivela Polida", description: "Couro marrom de 3,5cm com fivela em metal polido, essencial da alfaiataria.", material: "Couro Legítimo", priceCents: 29900, targetGender: "masculino", category: "masculino", images: img("cinto-couro-marrom-fivela-polido"), variants: CINTO },
  { slug: "pasta-executiva-couro-marrom", name: "Pasta Executiva Couro Marrom", description: "Pasta executiva em couro marrom com compartimento para notebook 14 polegadas.", material: "Couro Legítimo", priceCents: 119000, targetGender: "masculino", category: "masculino", images: img("pasta-executiva-couro-marrom"), variants: UNICO },

  // ─── TRAJES FEMININOS (10, 2 por subcategoria) ───────────────
  { slug: "blusa-tricot-gola-redonda-off-white", name: "Blusa Tricot Gola Redonda Off-White", description: "Tricot macio de gola redonda em off-white, básico elegante para todas as estações.", material: "Tricot Acrílico", priceCents: 18990, targetGender: "feminino", category: "trajes-femininos", images: img("blusa-tricot-gola-redonda-off-white"), variants: ROUPA },
  { slug: "blusa-seda-manga-curta-marfim", name: "Blusa Seda Manga Curta Marfim", description: "Seda mista de caimento fluido em marfim, toque leve e sofisticado.", material: "Seda Mista", priceCents: 25990, targetGender: "feminino", category: "trajes-femininos", images: img("blusa-seda-manga-curta-marfim"), variants: ROUPA },
  { slug: "calca-palazzo-alfaiataria-preto", name: "Calça Palazzo Alfaiataria Preto", description: "Palazzo de cintura alta em tecido de alfaiataria, elegância em movimento.", material: "Viscose com Elastano", priceCents: 28990, targetGender: "feminino", category: "trajes-femininos", images: img("calca-palazzo-alfaiataria-preto"), variants: ROUPA },
  { slug: "calca-cargo-sarja-verde", name: "Calça Cargo Sarja Verde", description: "Cargo em sarja de algodão com bolsos laterais, praticidade com estilo.", material: "Sarja de Algodão", priceCents: 24990, targetGender: "feminino", category: "trajes-femininos", images: img("calca-cargo-sarja-verde"), variants: ROUPA },
  { slug: "casaco-longo-lapelado-caramelo", name: "Casaco Longo Lapelado Caramelo", description: "Casaco longo lapelado em caramelo, silhueta alongada e acolhedora.", material: "Lã Mista", priceCents: 54990, targetGender: "feminino", category: "trajes-femininos", images: img("casaco-longo-lapelado-caramelo"), variants: ROUPA },
  { slug: "casaco-bomber-acolchoado-preto", name: "Casaco Bomber Acolchoado Preto", description: "Bomber acolchoado de corte moderno, aquecimento leve com atitude urbana.", material: "Poliamida", priceCents: 39990, targetGender: "feminino", category: "trajes-femininos", images: img("casaco-bomber-acolchoado-preto"), variants: ROUPA },
  { slug: "saia-plissada-midi-dourada", name: "Saia Plissada Midi Dourada", description: "Plissados leves em dourado suave, movimento brilhante a cada passo.", material: "Viscose Plissada", priceCents: 19990, targetGender: "feminino", category: "trajes-femininos", images: img("saia-plissada-midi-dourada"), variants: ROUPA },
  { slug: "saia-lapis-alfaiataria-cinza", name: "Saia Lápis Alfaiataria Cinza", description: "Saia lápis de alfaiataria em cinza, fenda posterior e cintura marcada.", material: "Poliéster com Elastano", priceCents: 22990, targetGender: "feminino", category: "trajes-femininos", images: img("saia-lapis-alfaiataria-cinza"), variants: ROUPA },
  { slug: "vestido-longo-seda-verde", name: "Vestido Longo Seda Verde", description: "Vestido longo em seda mista verde-esmeralda, caimento fluido para grandes noites.", material: "Seda Mista", priceCents: 39990, targetGender: "feminino", category: "trajes-femininos", images: img("vestido-longo-seda-verde"), variants: ROUPA },
  { slug: "vestido-midi-crepe-preto", name: "Vestido Midi Crepe Preto", description: "Midi em crepe de viscose com recorte na cintura, o clássico que nunca falha.", material: "Crepe de Viscose", priceCents: 32990, targetGender: "feminino", category: "trajes-femininos", images: img("vestido-midi-crepe-preto"), variants: ROUPA },

  // ─── ACESSÓRIOS (10, distribuídos nas subcategorias) ─────────
  { slug: "carteira-couro-caramelo-ziper", name: "Carteira Couro Caramelo Zíper", description: "Carteira em couro caramelo com fechamento em zíper e interior organizado.", material: "Couro Legítimo", priceCents: 37900, targetGender: "unissex", category: "acessorios", images: img("carteira-couro-caramelo-ziper"), variants: UNICO },
  { slug: "porta-cartoes-couro-azul-marinho", name: "Porta-Cartões Couro Azul Marinho", description: "Porta-cartões slim em couro azul-marinho, cabe no bolso do blazer.", material: "Couro Legítimo", priceCents: 25900, targetGender: "unissex", category: "acessorios", images: img("porta-cartoes-couro-azul-marinho"), variants: UNICO },
  { slug: "chaveiro-couro-preto-minimal", name: "Chaveiro Couro Preto Minimal", description: "Chaveiro minimalista em couro preto com argola em metal envelhecido.", material: "Couro Legítimo", priceCents: 16900, targetGender: "unissex", category: "acessorios", images: img("chaveiro-couro-preto-minimal"), variants: UNICO },
  { slug: "oculos-sol-aviador-dourado", name: "Óculos de Sol Aviador Dourado", description: "Armação aviador em metal dourado com lentes degradê, proteção UV400.", material: "Metal e Lente UV400", priceCents: 44900, targetGender: "unissex", category: "acessorios", images: img("oculos-sol-aviador-dourado"), variants: UNICO },
  { slug: "oculos-sol-redondo-acetato-caramelo", name: "Óculos de Sol Redondo Acetato Caramelo", description: "Redondo em acetato caramelo com hastes metálicas, charme retrô.", material: "Acetato", priceCents: 39900, targetGender: "unissex", category: "acessorios", images: img("oculos-sol-redondo-acetato-caramelo"), variants: UNICO },
  { slug: "oculos-sol-quadrado-preto-masculino", name: "Óculos de Sol Quadrado Preto Masculino", description: "Quadrado em acetato preto fosco, lentes escuras e postura imponente.", material: "Acetato", priceCents: 49900, targetGender: "masculino", category: "acessorios", images: img("oculos-sol-quadrado-preto-masculino"), variants: UNICO },
  { slug: "porta-joias-viajante-veludo-verde", name: "Porta-Joias Viajante Veludo Verde", description: "Porta-joias de viagem em veludo verde com compartimentos para anéis e brincos.", material: "Veludo e MDF", priceCents: 32900, targetGender: "feminino", category: "acessorios", images: img("porta-joias-viajante-veludo-verde"), variants: UNICO },
  { slug: "porta-joias-gavetas-veludo-creme", name: "Porta-Joias Gavetas Veludo Creme", description: "Porta-joias de gavetas em veludo creme com detalhes dourados, organização que decora.", material: "Veludo e MDF", priceCents: 38900, targetGender: "feminino", category: "acessorios", images: img("porta-joias-gavetas-veludo-creme"), variants: UNICO },
  { slug: "corrente-grumet-ouro-18k", name: "Corrente Grumet Ouro 18k", description: "Grumet de elos redondos em ouro 18k, solidez e brilho em qualquer ocasião.", material: "Ouro 18k", priceCents: 119000, targetGender: "unissex", category: "acessorios", images: img("corrente-grumet-ouro-18k"), variants: ["45cm", "50cm", "60cm"] },
  { slug: "corrente-veneziana-prata-925", name: "Corrente Veneziana Prata 925", description: "Veneziana de elos quadrados em prata 925, base perfeita para pingentes.", material: "Prata 925", priceCents: 69000, targetGender: "unissex", category: "acessorios", images: img("corrente-veneziana-prata-925"), variants: ["45cm", "50cm", "60cm", "70cm"] },

  // ─── SAPATOS (10, distribuídos nas subcategorias) ────────────
  { slug: "scarpin-verniz-vermelho", name: "Scarpin Verniz Vermelho", description: "Verniz vermelho intenso com salto médio, a paixão clássica do closet.", material: "Verniz Premium", priceCents: 32900, targetGender: "feminino", category: "sapatos", images: img("scarpin-verniz-vermelho"), variants: SAPATO_FEM },
  { slug: "scarpin-couro-nude-salto-fino", name: "Scarpin Couro Nude Salto Fino", description: "Couro nude de salto fino que alonga a silhueta, indispensável.", material: "Couro Legítimo", priceCents: 34900, targetGender: "feminino", category: "sapatos", images: img("scarpin-couro-nude-salto-fino"), variants: SAPATO_FEM },
  { slug: "scarpin-bico-fino-preto", name: "Scarpin Bico Fino Preto", description: "Bico fino em couro preto macio, do escritório ao jantar sem trocar de sapato.", material: "Couro Legítimo", priceCents: 31900, targetGender: "feminino", category: "sapatos", images: img("scarpin-bico-fino-preto"), variants: SAPATO_FEM },
  { slug: "mocassim-couro-caramelo-feminino", name: "Mocassim Couro Caramelo Feminino", description: "Mocassim em couro caramelo com solado flexível, conforto o dia inteiro.", material: "Couro Legítimo", priceCents: 35900, targetGender: "feminino", category: "sapatos", images: img("mocassim-couro-caramelo-feminino"), variants: SAPATO_FEM },
  { slug: "mocassim-suede-cinza", name: "Mocassim Suede Cinza", description: "Suede cinza de textura aveludada, toque casual para looks refinados.", material: "Suede", priceCents: 33900, targetGender: "feminino", category: "sapatos", images: img("mocassim-suede-cinza"), variants: SAPATO_FEM },
  { slug: "mule-salto-bloco-preto", name: "Mule Salto Bloco Preto", description: "Mule de salto bloco em couro preto, fácil de calçar, impossível ignorar.", material: "Couro Legítimo", priceCents: 28900, targetGender: "feminino", category: "sapatos", images: img("mule-salto-bloco-preto"), variants: SAPATO_FEM },
  { slug: "mule-bico-fino-couro-branco", name: "Mule Bico Fino Couro Branco", description: "Bico fino em couro branco, minimalismo que alonga o visual.", material: "Couro Legítimo", priceCents: 29900, targetGender: "feminino", category: "sapatos", images: img("mule-bico-fino-couro-branco"), variants: SAPATO_FEM },
  { slug: "mule-trancado-caramelo", name: "Mule Trançado Caramelo", description: "Detalhe trançado artesanal em caramelo, verão em forma de sapato.", material: "Couro Legítimo", priceCents: 31900, targetGender: "feminino", category: "sapatos", images: img("mule-trancado-caramelo"), variants: SAPATO_FEM },
  { slug: "oxford-couro-marrom", name: "Oxford Couro Marrom", description: "Oxford em couro marrom com costura visível, androgino e elegante.", material: "Couro Legítimo", priceCents: 36900, targetGender: "unissex", category: "sapatos", images: img("oxford-couro-marrom"), variants: SAPATO_FEM },
  { slug: "oxford-verniz-preto-fivela", name: "Oxford Verniz Preto Fivela", description: "Verniz preto com fivela metálica, brilho de festa com alma tailoring.", material: "Verniz Premium", priceCents: 37900, targetGender: "feminino", category: "sapatos", images: img("oxford-verniz-preto-fivela"), variants: SAPATO_FEM },
];

async function main() {
  // Cria/atualiza os novos produtos
  let created = 0;
  let updated = 0;
  for (const p of PRODUCTS) {
    const category = await prisma.category.findUnique({ where: { slug: p.category } });
    if (!category) {
      console.error(`  ! Categoria não encontrada: ${p.category} (produto ${p.slug})`);
      continue;
    }

    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        material: p.material,
        priceCents: p.priceCents,
        targetGender: p.targetGender,
        images: JSON.stringify(p.images),
        featured: false,
        categoryId: category.id,
      },
      update: {
        name: p.name,
        description: p.description,
        material: p.material,
        priceCents: p.priceCents,
        targetGender: p.targetGender,
        images: JSON.stringify(p.images),
        categoryId: category.id,
      },
    });

    await prisma.productVariant.deleteMany({ where: { productId: product.id } });
    await prisma.productVariant.createMany({
      data: p.variants.map((label) => ({
        productId: product.id,
        label,
        stock: 10,
      })),
    });

    if (existing) updated++;
    else created++;
  }
  console.log(`Produtos: ${created} criados, ${updated} atualizados. Total: ${PRODUCTS.length}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
