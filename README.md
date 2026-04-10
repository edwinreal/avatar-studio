# Avatar Studio

Estudio web de edición de video, generación de guiones y creación de contenido con IA.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React + Vite + TypeScript |
| Backend | Express + TypeScript |
| Base de datos | MongoDB |
| Colas de jobs | Redis + BullMQ |
| Storage local | MinIO (compatible S3) |
| IA | OpenAI API |
| Auth | JWT |
| Deploy web | Netlify |
| Deploy API | Render |

## Primer arranque

```bash
# 1. Copia las variables de entorno
cp .env.example .env

# 2. Instala dependencias
npm install

# 3. Levanta los servicios locales (requiere Docker Desktop)
npm run db:up

# 4. Inicia el proyecto completo
npm run dev
```

## URLs locales

| Servicio | URL |
|----------|-----|
| Web | http://localhost:5173 |
| API | http://localhost:4000 |
| API health | http://localhost:4000/health |
| MinIO consola | http://localhost:9001 |
| MongoDB | localhost:27017 |
| Redis | localhost:6379 |

## Credenciales locales por defecto

- **MinIO**: `minioadmin` / `minioadmin123`
- **MongoDB**: sin auth en desarrollo (base: `avatar_studio`)

## Roadmap

- [x] Monorepo configurado (web + api)
- [x] Infraestructura local (MongoDB + Redis + MinIO)
- [x] Deploy targets (Netlify + Render)
- [ ] Auth con JWT (registro, login, sesión)
- [ ] Biblioteca de proyectos
- [ ] Generación de guiones con IA
- [ ] Editor de video con timeline
- [ ] Corte y merge de clips
- [ ] Generación de video desde texto
