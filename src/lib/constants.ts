export const CATEGORIES = [
  { name: "Anéis", slug: "aneis", image: "/products/placeholder-aneis.svg" },
  { name: "Colares", slug: "colares", image: "/products/placeholder-colares.svg" },
  { name: "Brincos", slug: "brincos", image: "/products/placeholder-brincos.svg" },
  { name: "Pulseiras", slug: "pulseiras", image: "/products/placeholder-pulseiras.svg" },
  { name: "Relógios", slug: "relogios", image: "/products/placeholder-relogios.svg" },
  { name: "Alianças", slug: "aliancas", image: "/products/placeholder-aliancas.svg" },
  { name: "Acessórios", slug: "acessorios", image: "/products/placeholder-acessorios.svg" },
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
  { label: "Casamento", type: "dropdown", slugs: ["aliancas"] },
  { label: "Relógios", type: "link", slug: "relogios" },
  { label: "Acessórios", type: "link", slug: "acessorios" },
  { label: "Masculino", type: "link", slug: "masculino", href: "/masculino" },
  { label: "Presentes", type: "link", slug: "presentes", href: "/presentes" },
  { label: "Sale", type: "link", slug: "sale", href: "/sale" },
];

export const STORE_NAME = "V.CLOSET";

export const WHATSAPP_NUMBER = "5511999999999";
export const WHATSAPP_MESSAGE = "Olá! Vim do site da V.CLOSET e gostaria de mais informações.";
