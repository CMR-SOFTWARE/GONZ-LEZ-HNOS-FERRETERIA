import { fetchProductImageUrl } from "@/lib/productService";
import { catalogImageUrl, isFastImageRef } from "@/lib/imageUrl";
import {
  getCachedProductImageUrl,
  setCachedProductImageUrl,
} from "@/lib/productImageCache";

const MAX_CONCURRENT = 4;
const MAX_RETRIES = 2;

let inFlight = 0;
const waitQueue: Array<() => void> = [];

function acquireSlot(): Promise<void> {
  if (inFlight < MAX_CONCURRENT) {
    inFlight += 1;
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    waitQueue.push(() => {
      inFlight += 1;
      resolve();
    });
  });
}

function releaseSlot(): void {
  inFlight = Math.max(0, inFlight - 1);
  const next = waitQueue.shift();
  if (next) next();
}

const memoryCache = new Map<string, string>();

function remember(productId: string, url: string): string {
  const display = catalogImageUrl(url);
  memoryCache.set(productId, display);
  void setCachedProductImageUrl(productId, display);
  return display;
}

export async function loadProductImageUrl(
  productId: string
): Promise<string | null> {
  const mem = memoryCache.get(productId);
  if (mem) return mem;

  const persisted = await getCachedProductImageUrl(productId);
  if (persisted) {
    memoryCache.set(productId, persisted);
    return persisted;
  }

  await acquireSlot();
  try {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const url = await fetchProductImageUrl(productId);
        if (!url) return null;
        return remember(productId, url);
      } catch {
        if (attempt === MAX_RETRIES) return null;
        await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
      }
    }
    return null;
  } finally {
    releaseSlot();
  }
}

/** Registra URLs ya traídas en el listado (Storage / rutas públicas). */
export function primeProductImageUrl(productId: string, url: string): void {
  if (!isFastImageRef(url)) return;
  remember(productId, url);
}
