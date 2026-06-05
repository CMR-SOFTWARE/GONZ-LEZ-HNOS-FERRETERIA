"use client";

import { Product } from "@/data/products";
import {
  catalogImageUrl,
  isBrokenProductPlaceholder,
  isHeavyInlineImage,
} from "@/lib/imageUrl";
import { getSupabaseClient } from "@/lib/supabaseClient";

type ProductRow = {
  id: string;
  name: string;
  price: number;
  unit: Product["unit"];
  stock: number;
  image_url: string;
  category: Product["category"];
  description: string | null;
};

type ProductInsert = Omit<Product, "id">;

const TABLE = "products";

async function requireAuthedClient() {
  const supabase = getSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) {
    throw new Error(
      "Sesión expirada. Cerrá sesión en el panel y volvé a entrar."
    );
  }
  return supabase;
}

/** Columnas del listado (sin image_url: evita timeout si hay fotos base64 grandes en la BD). */
const PRODUCT_LIST_COLUMNS =
  "id,name,price,unit,stock,category,description";

const PRODUCT_DETAIL_COLUMNS =
  "id,name,price,unit,stock,image_url,category,description";

function mapRowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    unit: row.unit,
    stock: row.stock,
    imageUrl: row.image_url,
    category: row.category,
    description: row.description ?? "",
  };
}

function mapProductToRow(data: ProductInsert | Product) {
  return {
    name: data.name,
    price: data.price,
    unit: data.unit,
    stock: data.stock,
    image_url: data.imageUrl,
    category: data.category,
    description: data.description?.trim() || null,
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const supabase = getSupabaseClient();
  const [listRes, fastImagesRes] = await Promise.all([
    supabase
      .from(TABLE)
      .select(PRODUCT_LIST_COLUMNS)
      .order("name", { ascending: true }),
    supabase
      .from(TABLE)
      .select("id, image_url")
      .not("image_url", "like", "data:image%"),
  ]);

  if (listRes.error) throw listRes.error;

  const fastImages = new Map<string, string>();
  if (!fastImagesRes.error) {
    for (const row of fastImagesRes.data ?? []) {
      const url = (row as { id: string; image_url: string }).image_url?.trim();
      if (url && !isHeavyInlineImage(url) && !isBrokenProductPlaceholder(url)) {
        fastImages.set((row as { id: string }).id, catalogImageUrl(url));
      }
    }
  }

  return (listRes.data ?? []).map((row) => {
    const id = (row as { id: string }).id;
    return mapRowToProduct({
      ...(row as Omit<ProductRow, "image_url">),
      image_url: fastImages.get(id) ?? "",
    });
  });
}

/** Una fila con foto (para tarjetas y panel admin). */
export async function fetchProductImageUrl(id: string): Promise<string | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("image_url")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  const raw = (data as { image_url: string } | null)?.image_url?.trim();
  if (!raw) return null;
  if (isBrokenProductPlaceholder(raw)) return null;
  if (isHeavyInlineImage(raw)) return raw;
  return catalogImageUrl(raw);
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select(PRODUCT_DETAIL_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapRowToProduct(data as ProductRow);
}

export async function createProduct(
  input: ProductInsert,
  options?: { id?: string }
): Promise<Product> {
  const supabase = await requireAuthedClient();
  const row = mapProductToRow(input);
  const payload = options?.id ? { ...row, id: options.id } : row;
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select(PRODUCT_DETAIL_COLUMNS)
    .single();

  if (error) throw error;
  return mapRowToProduct(data as ProductRow);
}

export async function editProduct(input: Product): Promise<Product> {
  const supabase = await requireAuthedClient();
  const { data, error } = await supabase
    .from(TABLE)
    .update(mapProductToRow(input))
    .eq("id", input.id)
    .select(PRODUCT_DETAIL_COLUMNS)
    .single();

  if (error) throw error;
  return mapRowToProduct(data as ProductRow);
}

export async function removeProduct(id: string): Promise<void> {
  const supabase = await requireAuthedClient();
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}

export async function bulkUpdatePrices(
  products: Product[],
  percentage: number
): Promise<void> {
  const supabase = await requireAuthedClient();
  await Promise.all(
    products.map((p) => {
      const newPrice = Math.round((p.price * (1 + percentage / 100)) / 50) * 50;
      return supabase.from(TABLE).update({ price: newPrice }).eq("id", p.id);
    })
  );
}
