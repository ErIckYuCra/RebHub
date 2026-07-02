-- Migración 004: Índices para optimizar consultas frecuentes

CREATE INDEX idx_articles_author_id  ON public.articles  (author_id);
CREATE INDEX idx_views_article_id    ON public.views     (article_id);
CREATE INDEX idx_likes_article_id    ON public.likes     (article_id);
CREATE INDEX idx_comments_article_id ON public.comments  (article_id);
CREATE INDEX idx_favorites_article_id ON public.favorites (article_id);

-- Índices adicionales para consultas por usuario
CREATE INDEX idx_views_user_id     ON public.views     (user_id);
CREATE INDEX idx_likes_user_id     ON public.likes     (user_id);
CREATE INDEX idx_comments_user_id  ON public.comments  (user_id);
CREATE INDEX idx_favorites_user_id ON public.favorites (user_id);
