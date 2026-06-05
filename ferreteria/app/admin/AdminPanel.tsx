"use client";

import { useRef, useState } from "react";
import QRCode from "react-qr-code";
import { AdminProductThumb } from "@/components/AdminProductThumb";
import { useProductStore } from "@/lib/ProductStoreContext";
import { ProductForm } from "@/components/ProductForm";
import { Product } from "@/data/products";
import { formatPrice, getStockStatus, StockStatus } from "@/lib/utils";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { fetchProductById, bulkUpdatePrices } from "@/lib/productService";
import { resolveProductImageForSave } from "@/lib/productStorage";
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  Search,
  ShieldAlert,
  X,
  LogOut,
  QrCode,
  Download,
  TrendingUp,
} from "lucide-react";

const SITE_URL = "https://ferreteriagonzalezhnos.com";

type AdminPanelProps = {
  onLogout: () => void;
};

const STOCK_BADGE_CLASS: Record<StockStatus, string> = {
  ok:  "bg-green-100 text-green-600",
  low: "bg-amber-100 text-amber-600",
  out: "bg-red-100 text-red-600",
};

function formatProductSaveError(err: unknown, action: "save" | "delete"): string {
  const o = err as { message?: string; code?: string; details?: string } | null;
  const msg = (o?.message ?? "").trim();
  const code = (o?.code ?? "").trim();
  const combined = `${msg} ${code}`.toLowerCase();

  const isRls =
    combined.includes("row-level security") ||
    combined.includes("violates row-level") ||
    combined.includes("42501") ||
    code === "42501";

  const isStorage =
    combined.includes("storage") ||
    combined.includes("bucket") ||
    combined.includes("product-images");

  if (isRls) {
    return (
      "Supabase bloqueó la operación (permisos). Ejecutá supabase-fix-admin-permissions.sql " +
      "y agregá tu usuario en app_admins (Authentication → Users → User UID). " +
      (msg ? `Detalle: ${msg}` : "")
    );
  }

  if (isStorage) {
    return (
      "No se pudo subir la foto. Ejecutá supabase-fix-admin-permissions.sql en Supabase " +
      "(incluye permisos de Storage). " +
      (msg ? `Detalle: ${msg}` : "")
    );
  }

  if (msg) {
    return action === "save"
      ? `No se pudo guardar: ${msg}`
      : `No se pudo eliminar: ${msg}`;
  }

  return action === "save"
    ? "No se pudo guardar el producto. Revisá la conexión y los datos."
    : "No se pudo eliminar el producto.";
}

type PriceMode = "idle" | "preview" | "applying";
type PricePreviewItem = { id: string; name: string; oldPrice: number; newPrice: number };

export function AdminPanel({ onLogout }: AdminPanelProps) {
  const { products, loading, error, addProduct, updateProduct, deleteProduct, refreshProducts } =
    useProductStore();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // QR
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownloadQR = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, 512, 512);
      ctx.drawImage(img, 0, 0, 512, 512);
      const link = document.createElement("a");
      link.download = "qr-ferreteria.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgData)));
  };

  // Aumento masivo de precios
  const [pricePercent, setPricePercent] = useState("");
  const [priceMode, setPriceMode] = useState<PriceMode>("idle");
  const [pricePreview, setPricePreview] = useState<PricePreviewItem[]>([]);
  const [priceError, setPriceError] = useState<string | null>(null);

  const handlePricePreview = () => {
    const pct = parseFloat(pricePercent);
    if (isNaN(pct) || pct === 0 || pct < -99 || pct > 1000) {
      setPriceError("Ingresá un porcentaje válido entre -99 y 1000.");
      return;
    }
    setPriceError(null);
    setPricePreview(
      products.map((p) => ({
        id: p.id,
        name: p.name,
        oldPrice: p.price,
        newPrice: Math.round((p.price * (1 + pct / 100)) / 50) * 50,
      }))
    );
    setPriceMode("preview");
  };

  const handleBulkApply = async () => {
    const pct = parseFloat(pricePercent);
    setPriceMode("applying");
    setPriceError(null);
    try {
      await bulkUpdatePrices(products, pct);
      await refreshProducts();
      setPriceMode("idle");
      setPricePercent("");
      setPricePreview([]);
    } catch (err) {
      setPriceError(
        err instanceof Error ? err.message : "No se pudieron actualizar los precios."
      );
      setPriceMode("preview");
    }
  };

  const filtered = products.filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (data: Omit<Product, "id"> | Product) => {
    setSubmitError(null);
    setBusy(true);
    try {
      const supabase = getSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        setSubmitError(
          "La sesión de Supabase expiró o no está activa. Usá «Cerrar sesión» y volvé a entrar."
        );
        return;
      }
      const { data: adminRow } = await supabase
        .from("app_admins")
        .select("user_id")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (!adminRow) {
        setSubmitError(
          `Tu usuario (${session.user.email ?? session.user.id}) no está en public.app_admins en ESTE proyecto de Supabase. En SQL Editor: insert into public.app_admins (user_id) values ('${session.user.id}');`
        );
        return;
      }

      if ("id" in data) {
        const product = data as Product;
        const imageUrl = await resolveProductImageForSave(
          product.id,
          product.imageUrl,
          editing?.id === product.id ? editing.imageUrl : undefined
        );
        await updateProduct({ ...product, imageUrl });
      } else {
        const id = crypto.randomUUID();
        const imageUrl = await resolveProductImageForSave(
          id,
          data.imageUrl
        );
        await addProduct({ ...data, imageUrl }, id);
      }
      setFormOpen(false);
      setEditing(null);
    } catch (err) {
      console.error(err);
      setSubmitError(formatProductSaveError(err, "save"));
    } finally {
      setBusy(false);
    }
  };

  const openEdit = async (product: Product) => {
    setSubmitError(null);
    setBusy(true);
    try {
      const full = await fetchProductById(product.id);
      setEditing(full ?? product);
      setFormOpen(true);
    } catch (err) {
      console.error(err);
      setSubmitError("No se pudo cargar la foto del producto para editar.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSubmitError(null);
    setBusy(true);
    try {
      const supabase = getSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        setSubmitError(
          "La sesión expiró. Cerrá sesión y volvé a entrar antes de eliminar."
        );
        return;
      }

      await deleteProduct(id);
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      setSubmitError(formatProductSaveError(err, "delete"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl">
      <p className="mb-4 text-center text-xs text-gray-500 sm:text-left">
        Software desarrollado por{" "}
        <a
          href="https://www.instagram.com/cmrsoftware.sn/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-orange-600 hover:text-orange-700 hover:underline"
        >
          CMR SOFTWARE
        </a>
      </p>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-xl">
            <ShieldAlert className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-black">
              Panel de Administración
            </h1>
            <p className="text-sm text-gray-500">Gestión de productos</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-black">{products.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total productos</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {products.filter((p) => getStockStatus(p.stock) === "ok").length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Con stock</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-amber-500">
            {products.filter((p) => getStockStatus(p.stock) === "low").length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Stock bajo</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-red-500">
            {products.filter((p) => getStockStatus(p.stock) === "out").length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Sin stock</p>
        </div>
      </div>
      {/* Herramientas: QR y aumento de precios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* QR del sitio */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 self-start">
            <QrCode className="w-4 h-4 text-orange-600" />
            <h3 className="font-semibold text-sm text-black">QR del sitio</h3>
          </div>
          <div ref={qrRef} className="bg-white p-2 rounded">
            <QRCode value={SITE_URL} size={160} />
          </div>
          <p className="text-xs text-gray-400 text-center">{SITE_URL}</p>
          <button
            onClick={handleDownloadQR}
            className="flex items-center gap-2 text-sm font-medium text-orange-600 border border-orange-200 rounded-lg px-3 py-2 hover:bg-orange-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Descargar PNG
          </button>
        </div>

        {/* Aumento masivo de precios */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-600" />
            <h3 className="font-semibold text-sm text-black">Actualizar precios</h3>
          </div>

          {priceMode === "idle" && (
            <>
              <p className="text-xs text-gray-500">
                Aplicá un aumento porcentual a todos los productos. Los precios se redondean a $50.
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="-99"
                    max="1000"
                    value={pricePercent}
                    onChange={(e) => { setPricePercent(e.target.value); setPriceError(null); }}
                    placeholder="Ej: 15"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
                </div>
                <button
                  onClick={handlePricePreview}
                  disabled={!pricePercent || loading}
                  className="px-4 py-2 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors whitespace-nowrap"
                >
                  Previsualizar
                </button>
              </div>
              {priceError && <p className="text-xs text-red-600">{priceError}</p>}
            </>
          )}

          {priceMode === "preview" && (
            <>
              <p className="text-xs text-gray-500 font-medium">
                Aumento del {pricePercent}% — {pricePreview.length} productos
              </p>
              <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-100 divide-y divide-gray-100 text-xs">
                {pricePreview.map((item) => (
                  <div key={item.id} className="flex justify-between items-center px-3 py-1.5">
                    <span className="text-gray-700 truncate max-w-[55%]">{item.name}</span>
                    <span className="text-gray-400 line-through">{formatPrice(item.oldPrice)}</span>
                    <span className="font-semibold text-green-600">{formatPrice(item.newPrice)}</span>
                  </div>
                ))}
              </div>
              {priceError && <p className="text-xs text-red-600">{priceError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => { setPriceMode("idle"); setPriceError(null); }}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => void handleBulkApply()}
                  className="flex-1 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 transition-colors"
                >
                  Aplicar
                </button>
              </div>
            </>
          )}

          {priceMode === "applying" && (
            <div className="flex flex-col items-center justify-center py-6 gap-2 text-gray-500 text-sm">
              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              Actualizando precios...
            </div>
          )}
        </div>
      </div>

      {(error || submitError) && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 break-words">
          {submitError ?? error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o categoría..."
            className="w-full pl-9 pr-9 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          disabled={loading || busy}
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-orange-700 transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Nuevo producto
        </button>
      </div>

      <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 w-12">
                Img
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">
                Nombre
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">
                Categoría
              </th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">
                Precio
              </th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">
                Unidad
              </th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">
                Stock
              </th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600 w-24">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>{loading ? "Cargando productos..." : "No se encontraron productos"}</p>
                </td>
              </tr>
            ) : (
              filtered.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <AdminProductThumb product={product} />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-black truncate max-w-xs">
                      {product.name}
                    </p>
                    {product.description && (
                      <p className="text-xs text-gray-400 truncate max-w-xs">
                        {product.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-orange-50 text-orange-600 text-xs px-2 py-1 rounded-full font-medium">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-black">
                    {formatPrice(product.price)}
                    <span className="text-xs text-gray-400 font-normal">
                      /{product.unit}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {product.unit}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${STOCK_BADGE_CLASS[getStockStatus(product.stock)]}`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => void openEdit(product)}
                        disabled={busy}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(product.id)}
                        disabled={busy}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>{loading ? "Cargando productos..." : "No se encontraron productos"}</p>
          </div>
        ) : (
          filtered.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex gap-3"
            >
              <AdminProductThumb
                product={product}
                className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0"
                sizes="64px"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-black truncate text-sm">
                      {product.name}
                    </p>
                    <span className="bg-orange-50 text-orange-600 text-xs px-2 py-0.5 rounded-full font-medium">
                      {product.category}
                    </span>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => void openEdit(product)}
                      disabled={busy}
                      className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(product.id)}
                      disabled={busy}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2 text-sm">
                  <span className="font-bold text-black">
                    {formatPrice(product.price)}/{product.unit}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STOCK_BADGE_CLASS[getStockStatus(product.stock)]}`}
                  >
                    Stock: {product.stock}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {formOpen && (
        <ProductForm
          product={editing}
          onSave={handleSave}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-xl">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-bold text-black">¿Eliminar producto?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Esta acción no se puede deshacer. El producto será eliminado del
              catálogo.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => void handleDelete(deleteConfirm)}
                disabled={busy}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


