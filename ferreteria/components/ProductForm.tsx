"use client";

import { useState, useEffect } from "react";
import { Product, CATEGORIES, Category } from "@/data/products";
import { X } from "lucide-react";

interface ProductFormProps {
  product?: Product | null;
  onSave: (data: Omit<Product, "id"> | Product) => void;
  onClose: () => void;
}

const UNITS = ["unidad", "metro", "litro", "caja"] as const;

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

const EMPTY: Omit<Product, "id"> = {
  name: "",
  price: 0,
  unit: "unidad",
  stock: 0,
  imageUrl: "",
  category: "Herramientas",
  description: "",
};

export function ProductForm({ product, onSave, onClose }: ProductFormProps) {
  const [form, setForm] = useState<Omit<Product, "id">>(
    product ? { ...product } : { ...EMPTY }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fileInputKey, setFileInputKey] = useState(0);

  useEffect(() => {
    setForm(product ? { ...product } : { ...EMPTY });
    setFileInputKey((k) => k + 1);
  }, [product]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "El nombre es requerido";
    if (form.price <= 0) e.price = "El precio debe ser mayor a 0";
    if (form.stock < 0) e.stock = "El stock no puede ser negativo";
    if (!form.imageUrl.trim())
      e.imageUrl = "Subí una imagen o pegá una URL";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    if (product) {
      onSave({ ...form, id: product.id });
    } else {
      onSave(form);
    }
  };

  const field = (key: keyof Omit<Product, "id">, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        imageUrl: "Elegí un archivo de imagen (JPG, PNG, WebP, etc.)",
      }));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setErrors((prev) => ({
        ...prev,
        imageUrl: "La imagen debe pesar menos de 2 MB",
      }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        field("imageUrl", result);
      }
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    field("imageUrl", "");
    setFileInputKey((k) => k + 1);
  };

  const urlFieldValue = form.imageUrl.startsWith("data:")
    ? ""
    : form.imageUrl;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-lg font-bold text-black">
            {product ? "Editar producto" : "Nuevo producto"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => field("name", e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.name ? "border-red-400" : "border-gray-300"
              }`}
              placeholder="Nombre del producto"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <input
              type="text"
              value={form.description ?? ""}
              onChange={(e) => field("description", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Descripción breve (opcional)"
            />
          </div>

          {/* Price + Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio * (ARS)
              </label>
              <input
                type="number"
                min={0}
                step={1}
                value={form.price || ""}
                onChange={(e) => field("price", parseFloat(e.target.value) || 0)}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.price ? "border-red-400" : "border-gray-300"
                }`}
                placeholder="0"
              />
              {errors.price && (
                <p className="text-xs text-red-500 mt-1">{errors.price}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unidad *
              </label>
              <select
                value={form.unit}
                onChange={(e) => field("unit", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stock + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock *
              </label>
              <input
                type="number"
                min={0}
                value={form.stock || ""}
                onChange={(e) =>
                  field("stock", parseInt(e.target.value) || 0)
                }
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.stock ? "border-red-400" : "border-gray-300"
                }`}
                placeholder="0"
              />
              {errors.stock && (
                <p className="text-xs text-red-500 mt-1">{errors.stock}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría *
              </label>
              <select
                value={form.category}
                onChange={(e) => field("category", e.target.value as Category)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Imagen: archivo o URL (mock en memoria; la foto se guarda como data URL) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Foto del producto *
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                key={fileInputKey}
                id="product-image-file"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <label
                htmlFor="product-image-file"
                className="inline-flex cursor-pointer items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Elegir archivo
              </label>
              {form.imageUrl ? (
                <button
                  type="button"
                  onClick={clearImage}
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Quitar imagen
                </button>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              JPG, PNG o WebP. Máximo 2 MB. También podés pegar una URL abajo.
            </p>
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                O pegá una URL
              </label>
              <input
                type="text"
                value={urlFieldValue}
                onChange={(e) => field("imageUrl", e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.imageUrl ? "border-red-400" : "border-gray-300"
                }`}
                placeholder="/products/foto.png o https://..."
              />
            </div>
            {errors.imageUrl && (
              <p className="text-xs text-red-500 mt-1">{errors.imageUrl}</p>
            )}
            {form.imageUrl && (
              <div className="mt-2 relative h-20 w-20 rounded-lg overflow-hidden bg-gray-100 ring-1 ring-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.imageUrl}
                  alt="Vista previa"
                  className="h-full w-full object-cover"
                  onError={(e) =>
                    ((e.target as HTMLImageElement).style.display = "none")
                  }
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 transition-colors"
            >
              {product ? "Guardar cambios" : "Agregar producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


