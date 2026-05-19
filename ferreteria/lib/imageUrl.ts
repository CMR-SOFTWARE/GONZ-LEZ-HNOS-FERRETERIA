/** Placeholder incorrecto (el logo no es foto de producto). */
export function isBrokenProductPlaceholder(
  url: string | null | undefined
): boolean {
  if (!url?.trim()) return false;
  return /logo-gonzalez/i.test(url);
}

/** Imagen embebida en la BD (~2 MB) — lenta de descargar. */
export function isHeavyInlineImage(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  return url.startsWith("data:image/") || url.length > 2048;
}

/** URL liviana: Storage, /public o http(s). */
export function isFastImageRef(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  return !isHeavyInlineImage(url);
}

/** URL lista para mostrar en el catálogo (sin query basura). */
export function catalogImageUrl(url: string): string {
  const u = url.trim();
  if (!u || u.startsWith("data:")) return u;
  return u.split("?")[0];
}
