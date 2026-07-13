-- ============================================================
-- ReadHub — Scripts de validación de políticas RLS
-- Ejecutar en Supabase SQL Editor DESPUÉS de seed.sql
--
-- Cada bloque abre una transacción, simula un usuario con
-- SET LOCAL, ejecuta las consultas y hace ROLLBACK para no
-- modificar los datos de prueba.
--
-- Resultados: pestaña "Messages" del SQL Editor
--
-- Usuarios de prueba:
--   admin@readhub.com   → a0000000-0000-0000-0000-000000000001  (admin)
--   writer1@readhub.com → a0000000-0000-0000-0000-000000000002  (writer)
--   writer2@readhub.com → a0000000-0000-0000-0000-000000000003  (writer)
--   reader1@readhub.com → a0000000-0000-0000-0000-000000000004  (reader)
--   reader2@readhub.com → a0000000-0000-0000-0000-000000000005  (reader)
-- ============================================================


-- ============================================================
-- BLOQUE 1: USUARIO ANÓNIMO
-- Esperado: solo ve artículos públicos, no puede insertar
-- ============================================================

BEGIN;
  SET LOCAL ROLE anon;
  SET LOCAL "request.jwt.claims" TO '{}';

  -- 1.1 Solo ve artículos públicos (5 de 6)
  SELECT
    CASE WHEN COUNT(*) = 5
      THEN '[PASS] 1.1 — Anónimo ve ' || COUNT(*) || ' artículos públicos'
      ELSE '[FAIL] 1.1 — Anónimo ve ' || COUNT(*) || ' artículos (esperado: 5)'
    END AS resultado
  FROM public.articles;

  -- 1.2 No ve el artículo privado
  SELECT
    CASE WHEN COUNT(*) = 0
      THEN '[PASS] 1.2 — Anónimo NO ve el artículo privado'
      ELSE '[FAIL] 1.2 — Anónimo VE el artículo privado'
    END AS resultado
  FROM public.articles
  WHERE id = 'b0000000-0000-0000-0000-000000000003';

  -- 1.3 Puede leer comentarios (política: todos)
  SELECT
    CASE WHEN COUNT(*) > 0
      THEN '[PASS] 1.3 — Anónimo lee ' || COUNT(*) || ' comentarios'
      ELSE '[FAIL] 1.3 — Anónimo no puede leer comentarios'
    END AS resultado
  FROM public.comments;

  -- 1.4 Puede leer likes (política: todos)
  SELECT
    CASE WHEN COUNT(*) > 0
      THEN '[PASS] 1.4 — Anónimo lee ' || COUNT(*) || ' likes'
      ELSE '[FAIL] 1.4 — Anónimo no puede leer likes'
    END AS resultado
  FROM public.likes;

  -- 1.5 No ve favoritos (política: solo propietario)
  SELECT
    CASE WHEN COUNT(*) = 0
      THEN '[PASS] 1.5 — Anónimo no ve favoritos'
      ELSE '[FAIL] 1.5 — Anónimo ve ' || COUNT(*) || ' favoritos (esperado: 0)'
    END AS resultado
  FROM public.favorites;

  -- 1.6 No ve vistas (política: admin o autor)
  SELECT
    CASE WHEN COUNT(*) = 0
      THEN '[PASS] 1.6 — Anónimo no ve vistas'
      ELSE '[FAIL] 1.6 — Anónimo ve ' || COUNT(*) || ' vistas (esperado: 0)'
    END AS resultado
  FROM public.views;

ROLLBACK;


-- ============================================================
-- BLOQUE 2: READER AUTENTICADO (reader1) — sin permisos especiales
-- Esperado: puede interactuar pero no modifica recursos ajenos
-- ============================================================

BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL "request.jwt.claims" TO
    '{"sub":"a0000000-0000-0000-0000-000000000004","role":"authenticated"}';

  -- 2.1 Ve artículos públicos
  SELECT
    CASE WHEN COUNT(*) = 5
      THEN '[PASS] 2.1 — Reader ve ' || COUNT(*) || ' artículos públicos'
      ELSE '[FAIL] 2.1 — Reader ve ' || COUNT(*) || ' artículos (esperado: 5)'
    END AS resultado
  FROM public.articles;

  -- 2.2 No ve artículo privado de writer1
  SELECT
    CASE WHEN COUNT(*) = 0
      THEN '[PASS] 2.2 — Reader NO ve artículo privado de writer1'
      ELSE '[FAIL] 2.2 — Reader VE artículo privado (esperado: 0)'
    END AS resultado
  FROM public.articles
  WHERE id = 'b0000000-0000-0000-0000-000000000003';

  -- 2.3 Puede insertar un like
  INSERT INTO public.likes (article_id, user_id)
  VALUES (
    'b0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000004'
  );
  SELECT '[PASS] 2.3 — Reader puede dar like' AS resultado;

  -- 2.4 Puede insertar un comentario
  INSERT INTO public.comments (article_id, user_id, comment)
  VALUES (
    'b0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000004',
    'Comentario de validación.'
  );
  SELECT '[PASS] 2.4 — Reader puede comentar' AS resultado;

  -- 2.5 Puede registrar una vista
  INSERT INTO public.views (article_id, user_id)
  VALUES (
    'b0000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000004'
  );
  SELECT '[PASS] 2.5 — Reader puede registrar una vista' AS resultado;

  -- 2.6 No puede ver vistas de artículo ajeno
  SELECT
    CASE WHEN COUNT(*) = 0
      THEN '[PASS] 2.6 — Reader NO ve vistas de artículos ajenos'
      ELSE '[FAIL] 2.6 — Reader VE ' || COUNT(*) || ' vistas ajenas'
    END AS resultado
  FROM public.views
  WHERE article_id = 'b0000000-0000-0000-0000-000000000001';

  -- 2.7 Solo ve sus propios favoritos
  SELECT '[INFO] 2.7 — Reader ve ' || COUNT(*) || ' favoritos propios' AS resultado
  FROM public.favorites
  WHERE user_id = 'a0000000-0000-0000-0000-000000000004';

  -- 2.8 No puede modificar artículo ajeno (0 filas afectadas)
  UPDATE public.articles SET title = 'Hack'
  WHERE id = 'b0000000-0000-0000-0000-000000000004';
  SELECT
    CASE WHEN COUNT(*) = 1
      THEN '[PASS] 2.8 — Reader NO modificó artículo ajeno (0 filas)'
      ELSE '[FAIL] 2.8 — UPDATE de artículo ajeno tuvo efecto'
    END AS resultado
  FROM public.articles
  WHERE id = 'b0000000-0000-0000-0000-000000000004'
    AND title = 'Tailwind CSS v4: lo que cambió y cómo migrar';

ROLLBACK;


-- ============================================================
-- BLOQUE 3: AUTOR DEL RECURSO (writer1)
-- Esperado: gestiona los suyos, bloqueado en ajenos
-- ============================================================

BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL "request.jwt.claims" TO
    '{"sub":"a0000000-0000-0000-0000-000000000002","role":"authenticated"}';

  -- 3.1 Ve sus 3 artículos (2 públicos + 1 privado)
  SELECT
    CASE WHEN COUNT(*) = 3
      THEN '[PASS] 3.1 — Writer1 ve sus ' || COUNT(*) || ' artículos (incluye privado)'
      ELSE '[FAIL] 3.1 — Writer1 ve ' || COUNT(*) || ' artículos (esperado: 3)'
    END AS resultado
  FROM public.articles
  WHERE author_id = 'a0000000-0000-0000-0000-000000000002';

  -- 3.2 Puede actualizar su propio artículo
  UPDATE public.articles
  SET summary = 'Resumen actualizado en test.'
  WHERE id = 'b0000000-0000-0000-0000-000000000001';
  SELECT
    CASE WHEN summary = 'Resumen actualizado en test.'
      THEN '[PASS] 3.2 — Writer1 actualizó su propio artículo'
      ELSE '[FAIL] 3.2 — Writer1 no pudo actualizar su artículo'
    END AS resultado
  FROM public.articles
  WHERE id = 'b0000000-0000-0000-0000-000000000001';

  -- 3.3 No puede actualizar artículo de writer2 (0 filas afectadas)
  UPDATE public.articles SET summary = 'Hack de writer1'
  WHERE id = 'b0000000-0000-0000-0000-000000000004';
  SELECT
    CASE WHEN summary != 'Hack de writer1'
      THEN '[PASS] 3.3 — Writer1 NO modificó artículo de writer2'
      ELSE '[FAIL] 3.3 — Writer1 modificó artículo ajeno'
    END AS resultado
  FROM public.articles
  WHERE id = 'b0000000-0000-0000-0000-000000000004';

  -- 3.4 Puede ver vistas de su propio artículo
  SELECT
    CASE WHEN COUNT(*) > 0
      THEN '[PASS] 3.4 — Writer1 ve ' || COUNT(*) || ' vistas de su artículo'
      ELSE '[FAIL] 3.4 — Writer1 no puede ver vistas de su propio artículo'
    END AS resultado
  FROM public.views
  WHERE article_id = 'b0000000-0000-0000-0000-000000000001';

  -- 3.5 No puede ver vistas de artículo de writer2
  SELECT
    CASE WHEN COUNT(*) = 0
      THEN '[PASS] 3.5 — Writer1 NO ve vistas de artículo ajeno'
      ELSE '[FAIL] 3.5 — Writer1 VE ' || COUNT(*) || ' vistas ajenas'
    END AS resultado
  FROM public.views
  WHERE article_id = 'b0000000-0000-0000-0000-000000000004';

ROLLBACK;


-- ============================================================
-- BLOQUE 4: ADMINISTRADOR
-- Esperado: ve todas las vistas, borra comentarios ajenos
-- ============================================================

BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL "request.jwt.claims" TO
    '{"sub":"a0000000-0000-0000-0000-000000000001","role":"authenticated"}';

  -- 4.1 Admin ve vistas de cualquier artículo
  SELECT
    CASE WHEN COUNT(*) > 0
      THEN '[PASS] 4.1 — Admin ve ' || COUNT(*) || ' vistas del artículo de writer1'
      ELSE '[FAIL] 4.1 — Admin no puede ver vistas ajenas'
    END AS resultado
  FROM public.views
  WHERE article_id = 'b0000000-0000-0000-0000-000000000001';

  -- 4.2 Admin puede eliminar comentario ajeno
  DELETE FROM public.comments
  WHERE article_id = 'b0000000-0000-0000-0000-000000000001'
    AND user_id = 'a0000000-0000-0000-0000-000000000005';
  SELECT
    CASE WHEN NOT EXISTS (
      SELECT 1 FROM public.comments
      WHERE article_id = 'b0000000-0000-0000-0000-000000000001'
        AND user_id = 'a0000000-0000-0000-0000-000000000005'
    )
    THEN '[PASS] 4.2 — Admin eliminó comentario ajeno'
    ELSE '[FAIL] 4.2 — Admin no pudo eliminar comentario ajeno'
    END AS resultado;

  -- 4.3 Admin NO puede modificar artículos ajenos (sin política UPDATE para admin)
  UPDATE public.articles SET title = 'Modificado por admin'
  WHERE id = 'b0000000-0000-0000-0000-000000000001';
  SELECT
    CASE WHEN title != 'Modificado por admin'
      THEN '[PASS] 4.3 — Admin NO modifica artículos ajenos (diseño intencional)'
      ELSE '[FAIL] 4.3 — Admin modificó artículo ajeno'
    END AS resultado
  FROM public.articles
  WHERE id = 'b0000000-0000-0000-0000-000000000001';

  -- 4.4 Admin solo ve su propio perfil
  SELECT
    CASE WHEN COUNT(*) = 1
      THEN '[PASS] 4.4 — Admin ve solo su propio perfil'
      ELSE '[FAIL] 4.4 — Admin ve ' || COUNT(*) || ' perfiles (esperado: 1)'
    END AS resultado
  FROM public.profiles;

ROLLBACK;


-- ============================================================
-- BLOQUE 5: RESTRICCIONES DE INTEGRIDAD (como superuser)
-- No necesita simular usuario — valida constraints de la DB
-- ============================================================

-- 5.1 Like duplicado → debe fallar por UNIQUE
DO $$
BEGIN
  INSERT INTO public.likes (article_id, user_id)
  VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000004'
  );
  RAISE WARNING '[FAIL] 5.1 — Like duplicado fue permitido';
EXCEPTION WHEN unique_violation THEN
  RAISE NOTICE '[PASS] 5.1 — Like duplicado rechazado por UNIQUE constraint';
END;
$$;

-- 5.2 Favorito duplicado → debe fallar por UNIQUE
DO $$
BEGIN
  INSERT INTO public.favorites (article_id, user_id)
  VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000004'
  );
  RAISE WARNING '[FAIL] 5.2 — Favorito duplicado fue permitido';
EXCEPTION WHEN unique_violation THEN
  RAISE NOTICE '[PASS] 5.2 — Favorito duplicado rechazado por UNIQUE constraint';
END;
$$;

-- 5.3 Artículo con autor inexistente → debe fallar por FK
DO $$
BEGIN
  INSERT INTO public.articles (author_id, title)
  VALUES ('99999999-9999-9999-9999-999999999999', 'Artículo huérfano');
  RAISE WARNING '[FAIL] 5.3 — Artículo con autor inexistente fue insertado';
EXCEPTION WHEN foreign_key_violation THEN
  RAISE NOTICE '[PASS] 5.3 — FK rechazó artículo con autor inexistente';
END;
$$;

-- 5.4 Views acepta múltiples eventos del mismo usuario (no tiene UNIQUE)
DO $$
DECLARE v_count INT;
BEGIN
  INSERT INTO public.views (article_id, user_id) VALUES
    ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000004'),
    ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000004');
  SELECT COUNT(*) INTO v_count FROM public.views
  WHERE article_id = 'b0000000-0000-0000-0000-000000000006'
    AND user_id    = 'a0000000-0000-0000-0000-000000000004';
  IF v_count >= 2 THEN
    RAISE NOTICE '[PASS] 5.4 — Views registra múltiples eventos (% filas)', v_count;
  ELSE
    RAISE WARNING '[FAIL] 5.4 — Views no registró eventos duplicados';
  END IF;
  -- Limpiar los inserts de este test
  DELETE FROM public.views
  WHERE article_id = 'b0000000-0000-0000-0000-000000000006'
    AND user_id    = 'a0000000-0000-0000-0000-000000000004'
    AND viewed_at >= NOW() - INTERVAL '5 seconds';
END;
$$;

-- 5.5 Role inválido → debe fallar por CHECK constraint
DO $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES ('88888888-8888-8888-8888-888888888888', 'superuser');
  RAISE WARNING '[FAIL] 5.5 — Role inválido fue aceptado';
EXCEPTION WHEN check_violation THEN
  RAISE NOTICE '[PASS] 5.5 — Role inválido rechazado por CHECK constraint';
END;
$$;
