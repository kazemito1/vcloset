// Vídeos curtos (4s, sem áudio) exibidos como slide extra na galeria do produto.
// Mantido como manifesto no código (e não no banco) para que o vídeo acompanhe o
// deploy junto do arquivo em /public/products, sem depender de migração/seed.
// Chave = slug do produto.
export const PRODUCT_VIDEOS: Record<string, string> = {};

export function getProductVideo(slug: string): string | undefined {
  return PRODUCT_VIDEOS[slug];
}
