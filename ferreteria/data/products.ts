export type Unit = "unidad" | "metro" | "litro" | "caja";

export type Category =
  | "Herramientas"
  | "Electricidad"
  | "Plomería"
  | "Pinturas";

export interface Product {
  id: string;
  name: string;
  price: number;
  unit: Unit;
  stock: number;
  imageUrl: string;
  category: Category;
  description?: string;
}

export const CATEGORIES: Category[] = [
  "Herramientas",
  "Electricidad",
  "Plomería",
  "Pinturas",
];

export const products: Product[] = [
  // Herramientas
  {
    id: "h001",
    name: "Taladro percutor 13mm 650W",
    price: 45900,
    unit: "unidad",
    stock: 15,
    imageUrl: "/products/product-1.png",
    category: "Herramientas",
    description: "Incluye empuñadura lateral y tope de profundidad",
  },
  {
    id: "h002",
    name: "Juego de destornilladores 6 piezas",
    price: 8500,
    unit: "unidad",
    stock: 30,
    imageUrl: "/products/product-2.png",
    category: "Herramientas",
    description: "Mango ergonómico con puntas imantadas",
  },
  {
    id: "h003",
    name: "Martillo de Carpintero 25oz",
    price: 12300,
    unit: "unidad",
    stock: 20,
    imageUrl: "/products/product-3.png",
    category: "Herramientas",
  },
  {
    id: "h004",
    name: "Llave francesa 12 pulgadas",
    price: 9800,
    unit: "unidad",
    stock: 25,
    imageUrl: "/products/product-4.png",
    category: "Herramientas",
    description: "Apertura regulable para trabajos generales",
  },
  {
    id: "h005",
    name: "Pinza universal 8 pulgadas",
    price: 7200,
    unit: "unidad",
    stock: 12,
    imageUrl: "/products/product-5.png",
    category: "Herramientas",
    description: "Acero templado con mango antideslizante",
  },

  // Electricidad
  {
    id: "e001",
    name: "Cable unipolar 2.5mm",
    price: 850,
    unit: "metro",
    stock: 500,
    imageUrl: "/products/product-6.png",
    category: "Electricidad",
    description: "Cable flexible para instalaciones domiciliarias",
  },
  {
    id: "e002",
    name: "Cable taller 3x1.5mm",
    price: 1250,
    unit: "metro",
    stock: 300,
    imageUrl: "/products/product-7.png",
    category: "Electricidad",
    description: "Ideal para alargues y herramientas eléctricas",
  },
  {
    id: "e003",
    name: "Disyuntor termomagnético 20A",
    price: 3900,
    unit: "unidad",
    stock: 25,
    imageUrl: "/products/product-6.png",
    category: "Electricidad",
  },

  // Plomería
  {
    id: "p001",
    name: "Caño PVC presión 1/2\"",
    price: 450,
    unit: "metro",
    stock: 200,
    imageUrl: "/products/product-4.png",
    category: "Plomería",
    description: "Para agua fría y caliente hasta 60°C",
  },
  {
    id: "p002",
    name: "Llave de paso esfera 3/4\"",
    price: 2800,
    unit: "unidad",
    stock: 20,
    imageUrl: "/products/product-5.png",
    category: "Plomería",
  },
  {
    id: "p003",
    name: "Teflon 12mm x 10m",
    price: 320,
    unit: "unidad",
    stock: 100,
    imageUrl: "/products/product-7.png",
    category: "Plomería",
  },
  {
    id: "p004",
    name: "Grifería monocomando lavabo",
    price: 12500,
    unit: "unidad",
    stock: 8,
    imageUrl: "/products/product-6.png",
    category: "Plomería",
    description: "Cromada, incluye flexibles y sifón",
  },

  // Pinturas
  {
    id: "pi001",
    name: "Pintura látex interior blanco",
    price: 5800,
    unit: "litro",
    stock: 80,
    imageUrl: "/products/product-1.png",
    category: "Pinturas",
    description: "Lavable, alto rendimiento, base agua",
  },
  {
    id: "pi002",
    name: "Esmalte sintético negro brillante",
    price: 6200,
    unit: "litro",
    stock: 30,
    imageUrl: "/products/product-2.png",
    category: "Pinturas",
  },
  {
    id: "pi003",
    name: "Pintura antihumedad blanca",
    price: 7400,
    unit: "litro",
    stock: 25,
    imageUrl: "/products/product-3.png",
    category: "Pinturas",
    description: "Para paredes con humedad, uso interior/exterior",
  },
  {
    id: "pi004",
    name: "Rodillo felpa 23cm",
    price: 1800,
    unit: "unidad",
    stock: 35,
    imageUrl: "/products/product-4.png",
    category: "Pinturas",
    description: "Mango plástico incluido",
  },
];
