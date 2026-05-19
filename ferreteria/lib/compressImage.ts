const MAX_WIDTH = 480;
const MAX_BYTES = 120_000;
const MIN_QUALITY = 0.45;

/** Reduce JPG/WebP en el navegador antes de guardar en Supabase (evita base64 gigantes). */
export async function compressImageFile(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_WIDTH / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("No se pudo procesar la imagen");
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  let quality = 0.82;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  while (dataUrl.length > MAX_BYTES * 1.37 && quality > MIN_QUALITY) {
    quality -= 0.08;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }

  if (dataUrl.length > MAX_BYTES * 1.37) {
    throw new Error(
      "La imagen sigue siendo muy pesada. Usá una foto más chica o pegá una URL (/products/...)."
    );
  }

  return dataUrl;
}
