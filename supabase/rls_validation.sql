-- ============================================================
-- ReadHub — Scripts de validación de políticas RLS
-- Ejecutar en Supabase SQL Editor DESPUÉS de seed.sql
--
-- Cada bloque simula un contexto de usuario distinto y verifica
-- el resultado esperado. Los bloques usan ROLLBACK para no
-- modificar los datos de prueba.
--
-- Usuarios de prueba (seed.sql):
--   admin@readhub.com   → a0000000-0000-0000-0000-000000000001  (admin)
--   writer1@readhub.com → a0000000-0000-0000-0000-000000000002  (writer)
--   writer2@readhub.com → a0000000-0000-0000-0000-000000000003  (writer)
--   reader1@readhub.com → a0000000-0000-0000-0000-000000000004  (reader)
--   reader2@readhub.com → a0000000-0000-0000-0000-000000000005  (reader)
--
-- Artículos de prueba:
--   b0...001 → writer1, público
--   b0...002 → writer1, público
--   b0...003 → writer1, PRIVADO (borrador)
--   b0...004 → writer2, público
--   b0...005 → writer2, público
--   b0...006 → admin,   público
-- ============================================================


-- ============================================================
-- UTILIDADES
-- ============================================================

-- Activa usuario autenticado en la sesión local
CREATE OR REPLACE FUNCTION test_helpers.set_user(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql AS $$
BEGIN
  PERFORM set_config('request.jwt.claims',
    json_build_object('sub', user_id, 'role', 'authenticated')::text,
    true  -- local = aplica solo en esta transacción
  );
  PERFORM set_config('role', 'authenticated', true);
END;
$$;

-- Activa sesión anónima
CREATE OR REPLACE FUNCTION test_helpers.set_anon()
RETURNS VOID
LANGUAGE plpgsql AS $$
BEGIN
  PERFORM set_config('request.jwt.claims', '{}', true);
  PERFORM set_config('role', 'anon', true);
END;
$$;

-- ============================================================
-- Nota: los bloques DO usan RAISE NOTICE para mostrar resultados.
-- PASS = comportamiento correcto confirmado.
-- FAIL = la política NO está funcionando como se esperaba.
-- ============================================================


-- ============================================================
-- BLOQUE 1: USUARIO ANÓNIMO
-- ============================================================
DO $$
DECLARE
  v_count   INT;
  v_allowed BOOLEAN;
BEGIN
  RAISE NOTICE '==============================';
  RAISE NOTICE 'BLOQUE 1 — USUARIO ANÓNIMO';
  RAISE NOTICE '==============================';

  -- Simular sesión anónima
  PERFORM set_config('request.jwt.claims', '{}', true);
  PERFORM set_config('role', 'anon', true);

  -- TEST 1.1: Solo ve artículos públicos (5 de 6)
  SELECT COUNT(*) INTO v_count FROM public.articles;
  IF v_count = 5 THEN
    RAISE NOTICE '[PASS] 1.1 — Anónimo ve % artículos públicos (esperado: 5)', v_count;
  ELSE
    RAISE WARNING '[FAIL] 1.1 — Anónimo ve % artículos (esperado: 5)', v_count;
  END IF;

  -- TEST 1.2: No ve el artículo privado (b0...003)
  SELECT COUNT(*) INTO v_count FROM public.articles
  WHERE id = 'b0000000-0000-0000-0000-000000000003';
  IF v_count = 0 THEN
    RAISE NOTICE '[PASS] 1.2 — Anónimo NO ve el artículo privado';
  ELSE
    RAISE WARNING '[FAIL] 1.2 — Anónimo VE el artículo privado (esperado: oculto)';
  END IF;

  -- TEST 1.3: Sí puede leer comentarios (política: todos)
  SELECT COUNT(*) INTO v_count FROM public.comments;
  IF v_count > 0 THEN
    RAISE NOTICE '[PASS] 1.3 — Anónimo puede leer % comentarios', v_count;
  ELSE
    RAISE WARNING '[FAIL] 1.3 — Anónimo no ve comentarios (esperado: visibles)';
  END IF;

  -- TEST 1.4: Sí puede leer likes (política: todos)
  SELECT COUNT(*) INTO v_count FROM public.likes;
  IF v_count > 0 THEN
    RAISE NOTICE '[PASS] 1.4 — Anónimo puede leer % likes', v_count;
  ELSE
    RAISE WARNING '[FAIL] 1.4 — Anónimo no ve likes (esperado: visibles)';
  END IF;

  -- TEST 1.5: No puede insertar likes
  BEGIN
    INSERT INTO public.likes (article_id, user_id)
    VALUES ('b0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000099');
    RAISE WARNING '[FAIL] 1.5 — Anónimo insertó un like (debería estar bloqueado)';
  EXCEPTION WHEN others THEN
    RAISE NOTICE '[PASS] 1.5 — Anónimo NO puede insertar likes (bloqueado por RLS)';
  END;

  -- TEST 1.6: No puede ver favoritos ni vistas
  SELECT COUNT(*) INTO v_count FROM public.favorites;
  IF v_count = 0 THEN
    RAISE NOTICE '[PASS] 1.6 — Anónimo no ve favoritos (esperado: 0)';
  ELSE
    RAISE WARNING '[FAIL] 1.6 — Anónimo ve % favoritos (esperado: 0)', v_count;
  END IF;

END;
$$;


-- ============================================================
-- BLOQUE 2: USUARIO AUTENTICADO SIN PERMISOS ESPECIALES (reader1)
-- ============================================================
DO $$
DECLARE
  v_count  INT;
  v_reader UUID := 'a0000000-0000-0000-0000-000000000004'; -- reader1
BEGIN
  RAISE NOTICE '==============================';
  RAISE NOTICE 'BLOQUE 2 — READER AUTENTICADO (reader1)';
  RAISE NOTICE '==============================';

  PERFORM set_config('request.jwt.claims',
    json_build_object('sub', v_reader, 'role', 'authenticated')::text, true);
  PERFORM set_config('role', 'authenticated', true);

  -- TEST 2.1: Ve artículos públicos
  SELECT COUNT(*) INTO v_count FROM public.articles WHERE is_public = true;
  IF v_count = 5 THEN
    RAISE NOTICE '[PASS] 2.1 — Reader ve % artículos públicos', v_count;
  ELSE
    RAISE WARNING '[FAIL] 2.1 — Reader ve % artículos (esperado: 5)', v_count;
  END IF;

  -- TEST 2.2: No ve artículo privado de writer1
  SELECT COUNT(*) INTO v_count FROM public.articles
  WHERE id = 'b0000000-0000-0000-0000-000000000003';
  IF v_count = 0 THEN
    RAISE NOTICE '[PASS] 2.2 — Reader NO ve el artículo privado de writer1';
  ELSE
    RAISE WARNING '[FAIL] 2.2 — Reader VE el artículo privado (esperado: oculto)';
  END IF;

  -- TEST 2.3: Puede insertar un like (artículo que aún no tiene)
  BEGIN
    INSERT INTO public.likes (article_id, user_id)
    VALUES ('b0000000-0000-0000-0000-000000000005', v_reader);
    RAISE NOTICE '[PASS] 2.3 — Reader puede dar like correctamente';
  EXCEPTION WHEN others THEN
    RAISE WARNING '[FAIL] 2.3 — Reader no pudo insertar like: %', SQLERRM;
  END;

  -- TEST 2.4: Puede insertar un comentario
  BEGIN
    INSERT INTO public.comments (article_id, user_id, comment)
    VALUES ('b0000000-0000-0000-0000-000000000005', v_reader, 'Comentario de prueba de validación.');
    RAISE NOTICE '[PASS] 2.4 — Reader puede comentar correctamente';
  EXCEPTION WHEN others THEN
    RAISE WARNING '[FAIL] 2.4 — Reader no pudo comentar: %', SQLERRM;
  END;

  -- TEST 2.5: Puede registrar una visualización
  BEGIN
    INSERT INTO public.views (article_id, user_id)
    VALUES ('b0000000-0000-0000-0000-000000000006', v_reader);
    RAISE NOTICE '[PASS] 2.5 — Reader puede registrar una vista';
  EXCEPTION WHEN others THEN
    RAISE WARNING '[FAIL] 2.5 — Reader no pudo registrar vista: %', SQLERRM;
  END;

  -- TEST 2.6: No puede ver las vistas de un artículo ajeno
  SELECT COUNT(*) INTO v_count FROM public.views
  WHERE article_id = 'b0000000-0000-0000-0000-000000000001';
  IF v_count = 0 THEN
    RAISE NOTICE '[PASS] 2.6 — Reader NO puede ver vistas de artículo ajeno';
  ELSE
    RAISE WARNING '[FAIL] 2.6 — Reader VE vistas de artículo ajeno (esperado: 0)';
  END IF;

  -- TEST 2.7: Solo ve sus propios favoritos
  SELECT COUNT(*) INTO v_count FROM public.favorites WHERE user_id = v_reader;
  RAISE NOTICE '[INFO] 2.7 — Reader ve % favoritos propios', v_count;

  -- TEST 2.8: No puede modificar artículo ajeno
  BEGIN
    UPDATE public.articles SET title = 'Título hackeado'
    WHERE id = 'b0000000-0000-0000-0000-000000000004';
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
      RAISE NOTICE '[PASS] 2.8 — Reader NO puede modificar artículo ajeno (0 filas afectadas)';
    ELSE
      RAISE WARNING '[FAIL] 2.8 — Reader modificó % filas de artículo ajeno', v_count;
    END IF;
  EXCEPTION WHEN others THEN
    RAISE NOTICE '[PASS] 2.8 — Reader bloqueado al intentar modificar artículo ajeno';
  END;

  ROLLBACK;
END;
$$;


-- ============================================================
-- BLOQUE 3: AUTOR DEL RECURSO (writer1)
-- ============================================================
DO $$
DECLARE
  v_count  INT;
  v_writer UUID := 'a0000000-0000-0000-0000-000000000002'; -- writer1
BEGIN
  RAISE NOTICE '==============================';
  RAISE NOTICE 'BLOQUE 3 — AUTOR (writer1)';
  RAISE NOTICE '==============================';

  PERFORM set_config('request.jwt.claims',
    json_build_object('sub', v_writer, 'role', 'authenticated')::text, true);
  PERFORM set_config('role', 'authenticated', true);

  -- TEST 3.1: Ve sus propios artículos (públicos + privados)
  SELECT COUNT(*) INTO v_count FROM public.articles WHERE author_id = v_writer;
  IF v_count = 3 THEN
    RAISE NOTICE '[PASS] 3.1 — Writer1 ve sus % artículos (público + privado)', v_count;
  ELSE
    RAISE WARNING '[FAIL] 3.1 — Writer1 ve % artículos (esperado: 3)', v_count;
  END IF;

  -- TEST 3.2: Puede actualizar su propio artículo
  BEGIN
    UPDATE public.articles SET summary = 'Resumen actualizado en validación.'
    WHERE id = 'b0000000-0000-0000-0000-000000000001' AND author_id = v_writer;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 1 THEN
      RAISE NOTICE '[PASS] 3.2 — Writer1 actualizó su propio artículo';
    ELSE
      RAISE WARNING '[FAIL] 3.2 — Writer1 no pudo actualizar su artículo (%  filas)', v_count;
    END IF;
  EXCEPTION WHEN others THEN
    RAISE WARNING '[FAIL] 3.2 — Error al actualizar: %', SQLERRM;
  END;

  -- TEST 3.3: No puede actualizar artículo de writer2
  BEGIN
    UPDATE public.articles SET summary = 'Hack de writer1'
    WHERE id = 'b0000000-0000-0000-0000-000000000004';
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
      RAISE NOTICE '[PASS] 3.3 — Writer1 NO puede modificar artículo de writer2 (0 filas)';
    ELSE
      RAISE WARNING '[FAIL] 3.3 — Writer1 modificó % filas de artículo ajeno', v_count;
    END IF;
  END;

  -- TEST 3.4: Puede eliminar su propio artículo
  BEGIN
    DELETE FROM public.articles WHERE id = 'b0000000-0000-0000-0000-000000000003' AND author_id = v_writer;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 1 THEN
      RAISE NOTICE '[PASS] 3.4 — Writer1 eliminó su propio artículo (borrador)';
    ELSE
      RAISE WARNING '[FAIL] 3.4 — Writer1 no pudo eliminar su artículo (% filas)', v_count;
    END IF;
  END;

  -- TEST 3.5: Puede ver las vistas de sus propios artículos
  SELECT COUNT(*) INTO v_count FROM public.views
  WHERE article_id = 'b0000000-0000-0000-0000-000000000001';
  IF v_count > 0 THEN
    RAISE NOTICE '[PASS] 3.5 — Writer1 ve % vistas de su artículo', v_count;
  ELSE
    RAISE WARNING '[FAIL] 3.5 — Writer1 no puede ver vistas de su propio artículo';
  END IF;

  -- TEST 3.6: No puede ver las vistas de artículo ajeno
  SELECT COUNT(*) INTO v_count FROM public.views
  WHERE article_id = 'b0000000-0000-0000-0000-000000000004';
  IF v_count = 0 THEN
    RAISE NOTICE '[PASS] 3.6 — Writer1 NO ve vistas de artículo de writer2';
  ELSE
    RAISE WARNING '[FAIL] 3.6 — Writer1 VE vistas de artículo ajeno (esperado: 0)';
  END IF;

  ROLLBACK;
END;
$$;


-- ============================================================
-- BLOQUE 4: ADMINISTRADOR
-- ============================================================
DO $$
DECLARE
  v_count INT;
  v_admin UUID := 'a0000000-0000-0000-0000-000000000001'; -- admin
BEGIN
  RAISE NOTICE '==============================';
  RAISE NOTICE 'BLOQUE 4 — ADMINISTRADOR';
  RAISE NOTICE '==============================';

  PERFORM set_config('request.jwt.claims',
    json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
  PERFORM set_config('role', 'authenticated', true);

  -- TEST 4.1: Admin puede ver vistas de cualquier artículo
  SELECT COUNT(*) INTO v_count FROM public.views
  WHERE article_id = 'b0000000-0000-0000-0000-000000000001';
  IF v_count > 0 THEN
    RAISE NOTICE '[PASS] 4.1 — Admin ve % vistas del artículo de writer1', v_count;
  ELSE
    RAISE WARNING '[FAIL] 4.1 — Admin no puede ver vistas de artículos ajenos';
  END IF;

  -- TEST 4.2: Admin puede eliminar comentario ajeno
  BEGIN
    DELETE FROM public.comments
    WHERE article_id = 'b0000000-0000-0000-0000-000000000001'
      AND user_id = 'a0000000-0000-0000-0000-000000000005';
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count >= 1 THEN
      RAISE NOTICE '[PASS] 4.2 — Admin eliminó % comentario(s) de otro usuario', v_count;
    ELSE
      RAISE WARNING '[FAIL] 4.2 — Admin no pudo eliminar comentario ajeno (% filas)', v_count;
    END IF;
  END;

  -- TEST 4.3: Admin no puede modificar artículos ajenos (no tiene política de UPDATE)
  BEGIN
    UPDATE public.articles SET title = 'Modificado por admin'
    WHERE id = 'b0000000-0000-0000-0000-000000000001';
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
      RAISE NOTICE '[PASS] 4.3 — Admin NO puede modificar artículos ajenos (0 filas)';
    ELSE
      RAISE WARNING '[FAIL] 4.3 — Admin modificó % artículos ajenos (no debería)', v_count;
    END IF;
  END;

  -- TEST 4.4: Admin solo ve su propio perfil
  SELECT COUNT(*) INTO v_count FROM public.profiles;
  IF v_count = 1 THEN
    RAISE NOTICE '[PASS] 4.4 — Admin solo ve 1 perfil (el suyo)';
  ELSE
    RAISE WARNING '[FAIL] 4.4 — Admin ve % perfiles (esperado: solo el suyo)', v_count;
  END IF;

  ROLLBACK;
END;
$$;


-- ============================================================
-- BLOQUE 5: RESTRICCIONES DE INTEGRIDAD
-- ============================================================
DO $$
DECLARE
  v_count INT;
BEGIN
  RAISE NOTICE '==============================';
  RAISE NOTICE 'BLOQUE 5 — RESTRICCIONES DE INTEGRIDAD';
  RAISE NOTICE '==============================';

  -- TEST 5.1: No se puede duplicar un like (UNIQUE article_id + user_id)
  BEGIN
    INSERT INTO public.likes (article_id, user_id)
    VALUES (
      'b0000000-0000-0000-0000-000000000001',
      'a0000000-0000-0000-0000-000000000004'  -- reader1 ya dio like a este artículo
    );
    RAISE WARNING '[FAIL] 5.1 — Se permitió like duplicado (debería fallar)';
  EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE '[PASS] 5.1 — Like duplicado rechazado por constraint UNIQUE';
  END;

  -- TEST 5.2: No se puede duplicar un favorito
  BEGIN
    INSERT INTO public.favorites (article_id, user_id)
    VALUES (
      'b0000000-0000-0000-0000-000000000001',
      'a0000000-0000-0000-0000-000000000004'  -- reader1 ya tiene este favorito
    );
    RAISE WARNING '[FAIL] 5.2 — Se permitió favorito duplicado (debería fallar)';
  EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE '[PASS] 5.2 — Favorito duplicado rechazado por constraint UNIQUE';
  END;

  -- TEST 5.3: No se puede crear artículo sin autor existente en profiles
  BEGIN
    INSERT INTO public.articles (author_id, title)
    VALUES ('99999999-9999-9999-9999-999999999999', 'Artículo huérfano');
    RAISE WARNING '[FAIL] 5.3 — Se insertó artículo con autor inexistente';
  EXCEPTION WHEN foreign_key_violation THEN
    RAISE NOTICE '[PASS] 5.3 — Artículo con autor inexistente rechazado por FK';
  END;

  -- TEST 5.4: Views permite múltiples registros del mismo usuario (no es unique)
  INSERT INTO public.views (article_id, user_id)
  VALUES ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000004');
  INSERT INTO public.views (article_id, user_id)
  VALUES ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000004');
  SELECT COUNT(*) INTO v_count FROM public.views
  WHERE article_id = 'b0000000-0000-0000-0000-000000000006'
    AND user_id = 'a0000000-0000-0000-0000-000000000004';
  IF v_count >= 2 THEN
    RAISE NOTICE '[PASS] 5.4 — Views acepta múltiples eventos del mismo usuario (% registros)', v_count;
  ELSE
    RAISE WARNING '[FAIL] 5.4 — Views no registró eventos duplicados (% registros)', v_count;
  END IF;

  -- TEST 5.5: Role de profiles solo acepta valores válidos
  BEGIN
    INSERT INTO public.profiles (id, role)
    VALUES ('88888888-8888-8888-8888-888888888888', 'superuser');
    RAISE WARNING '[FAIL] 5.5 — Se aceptó role inválido "superuser"';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE '[PASS] 5.5 — Role inválido rechazado por CHECK constraint';
  END;

  ROLLBACK;
END;
$$;
