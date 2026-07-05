import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/CartContext";
import { ProductStoreProvider } from "@/lib/ProductStoreContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  SITE_URL,
  STORE_CITY,
  STORE_COUNTRY,
  STORE_GOOGLE_MAPS_URL,
  STORE_INSTAGRAM_URL,
  STORE_NAME,
  STORE_OPENING_HOURS,
  STORE_PHONE_E164,
  STORE_POSTAL_CODE,
  STORE_REGION,
  STORE_SEO_DESCRIPTION,
  STORE_SEO_TITLE,
  STORE_STREET_ADDRESS,
} from "@/lib/siteConfig";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: STORE_SEO_TITLE,
    template: `%s | ${STORE_NAME}`,
  },
  description: STORE_SEO_DESCRIPTION,
  keywords: [
    "ferreteria san nicolas",
    "ferreteria en san nicolas de los arroyos",
    "ferreteria san nicolas de los arroyos",
    "herramientas san nicolas",
    STORE_NAME,
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: SITE_URL,
    siteName: STORE_NAME,
    title: STORE_SEO_TITLE,
    description: STORE_SEO_DESCRIPTION,
    images: [{ url: "/logo-gonzalez-hermanos.png" }],
  },
  icons: {
    icon: [{ url: "/logo-gonzalez-hermanos.png", type: "image/png" }],
    apple: [{ url: "/logo-gonzalez-hermanos.png", type: "image/png" }],
  },
  verification: {
    google: "BvsWhdWmTZJFov431Zw4zmoolicPxiWBrjM6L9vC7QY",
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "HardwareStore",
  name: STORE_NAME,
  image: `${SITE_URL}/logo-gonzalez-hermanos.png`,
  url: SITE_URL,
  telephone: STORE_PHONE_E164,
  address: {
    "@type": "PostalAddress",
    streetAddress: STORE_STREET_ADDRESS,
    addressLocality: STORE_CITY,
    addressRegion: STORE_REGION,
    postalCode: STORE_POSTAL_CODE,
    addressCountry: STORE_COUNTRY,
  },
  openingHoursSpecification: STORE_OPENING_HOURS.map((h) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: h.days,
    opens: h.opens,
    closes: h.closes,
  })),
  hasMap: STORE_GOOGLE_MAPS_URL,
  sameAs: [STORE_INSTAGRAM_URL],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
      </head>
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


