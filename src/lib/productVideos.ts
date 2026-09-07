// Vídeos curtos (4s, sem áudio) exibidos como slide extra na galeria do produto.
// Mantido como manifesto no código (e não no banco) para que o vídeo acompanhe o
// deploy junto do arquivo em /public/products, sem depender de migração/seed.
// Chave = slug do produto.
//
// Enquanto um produto não tiver arquivo de vídeo aqui, a galeria exibe o slide
// de "clipe" animado gerado a partir das próprias fotos (ver ProductGallery).
export const PRODUCT_VIDEOS: Record<string, string> = {};

export function getProductVideo(slug: string): string | undefined {
  return PRODUCT_VIDEOS[slug];
}
