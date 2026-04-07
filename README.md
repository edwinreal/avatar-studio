# Avatar Cinematic Studio

Base inicial para un estudio web de edicion y animacion de avatares 3D con una estetica cinematografica inspirada en animacion familiar moderna.

## Stack inicial

- `apps/web`: React + Vite + TypeScript para el editor y dashboard
- `apps/api`: Express + TypeScript + Prisma para la API
- `PostgreSQL`: base de datos con Docker
- `Git`: repositorio ya inicializado

## Primer arranque

1. Copia `.env.example` a `.env`
2. Instala dependencias con `npm install`
3. Levanta stack local (Postgres, Redis, MinIO) con `npm run db:up` (requiere Docker Desktop activo)
4. Genera Prisma con `npm run prisma:generate`
5. Ejecuta la migracion con `npm run prisma:migrate`
6. Si quieres datos demo, ejecuta `npm run prisma:seed`
7. Inicia todo con `npm run dev`

## URLs por defecto

- Web: `http://localhost:5173`
- API: `http://localhost:4000`
- Healthcheck API: `http://localhost:4000/health`

## Deploy en Netlify (web)

- Config listo en `netlify.toml`: build `npm run build -w @studio/web`, publish `apps/web/dist`, Node 20.
- En Netlify configura la variable `VITE_API_URL` apuntando a tu backend público (o `http://localhost:4000` si usas Netlify CLI en local).
- Si usas monorepo, Netlify detecta la raíz y usa el workspace; no necesitas subcarpeta base.
- Para previsualizar en local con Netlify CLI: `netlify dev` (usa el bloque `[dev]` del `netlify.toml`).

## Servicios locales (Docker)

- Postgres: `localhost:5432`, usuario `studio`, password `studio123`.
- Redis: `localhost:6379` para colas de jobs (BullMQ/Celery).
- MinIO: API `http://localhost:9000` y consola `http://localhost:9001` (`minioadmin` / `minioadmin123`).
Activa Docker Desktop antes de `npm run db:up`.

## Roadmap sugerido

1. Autenticacion y cuentas de estudio
2. Biblioteca de avatares y proyectos
3. Subida de referencias e imagenes
4. Timeline de animacion y poses
5. Render preview y exportaciones
6. Integracion futura con IA para rigging, lipsync o estilos visuales propios
