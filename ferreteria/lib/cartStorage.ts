import type { Product } from "@/data/products";

const STORAGE_KEY = "ferreteria_cart_v1";

export type PersistedCartLine = {
  product: Product;
  quantity: number;
};

function isPersistedLine(x: unknown): x is PersistedCartLine {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  if (typeof o.quantity !== "number" || !Number.isFinite(o.quantity)) {
    return false;
  }
  const p = o.product;
  if (!p || typeof p !== "object") return false;
  const pr = p as Record<string, unknown>;
  const unitOk =
    pr.unit === "unidad" ||
    pr.unit === "metro" ||
    pr.unit === "litro" ||
    pr.unit === "caja";
  return (
    typeof pr.id === "string" &&
    typeof pr.name === "string" &&
    typeof pr.price === "number" &&
    typeof pr.stock === "number" &&
    typeof pr.imageUrl === "string" &&
    typeof pr.category === "string" &&
    unitOk
  );
}

export function loadCartFromStorage(): PersistedCartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isPersistedLine);
  } catch {
    return [];
  }
}

export function saveCartToStorage(items: PersistedCartLine[]): void {
  if (typeof window === "undefined") return;
  try {
    if (items.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  } catch {
    /* quota / private mode */
  }
}
