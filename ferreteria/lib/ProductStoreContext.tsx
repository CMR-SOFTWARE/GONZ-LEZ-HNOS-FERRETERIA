"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { Product } from "@/data/products";
import {
  fetchProducts,
  createProduct,
  editProduct,
  removeProduct,
} from "@/lib/productService";

interface ProductStoreContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, "id">, id?: string) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

const ProductStoreContext = createContext<ProductStoreContextType | null>(null);

export function ProductStoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const remoteProducts = await fetchProducts();
      setProducts(remoteProducts);
    } catch (err) {
      console.error(err);
      const code = (err as { code?: string })?.code;
      const msg = err instanceof Error ? err.message : String(err);
      const timedOut =
        code === "57014" || /timeout|statement timeout/i.test(msg);
      setError(
        timedOut
          ? "La base de datos tardó demasiado (fotos muy pesadas). Revisá supabase-fix-heavy-images.sql o reemplazá imágenes por URLs."
          : msg.includes("NEXT_PUBLIC_SUPABASE") || msg.includes("Faltan")
            ? msg
            : "No se pudo conectar con Supabase. Revisá las variables en Vercel o ferreteria/.env.local."
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshProducts();
  }, [refreshProducts]);

  const addProduct = useCallback(
    async (data: Omit<Product, "id">, id?: string) => {
      setError(null);
      const created = await createProduct(data, id ? { id } : undefined);
      setProducts((prev) => [created, ...prev]);
    },
    []
  );

  const updateProduct = useCallback(async (updated: Product) => {
    setError(null);
    const saved = await editProduct(updated);
    setProducts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    setError(null);
    await removeProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return (
    <ProductStoreContext.Provider
      value={{
        products,
        loading,
        error,
        refreshProducts,
        addProduct,
        updateProduct,
        deleteProduct,
      }}
    >
      {children}
    </ProductStoreContext.Provider>
  );
}

export function useProductStore() {
  const ctx = useContext(ProductStoreContext);
  if (!ctx)
    throw new Error("useProductStore must be used within ProductStoreProvider");
  return ctx;
}
