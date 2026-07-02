-- ============================================================
-- ReadHub — Esquema completo de la base de datos
-- Aplicar en orden ejecutando las migraciones de Supabase
-- ============================================================

-- 1. profiles (extiende auth.users con relación 1:1)
-- ┌─────────────┬────────────┬────────────────────────────────────┐
-- │ id          │ UUID PK FK │ Mismo UUID que auth.users          │
-- │ birth_date  │ DATE       │ Fecha de nacimiento                │
-- │ phone       │ TEXT       │ Número de celular                  │
-- │ role        │ TEXT       │ reader | writer | admin            │
-- │ created_at  │ TIMESTAMPTZ│ Fecha de registro                  │
-- └─────────────┴────────────┴────────────────────────────────────┘

-- 2. articles
-- ┌───────────────┬────────────┬────────────────────────────────────┐
-- │ id            │ UUID PK    │ gen_random_uuid()                  │
-- │ author_id     │ UUID FK    │ → profiles(id)                     │
-- │ title         │ TEXT       │ NOT NULL                           │
-- │ summary       │ TEXT       │ Vista previa del artículo          │
-- │ document_path │ TEXT       │ Ruta en Supabase Storage           │
-- │ image_path    │ TEXT       │ Ruta en Supabase Storage           │
-- │ is_public     │ BOOLEAN    │ DEFAULT false                      │
-- │ created_at    │ TIMESTAMPTZ│ DEFAULT NOW()                      │
-- └───────────────┴────────────┴────────────────────────────────────┘

-- 3. views (eventos — no contadores)
-- ┌────────────┬────────────┬────────────────────────────────────┐
-- │ id         │ UUID PK    │ gen_random_uuid()                  │
-- │ article_id │ UUID FK    │ → articles(id)                     │
-- │ user_id    │ UUID FK    │ → profiles(id)                     │
-- │ viewed_at  │ TIMESTAMPTZ│ DEFAULT NOW()                      │
-- └────────────┴────────────┴────────────────────────────────────┘

-- 4. likes (UNIQUE article_id + user_id)
-- ┌────────────┬────────────┬────────────────────────────────────┐
-- │ id         │ UUID PK    │ gen_random_uuid()                  │
-- │ article_id │ UUID FK    │ → articles(id)                     │
-- │ user_id    │ UUID FK    │ → profiles(id)                     │
-- │ created_at │ TIMESTAMPTZ│ DEFAULT NOW()                      │
-- └────────────┴────────────┴────────────────────────────────────┘

-- 5. comments
-- ┌────────────┬────────────┬────────────────────────────────────┐
-- │ id         │ UUID PK    │ gen_random_uuid()                  │
-- │ article_id │ UUID FK    │ → articles(id)                     │
-- │ user_id    │ UUID FK    │ → profiles(id)                     │
-- │ comment    │ TEXT       │ NOT NULL                           │
-- │ created_at │ TIMESTAMPTZ│ DEFAULT NOW()                      │
-- └────────────┴────────────┴────────────────────────────────────┘

-- 6. favorites (UNIQUE article_id + user_id)
-- ┌────────────┬────────────┬────────────────────────────────────┐
-- │ id         │ UUID PK    │ gen_random_uuid()                  │
-- │ article_id │ UUID FK    │ → articles(id)                     │
-- │ user_id    │ UUID FK    │ → profiles(id)                     │
-- │ created_at │ TIMESTAMPTZ│ DEFAULT NOW()                      │
-- └────────────┴────────────┴────────────────────────────────────┘

-- Relaciones
-- auth.users 1──1 profiles
-- profiles   1──N articles
-- articles   1──N views
-- articles   1──N likes     (UNIQUE por usuario)
-- articles   1──N comments
-- articles   1──N favorites (UNIQUE por usuario)

-- Índices
-- articles.author_id, views.article_id, likes.article_id
-- comments.article_id, favorites.article_id
-- + índices por user_id en todas las tablas de interacción
