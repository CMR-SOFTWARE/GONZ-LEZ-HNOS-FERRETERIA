-- Arreglo: fotos guardadas como base64 en image_url (~1–2 MB c/u) hacen timeout al listar el catálogo.
-- Ejecutar en Supabase → SQL Editor (una vez).
--
-- Opción A: placeholder hasta volver a subir fotos con URL (/products/...) en el panel admin.
update public.products
set image_url = '/products/placeholder.svg'
where image_url like 'data:image%';

-- Si antes usaste el logo como placeholder, corregilo así:
-- update public.products
-- set image_url = '/products/placeholder.svg'
-- where image_url like '%logo-gonzalez%';

-- Opción B (si querés borrar solo las más pesadas y dejar URLs normales):
-- update public.products
-- set image_url = '/logo-gonzalez-hermanos.png'
-- where length(image_url) > 500000;

-- Después: en el panel admin, editá cada producto y usá «pegar URL» o subí JPG/WebP chicos (< 300 KB).
