# ReadHub

Plataforma de artículos potenciada por IA. Los usuarios pueden publicar, leer y consultar artículos mediante un sistema RAG con búsqueda semántica y chat conversacional.

## Descripción

ReadHub es una plataforma tipo Medium construida con Next.js, Supabase y modelos de IA. Permite subir artículos con documentos PDF, vectorizar su contenido y consultarlos en lenguaje natural mediante un asistente IA.

## Características

- Autenticación con Supabase Auth (roles: admin, writer, reader)
- Subida de artículos con imagen y documento PDF
- Sistema RAG: embeddings con HuggingFace + búsqueda semántica con pgvector
- Chat conversacional con contexto de artículos
- Servidor MCP con herramientas para agentes IA
- Pipeline CI/CD con calidad, E2E, performance y deploy automático a Vercel

## Arquitectura

```
Usuario
  ↓
Next.js (apps/web)
  ↓
API Routes (/api/v1/*)
  ↓
Supabase (PostgreSQL + pgvector)   HuggingFace (embeddings)   Claude/LLM (chat)
```

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS v4 |
| Backend | API Routes (Next.js), Supabase |
| Base de datos | PostgreSQL + pgvector (Supabase) |
| IA / RAG | HuggingFace all-MiniLM-L6-v2, LLaMA 3.1 |
| MCP | Servidor MCP con 5 tools y 5 resources |
| Testing | Vitest (unit) + Playwright (E2E) |
| CI/CD | GitHub Actions + Vercel |
| Monorepo | Turborepo |

## Base de datos

| Tabla | Descripción |
|-------|-------------|
| `profiles` | Usuarios del sistema |
| `articles` | Artículos publicados |
| `comments` | Comentarios por artículo |
| `likes` | Likes por artículo |
| `views` | Vistas por artículo |
| `favorites` | Favoritos por usuario |
| `article_embeddings` | Vectores para búsqueda semántica |

## Instalación

```bash
git clone https://github.com/ErIckYuCra/RebHub
cd RebHub
npm install
```

## Variables de entorno

Copia `.env.example` a `apps/web/.env.local` y completa los valores:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...

# IA
HUGGINGFACEHUB_API_TOKEN=hf_...

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Variables públicas vs privadas (Next.js)

- `NEXT_PUBLIC_*` → llegan al navegador (frontend)
- Sin prefijo → solo servidor, nunca expuestas al cliente

## Ejecución local

```bash
# Instalar dependencias desde la raíz del monorepo
npm install

# Correr la app web
cd apps/web && npm run dev

# Correr el servidor MCP
cd apps/mcp && tsx src/index.ts
```

## Estructura del proyecto

```
readhub/
├── apps/
│   ├── web/              ← Next.js app
│   │   ├── app/          ← Rutas y páginas
│   │   ├── components/   ← Componentes reutilizables
│   │   ├── hooks/        ← Custom hooks
│   │   ├── services/     ← Lógica de negocio
│   │   └── lib/          ← Configuraciones compartidas
│   └── mcp/              ← Servidor MCP
├── packages/
│   ├── types/            ← @readhub/types
│   ├── ai/               ← @readhub/ai
│   └── config/           ← @readhub/config
└── supabase/
    └── migrations/       ← Migraciones SQL
```

## API

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/v1/auth/register` | Registro de usuario |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/logout` | Logout |
| GET | `/api/v1/auth/me` | Usuario actual |
| GET | `/api/v1/articles` | Listar artículos |
| POST | `/api/v1/articles` | Crear artículo |
| GET | `/api/v1/articles/[id]` | Obtener artículo |
| POST | `/api/chat` | Chat RAG |
| GET | `/api/search` | Búsqueda semántica |

## Optimizaciones de Performance (Sesión 7)

### Mejoras implementadas

| Optimización | Archivo | Impacto en Core Web Vitals |
|---|---|---|
| `sizes` prop en `<Image fill>` | `ArticleCard.tsx` | LCP — descarga imágenes al tamaño correcto según viewport |
| `sizes` prop en imagen hero | `article/[id]/page.tsx` | LCP — evita descargar imagen 5000px para mostrarla en 768px |
| `loading.tsx` en `/home` | `app/(dashboard)/home/loading.tsx` | LCP percibido — Next.js hace streaming del layout mientras carga el contenido |
| `loading.tsx` en `/article/[id]` | `app/(dashboard)/article/[id]/loading.tsx` | LCP percibido — skeleton visible inmediatamente |
| `error.tsx` en dashboard | `app/(dashboard)/error.tsx` | Estabilidad — errores capturados sin colapsar el layout (mejora CLS) |

### Core Web Vitals — umbrales objetivo

| Métrica | Umbral | Descripción |
|---------|--------|-------------|
| LCP | < 4s (error) / < 2.5s (ideal) | Tiempo hasta el contenido principal visible |
| CLS | < 0.1 | Movimientos inesperados del layout |
| FCP | < 3s (warning) | Primer contenido en pantalla |
| Performance score | ≥ 70 | Score general de Lighthouse |

## Pipeline CI/CD

```
Push a main
    │
    ▼
[quality] TypeScript + ESLint + Vitest
    │ (si pasa)
    ▼
[e2e] Build + Playwright E2E
    │ (si pasa)
    ▼
[performance] Build + Lighthouse CI + Bundle Analysis
    │ (si score ≥ 70 y LCP < 4s y CLS < 0.1)
    ▼
[deploy] Vercel Production Deploy
```

### Artefactos generados por el pipeline

| Artefacto | Job | Contenido |
|-----------|-----|-----------|
| `coverage-report` | quality | Cobertura de tests Vitest |
| `playwright-report` | e2e | Reporte HTML de Playwright |
| `lighthouse-report` | performance | JSON + HTML de auditoría Lighthouse |

### Secrets requeridos en GitHub

| Secret | Origen | Uso |
|--------|--------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard | Build y tests |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard | Build y tests |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard | API routes |
| `HUGGINGFACE_API_KEY` | HuggingFace settings | Embeddings |
| `VERCEL_TOKEN` | Vercel Account Settings → Tokens | Deploy |
| `VERCEL_ORG_ID` | Vercel Team Settings → General | Deploy |
| `VERCEL_PROJECT_ID` | Vercel Project Settings → General | Deploy |

### Cómo interpretar el reporte de Lighthouse

El reporte se descarga desde GitHub Actions → workflow run → Artifacts → `lighthouse-report`. Contiene:
- `manifest.json`: scores por categoría (0–1, multiplicar por 100)
- `*.report.html`: reporte visual completo con recomendaciones

El pipeline falla automáticamente si:
- `performance` score < 0.70
- `largest-contentful-paint` > 4000ms
- `cumulative-layout-shift` > 0.1

### Despliegue en Vercel

El deploy se activa **únicamente** en `push` a `main` y solo si el job `performance` pasó. Vercel despliega la versión prebuilt del job anterior.

URL de producción: `https://reb-hub-web.vercel.app`

## Buenas prácticas de performance

- Usar `sizes` en todos los `<Image fill>` — indica al browser el tamaño real a mostrar
- Crear `loading.tsx` por ruta — habilita streaming y mejora LCP percibido
- Crear `error.tsx` por sección — evita que errores colapsen layouts (CLS)
- Usar `SELECT` con columnas específicas en Supabase (no `SELECT *`)
- No exponer `SUPABASE_SERVICE_ROLE_KEY` en variables `NEXT_PUBLIC_*`
- Rotar tokens de acceso periódicamente

## Despliegue

La app se despliega automáticamente a Vercel desde el pipeline CI/CD cuando:
1. Todos los tests (TypeScript, ESLint, Vitest, Playwright) pasan
2. Lighthouse score ≥ 70 y LCP < 4s y CLS < 0.1
3. El push es a la rama `main`
