-- ============================================================
-- ReadHub — Políticas de Row Level Security (RLS)
-- Aplicar después de las migraciones 001–004
-- ============================================================

-- Función auxiliar: verifica si el usuario autenticado es admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ============================================================
-- PROFILES
-- Cada usuario solo puede ver y modificar su propio perfil
-- ============================================================

CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================================
-- ARTICLES
-- SELECT  → cualquiera puede leer artículos públicos
-- INSERT  → solo usuarios autenticados
-- UPDATE  → solo el autor
-- DELETE  → solo el autor
-- ============================================================

CREATE POLICY "articles_select_public"
  ON public.articles
  FOR SELECT
  USING (is_public = true);

CREATE POLICY "articles_select_own"
  ON public.articles
  FOR SELECT
  USING (author_id = auth.uid());

CREATE POLICY "articles_insert_authenticated"
  ON public.articles
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND author_id = auth.uid()
  );

CREATE POLICY "articles_update_author"
  ON public.articles
  FOR UPDATE
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "articles_delete_author"
  ON public.articles
  FOR DELETE
  USING (author_id = auth.uid());

-- ============================================================
-- COMMENTS
-- SELECT  → todos (autenticados o no)
-- INSERT  → solo autenticados
-- UPDATE  → solo el autor del comentario
-- DELETE  → autor del comentario o admin
-- ============================================================

CREATE POLICY "comments_select_all"
  ON public.comments
  FOR SELECT
  USING (true);

CREATE POLICY "comments_insert_authenticated"
  ON public.comments
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
  );

CREATE POLICY "comments_update_author"
  ON public.comments
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "comments_delete_author_or_admin"
  ON public.comments
  FOR DELETE
  USING (
    user_id = auth.uid()
    OR public.is_admin()
  );

-- ============================================================
-- LIKES
-- INSERT  → solo autenticados
-- DELETE  → solo el propietario del like
-- SELECT  → todos (necesario para mostrar contadores públicos)
-- ============================================================

CREATE POLICY "likes_select_all"
  ON public.likes
  FOR SELECT
  USING (true);

CREATE POLICY "likes_insert_authenticated"
  ON public.likes
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
  );

CREATE POLICY "likes_delete_owner"
  ON public.likes
  FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================
-- VIEWS
-- INSERT  → solo usuarios autenticados
-- SELECT  → admin o autor del artículo (para estadísticas)
-- ============================================================

CREATE POLICY "views_insert_authenticated"
  ON public.views
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
  );

CREATE POLICY "views_select_admin_or_author"
  ON public.views
  FOR SELECT
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.articles
      WHERE articles.id = views.article_id
        AND articles.author_id = auth.uid()
    )
  );

-- ============================================================
-- FAVORITES
-- SELECT  → solo el propietario
-- INSERT  → solo el propietario
-- DELETE  → solo el propietario
-- ============================================================

CREATE POLICY "favorites_select_owner"
  ON public.favorites
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "favorites_insert_owner"
  ON public.favorites
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
  );

CREATE POLICY "favorites_delete_owner"
  ON public.favorites
  FOR DELETE
  USING (user_id = auth.uid());
