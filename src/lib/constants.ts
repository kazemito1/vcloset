export const CATEGORIES = [
  { name: "Anéis", slug: "aneis", image: "/products/category-aneis.png" },
  { name: "Colares", slug: "colares", image: "/products/category-colares.png" },
  { name: "Brincos", slug: "brincos", image: "/products/category-brincos.png" },
  { name: "Pulseiras", slug: "pulseiras", image: "/products/category-pulseiras.png" },
  { name: "Relógios", slug: "relogios", image: "/products/category-relogios.png" },
  { name: "Alianças", slug: "aliancas", image: "/products/category-aliancas.png" },
  { name: "Acessórios", slug: "acessorios", image: "/products/category-acessorios.png" },
  { name: "Trajes Femininos", slug: "trajes-femininos", image: "/products/category-trajes-femininos.png" },
  { name: "Masculino", slug: "masculino", image: "/products/category-masculino.png" },
  { name: "Sapatos", slug: "sapatos", image: "/products/category-sapatos.png" },
];

// Estrutura de navegação do header, agrupando as categorias em seções
// (Joias / Casamento / Relógios / Acessórios), além de páginas curadas que
// cruzam produtos já existentes por critério (Masculino, Presentes, Sale) —
// essas usam `href` explícito em vez do padrão /categorias/${slug}, pois não
// são categorias novas no catálogo, apenas filtros/curadorias.
export type NavGroup =
  | { label: string; type: "dropdown"; slugs: string[] }
  | { label: string; type: "link"; slug: string; href?: string };

export const NAV_GROUPS: NavGroup[] = [
  { label: "Joias", type: "dropdown", slugs: ["aneis", "colares", "brincos", "pulseiras"] },
  { label: "Trajes Femininos", type: "link", slug: "trajes-femininos" },
  { label: "Masculino", type: "link", slug: "masculino" },
  { label: "Sapatos", type: "link", slug: "sapatos" },
  { label: "Relógios", type: "link", slug: "relogios" },
  { label: "Acessórios", type: "link", slug: "acessorios" },
];

export const STORE_NAME = "V.CLOSET";

export const WHATSAPP_NUMBER = "5511999999999";
export const WHATSAPP_MESSAGE = "Olá! Vim do site da V.CLOSET e gostaria de mais informações.";
