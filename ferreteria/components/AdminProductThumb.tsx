"use client";

import { Product } from "@/data/products";
import { ProductImage } from "@/components/ProductImage";
import { useProductImage } from "@/lib/useProductImage";

/** Miniatura en el panel admin (carga URL de Storage si el listado no la trae). */
export function AdminProductThumb({
  product,
  className = "relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0",
  sizes = "40px",
}: {
  product: Product;
  className?: string;
  sizes?: string;
}) {
  const { imageSrc } = useProductImage(product.id, product.imageUrl, true);

  return (
    <div className={className}>
      <ProductImage
        src={imageSrc}
        alt={product.name}
        fill
        className="object-contain p-0.5"
        sizes={sizes}
      />
    </div>
  );
}
