"use client";

import { Product } from "@/data/products";
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
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => mapRowToProduct(row as ProductRow));
}

export async function createProduct(input: ProductInsert): Promise<Product> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .insert(mapProductToRow(input))
    .select("*")
    .single();

  if (error) throw error;
  return mapRowToProduct(data as ProductRow);
}

export async function editProduct(input: Product): Promise<Product> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .update(mapProductToRow(input))
    .eq("id", input.id)
    .select("*")
    .single();

  if (error) throw error;
  return mapRowToProduct(data as ProductRow);
}

export async function removeProduct(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}
