"use client";

import { useEffect, useState } from "react";
import { isFastImageRef } from "@/lib/imageUrl";
import {
  loadProductImageUrl,
  primeProductImageUrl,
} from "@/lib/productImageLoader";

export function useProductImage(
  productId: string,
  initialUrl: string,
  enabled: boolean
) {
  const [imageSrc, setImageSrc] = useState(initialUrl);
  const [loading, setLoading] = useState(
    enabled && !initialUrl?.trim()
  );

  useEffect(() => {
    setImageSrc(initialUrl);
    setLoading(enabled && !initialUrl?.trim());
  }, [initialUrl, enabled]);

  useEffect(() => {
    if (initialUrl?.trim() && isFastImageRef(initialUrl)) {
      primeProductImageUrl(productId, initialUrl);
    }
  }, [productId, initialUrl]);

  useEffect(() => {
    if (!enabled || initialUrl?.trim()) return;

    let cancelled = false;
    setLoading(true);

    void loadProductImageUrl(productId)
      .then((url) => {
        if (!cancelled && url) setImageSrc(url);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [productId, initialUrl, enabled]);

  return { imageSrc, loading };
}
