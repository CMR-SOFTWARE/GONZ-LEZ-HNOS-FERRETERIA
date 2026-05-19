/**
 * Migra fotos base64 de public.products → Storage (mucho más rápido en el catálogo).
 *
 * Uso (desde ferreteria/):
 *   node scripts/migrate-base64-to-storage.mjs
 *
 * Requiere en .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (Supabase → Settings → API → service_role)
 */
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");

function loadEnv() {
  if (!existsSync(envPath)) {
    console.error("Falta ferreteria/.env.local");
    process.exit(1);
  }
  const env = {};
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Configurá NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local"
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey);
const BUCKET = "product-images";

async function main() {
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    console.error(error);
    process.exit(1);
  }

  let migrated = 0;
  let skipped = 0;

  for (const row of products ?? []) {
    const { data: imgRow, error: imgErr } = await supabase
      .from("products")
      .select("image_url")
      .eq("id", row.id)
      .maybeSingle();

    if (imgErr) {
      console.error(`✗ leer foto ${row.name}:`, imgErr.message);
      continue;
    }

    const img = imgRow?.image_url?.trim() ?? "";
    if (!img.startsWith("data:image/")) {
      skipped++;
      continue;
    }

    const base64 = img.split(",")[1];
    const input = Buffer.from(base64, "base64");
    const jpeg = await sharp(input)
      .rotate()
      .resize(900, 900, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();

    const path = `${row.id}.jpg`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, jpeg, {
        contentType: "image/jpeg",
        upsert: true,
        cacheControl: "31536000",
      });

    if (upErr) {
      console.error(`✗ ${row.name}:`, upErr.message);
      continue;
    }

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
    const { error: updErr } = await supabase
      .from("products")
      .update({ image_url: pub.publicUrl })
      .eq("id", row.id);

    if (updErr) {
      console.error(`✗ update ${row.name}:`, updErr.message);
      continue;
    }

    migrated++;
    console.log(`✓ ${row.name} (${Math.round(jpeg.length / 1024)} KB)`);
  }

  console.log(`\nListo: ${migrated} migrados, ${skipped} ya tenían URL.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
