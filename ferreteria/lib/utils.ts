export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatQuantity(quantity: number, unit: string): string {
  if (unit === "metro" || unit === "litro") {
    return quantity % 1 === 0 ? `${quantity}` : quantity.toFixed(2);
  }
  return `${Math.round(quantity)}`;
}

export function isDecimalUnit(unit: string): boolean {
  return unit === "metro" || unit === "litro";
}
