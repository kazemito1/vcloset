import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseProduct } from "@/lib/parseProduct";
import { getProductVideo } from "@/lib/productVideos";
import { ProductGallery } from "@/components/product/ProductGallery";
import { AddToCartForm } from "@/components/product/AddToCartForm";
import { ProductRating } from "@/components/product/ProductRating";
import { ProductReviews } from "@/components/product/ProductReviews";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export const revalidate = 0;

interface Props {
  params: { slug: string };
}

export default async function ProductPage({ params }: Props) {
  const productData = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      variants: true,
      reviews: { where: { approved: true }, select: { rating: true } },
    },
  });

  if (!productData) {
    notFound();
  }

  const product = parseProduct(productData!);
  const reviewCount = productData!.reviews.length;
  const reviewAvg =
    reviewCount > 0
      ? productData!.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;

  return (
    <div className="container-page py-12 md:py-16">
      <Breadcrumbs
        items={[
          {
            label: product.category?.name || "Categoria",
            href: product.category ? `/categorias/${product.category.slug}` : undefined,
          },
          { label: product.name },
        ]}
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductGallery
          images={product.images}
          name={product.name}
          videoUrl={getProductVideo(product.slug)}
          motionClip
        />

        <div>
          <p className="text-xs uppercase tracking-widest2 text-gold-600">
            {product.material}
          </p>
          <h1 className="mt-2 font-serif text-3xl md:text-4xl text-ink">
            {product.name}
          </h1>
          {reviewCount > 0 && (
            <div className="mt-3">
              <ProductRating rating={reviewAvg} reviewCount={reviewCount} />
            </div>
          )}
          <p className="mt-4 text-ink/70 leading-relaxed">{product.description}</p>

          <AddToCartForm product={product} />
        </div>
      </div>

      <ProductReviews productId={product.id} />
    </div>
  );
}
