"use client";

import Image from "next/image";

type ProductImageProps = {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

function isDataUrl(src: string): boolean {
  return src.startsWith("data:image/");
}

export function ProductImage({
  src,
  alt,
  fill,
  className = "",
  sizes,
  priority = false,
}: ProductImageProps) {
  if (!src?.trim()) {
    return (
      <div
        className={`bg-gray-100 ${fill ? "absolute inset-0" : ""} ${className}`}
        aria-hidden
      />
    );
  }

  if (isDataUrl(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={
          fill
            ? `absolute inset-0 h-full w-full object-cover ${className}`
            : className
        }
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
    />
  );
}


