-- Migración 002: Tabla articles

CREATE TABLE public.articles (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id      UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title          TEXT        NOT NULL,
  summary        TEXT,
  document_path  TEXT,
  image_path     TEXT,
  is_public      BOOLEAN     NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
