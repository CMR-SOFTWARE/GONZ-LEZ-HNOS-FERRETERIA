import { getSupabaseClient } from "@/lib/supabaseClient";
import { catalogImageUrl } from "@/lib/imageUrl";

export const PRODUCT_IMAGES_BUCKET = "product-images";

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mime =
    header.match(/data:([^;]+)/)?.[1] ?? "image/jpeg";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export function getPublicProductImageUrl(storagePath: string): string {
  const supabase = getSupabaseClient();
  const { data } = supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .getPublicUrl(storagePath);
  return data.publicUrl;
}

/** Sube JPEG al bucket y devuelve URL pública optimizada para el catálogo. */
export async function uploadProductImage(
  productId: string,
  source: string
): Promise<string> {
  const trimmed = source.trim();
  if (!trimmed) throw new Error("Falta la imagen del producto");
  if (!trimmed.startsWith("data:image/")) {
    return catalogImageUrl(trimmed);
  }

  const supabase = getSupabaseClient();
  const path = `${productId}.jpg`;
  const blob = dataUrlToBlob(trimmed);

  const { error: uploadError } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, blob, {
      contentType: "image/jpeg",
      upsert: true,
      cacheControl: "31536000",
    });

  if (uploadError) {
    throw new Error(
      `No se pudo subir la imagen a Storage: ${uploadError.message}. ` +
        "Ejecutá supabase-storage-products.sql en Supabase."
    );
  }

  return catalogImageUrl(getPublicProductImageUrl(path));
}

function isStorageProductUrl(url: string, productId: string): boolean {
  return (
    url.includes("/storage/v1/object/public/product-images/") &&
    url.includes(`${productId}.`)
  );
}

/** Antes de guardar: solo sube si hay foto nueva (data URL). URLs ya en Storage se reutilizan. */
export async function resolveProductImageForSave(
  productId: string,
  imageUrl: string,
  previousImageUrl?: string
): Promise<string> {
  const trimmed = imageUrl.trim();
  if (!trimmed) return trimmed;

  if (!trimmed.startsWith("data:image/")) {
    return catalogImageUrl(trimmed);
  }

  const prev = previousImageUrl?.trim() ?? "";
  if (
    prev &&
    !prev.startsWith("data:image/") &&
    isStorageProductUrl(prev, productId) &&
    trimmed === prev
  ) {
    return catalogImageUrl(prev);
  }

  return uploadProductImage(productId, trimmed);
}
