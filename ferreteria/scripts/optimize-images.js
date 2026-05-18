/**
 * Convierte todos los PNG de public/products/ a WebP optimizado.
 * Los archivos .webp se guardan junto a los originales.
 * Los PNG originales se mantienen como fallback para URLs ya guardadas en Supabase.
 *
 * Uso: node scripts/optimize-images.js
 */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const INPUT_DIR = path.join(__dirname, "../public/products");
const WEBP_QUALITY = 82; // 80-85 es el punto óptimo calidad/peso para imágenes de producto

async function optimizeImages() {
  const files = fs.readdirSync(INPUT_DIR).filter((f) => f.endsWith(".png"));

  if (files.length === 0) {
    console.log("No se encontraron archivos PNG en", INPUT_DIR);
    return;
  }

  console.log(`Procesando ${files.length} imágenes...\n`);

  for (const file of files) {
    const inputPath = path.join(INPUT_DIR, file);
    const outputName = file.replace(".png", ".webp");
    const outputPath = path.join(INPUT_DIR, outputName);

    const beforeKB = Math.round(fs.statSync(inputPath).size / 1024);

    await sharp(inputPath).webp({ quality: WEBP_QUALITY }).toFile(outputPath);

    const afterKB = Math.round(fs.statSync(outputPath).size / 1024);
    const saving = Math.round(((beforeKB - afterKB) / beforeKB) * 100);

    console.log(`  ${file} → ${outputName}`);
    console.log(`  ${beforeKB}KB → ${afterKB}KB  (${saving}% menos)\n`);
  }

  console.log("Listo. Actualizá las URLs en data/products.ts para usar .webp");
}

optimizeImages().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
