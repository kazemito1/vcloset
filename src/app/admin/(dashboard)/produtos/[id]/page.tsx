import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseProduct } from "@/lib/parseProduct";
import { ProductForm } from "@/components/admin/ProductForm";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

export const revalidate = 0;

interface Props {
  params: { id: string };
}

export default async function EditarProdutoPage({ params }: Props) {
  const productData = await prisma.product.findUnique({
    where: { id: params.id },
    include: { category: true, variants: true },
  });

  if (!productData) {
    notFound();
  }

  const product = parseProduct(productData!);

  return (
    <div>
      <h1 className="admin-title">Editar produto</h1>
      <p className="admin-subtitle">{product.name}</p>
      <ProductForm
        initial={{
          id: product.id,
          name: product.name,
          description: product.description,
          material: product.material,
          priceCents: product.priceCents,
          salePriceCents: product.salePriceCents,
          targetGender: product.targetGender,
          categoryId: product.categoryId,
          featured: product.featured,
          images: product.images,
          variants: product.variants.map((v) => ({ label: v.label, stock: v.stock })),
        }}
      />
      <DeleteProductButton id={product.id} />
    </div>
  );
}
