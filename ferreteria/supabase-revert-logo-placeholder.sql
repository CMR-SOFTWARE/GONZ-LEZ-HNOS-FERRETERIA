-- Si ejecutaste el script viejo que ponía el LOGO en todos los productos, corré esto:
-- (las fotos base64 originales ya no se recuperan solas; después usá npm run migrate-images)

update public.products
set image_url = '/products/placeholder.svg'
where image_url like '%logo-gonzalez%';
