import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/CartContext";
import { ProductStoreProvider } from "@/lib/ProductStoreContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });
const STORE_NAME = "GONZ\u00C1LEZ-HNOS FERRETERIA";

export const metadata: Metadata = {
  title: STORE_NAME,
  description: "Catalogo online de ferreteria con pedidos por WhatsApp.",
  icons: {
    icon: [{ url: "/logo-gonzalez-hermanos.png", type: "image/png" }],
    apple: [{ url: "/logo-gonzalez-hermanos.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`${inter.className} bg-gray-50 min-h-screen flex flex-col`}
      >
        <ProductStoreProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 min-w-0">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </ProductStoreProvider>
      </body>
    </html>
  );
}


