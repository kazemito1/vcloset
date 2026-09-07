// Subcategorias de catálogo (somente código, sem alteração de banco — mesmo
// padrão do manifesto productVideos.ts). Cada subcategoria agrupa produtos de
// uma categoria por palavras-chave no slug do produto. A ordem define a
// precedência: o primeiro match vence, e produtos sem match aparecem apenas
// na listagem completa da categoria.

export interface Subcategory {
  slug: string;
  name: string;
  keywords: string[];
}

export const SUBCATEGORIES_BY_CATEGORY: Record<string, Subcategory[]> = {
  masculino: [
    { slug: "blazers", name: "Blazers", keywords: ["blazer"] },
    { slug: "casacos", name: "Casacos", keywords: ["sobretudo", "trench", "casaco"] },
    { slug: "aneis", name: "Anéis", keywords: ["anel"] },
    { slug: "pulseiras", name: "Pulseiras", keywords: ["pulseira"] },
    {
      slug: "correntes-colares",
      name: "Correntes & Colares",
      keywords: ["corrente", "colar", "pingente"],
    },
    { slug: "relogios", name: "Relógios", keywords: ["relogio"] },
    {
      slug: "acessorios",
      name: "Acessórios",
      keywords: [
        "carteira",
        "porta-cartao",
        "porta-passaporte",
        "abotoadura",
        "caneta",
        "chaveiro",
        "cinto",
        "pasta",
      ],
    },
  ],
  "trajes-femininos": [
    { slug: "blusas", name: "Blusas", keywords: ["blusa"] },
    { slug: "calcas", name: "Calças", keywords: ["calca"] },
    { slug: "casacos", name: "Casacos", keywords: ["casaco"] },
    { slug: "saias", name: "Saias", keywords: ["saia"] },
    { slug: "vestidos", name: "Vestidos", keywords: ["vestido"] },
  ],
  acessorios: [
    {
      slug: "carteiras-chaveiros",
      name: "Carteiras & Chaveiros",
      keywords: ["carteira", "chaveiro", "porta-cartoes"],
    },
    { slug: "oculos-de-sol", name: "Óculos de Sol", keywords: ["oculos"] },
    { slug: "porta-joias", name: "Porta-Joias", keywords: ["porta-joias"] },
    { slug: "correntes", name: "Correntes", keywords: ["corrente"] },
  ],
  sapatos: [
    { slug: "scarpins", name: "Scarpins", keywords: ["scarpin"] },
    { slug: "mocassins", name: "Mocassins", keywords: ["mocassim"] },
    { slug: "mules", name: "Mules", keywords: ["mule"] },
    { slug: "oxford", name: "Oxford", keywords: ["oxford"] },
  ],
};

export function getSubcategoriesForCategory(categorySlug: string): Subcategory[] {
  return SUBCATEGORIES_BY_CATEGORY[categorySlug] ?? [];
}

// Retorna o slug da subcategoria do produto (ou null se não houver match).
// O match é feito sobre o slug do produto, sempre em minúsculas e sem acentos.
export function resolveSubcategorySlug(
  categorySlug: string,
  productSlug: string
): string | null {
  const subs = getSubcategoriesForCategory(categorySlug);
  for (const sub of subs) {
    if (sub.keywords.some((k) => productSlug.includes(k))) return sub.slug;
  }
  return null;
}
