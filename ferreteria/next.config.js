/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
};

// Static export solo en `next build` (NODE_ENV=production). En `next dev` no usar
// output: "export" evita el bug del dev server: "missing required error components".
if (process.env.NODE_ENV === "production") {
  nextConfig.output = "export";
}

module.exports = nextConfig;
