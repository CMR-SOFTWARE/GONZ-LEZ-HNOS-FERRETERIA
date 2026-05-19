"use client";

import { Package } from "lucide-react";
import { isBrokenProductPlaceholder } from "@/lib/imageUrl";

type ProductImageProps = {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

function fillClassName(className: string): string {
  const base = "absolute inset-0 h-full w-full";
  if (/object-(contain|cover|fill|none|scale-down)/.test(className)) {
    return `${base} ${className}`;
  }
  return `${base} object-contain object-center ${className}`;
}

export function ProductImage({
  src,
  alt,
  fill,
  className = "",
  sizes,
  priority = false,
}: ProductImageProps) {
  if (!src?.trim() || isBrokenProductPlaceholder(src)) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-gray-300 ${
          fill ? "absolute inset-0" : ""
        } ${className}`}
        aria-hidden
      >
        <Package className="h-8 w-8" strokeWidth={1.25} />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={fill ? fillClassName(className) : className}
      sizes={sizes}
    />
  );
}
