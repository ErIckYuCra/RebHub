-- ============================================================
-- ReadHub — Datos de prueba (seed.sql)
-- Ejecutar DESPUÉS de las migraciones y policies.sql
--
-- Contraseña de todos los usuarios de prueba: Test1234!
-- ============================================================

-- ============================================================
-- 1. USUARIOS DE PRUEBA (auth.users)
-- El trigger on_auth_user_created crea el perfil automáticamente
-- ============================================================

INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES
  -- Admin
  (
    'a0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@readhub.com',
    crypt('Test1234!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW()
  ),
  -- Writer 1
  (
    'a0000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'writer1@readhub.com',
    crypt('Test1234!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW()
  ),
  -- Writer 2
  (
    'a0000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'writer2@readhub.com',
    crypt('Test1234!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW()
  ),
  -- Reader 1
  (
    'a0000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'reader1@readhub.com',
    crypt('Test1234!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW()
  ),
  -- Reader 2
  (
    'a0000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'reader2@readhub.com',
    crypt('Test1234!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW()
  );

-- ============================================================
-- 2. PERFILES (actualiza los creados por el trigger)
-- ============================================================

UPDATE public.profiles SET
  role       = 'admin',
  phone      = '+51 999 000 001',
  birth_date = '1985-03-15'
WHERE id = 'a0000000-0000-0000-0000-000000000001';

UPDATE public.profiles SET
  role       = 'writer',
  phone      = '+51 999 000 002',
  birth_date = '1990-07-22'
WHERE id = 'a0000000-0000-0000-0000-000000000002';

UPDATE public.profiles SET
  role       = 'writer',
  phone      = '+51 999 000 003',
  birth_date = '1992-11-08'
WHERE id = 'a0000000-0000-0000-0000-000000000003';

UPDATE public.profiles SET
  role       = 'reader',
  phone      = '+51 999 000 004',
  birth_date = '1998-04-30'
WHERE id = 'a0000000-0000-0000-0000-000000000004';

UPDATE public.profiles SET
  role       = 'reader',
  phone      = '+51 999 000 005',
  birth_date = '2000-09-12'
WHERE id = 'a0000000-0000-0000-0000-000000000005';

-- ============================================================
-- 3. ARTÍCULOS
-- ============================================================

INSERT INTO public.articles (id, author_id, title, summary, document_path, image_path, is_public) VALUES
  -- Writer 1 — 3 artículos
  (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000002',
    'Introducción a Next.js 15 y el App Router',
    'Exploramos las novedades del App Router en Next.js 15 y cómo estructurar proyectos escalables.',
    'documents/intro-nextjs-15.pdf',
    'images/intro-nextjs-15.jpg',
    true
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000002',
    'Row Level Security en Supabase: guía práctica',
    'Aprende a implementar políticas RLS para proteger los datos de tu aplicación.',
    'documents/rls-supabase.pdf',
    'images/rls-supabase.jpg',
    true
  ),
  (
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000002',
    'Borrador: Autenticación con Supabase Auth',
    'Artículo en preparación sobre el flujo completo de autenticación.',
    NULL,
    NULL,
    false  -- artículo privado (borrador)
  ),
  -- Writer 2 — 2 artículos
  (
    'b0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000003',
    'TypeScript avanzado: tipos utilitarios que debes conocer',
    'Un repaso por los utility types más usados en proyectos reales con TypeScript.',
    'documents/typescript-utilities.pdf',
    'images/typescript-utilities.jpg',
    true
  ),
  (
    'b0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000003',
    'Tailwind CSS v4: lo que cambió y cómo migrar',
    'Análisis de los cambios de Tailwind v4 y guía de migración desde v3.',
    'documents/tailwind-v4.pdf',
    'images/tailwind-v4.jpg',
    true
  ),
  -- Admin — 1 artículo
  (
    'b0000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000001',
    'Bienvenidos a ReadHub',
    'ReadHub es una plataforma abierta para compartir conocimiento técnico.',
    'documents/bienvenida.pdf',
    'images/bienvenida.jpg',
    true
  );

-- ============================================================
-- 4. VISUALIZACIONES (eventos independientes)
-- ============================================================

INSERT INTO public.views (article_id, user_id, viewed_at) VALUES
  -- Artículo 1: visto por reader1 dos veces y reader2 una vez
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', NOW() - INTERVAL '3 days'),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', NOW() - INTERVAL '1 day'),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', NOW() - INTERVAL '2 days'),
  -- Artículo 2: visto por reader1 y reader2
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004', NOW() - INTERVAL '2 days'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000005', NOW() - INTERVAL '1 day'),
  -- Artículo 4: visto por reader1, reader2 y admin
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004', NOW() - INTERVAL '4 days'),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000005', NOW() - INTERVAL '3 days'),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '1 day'),
  -- Artículo 5: visto por reader1
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004', NOW() - INTERVAL '1 day'),
  -- Artículo 6: visto por reader1 y reader2
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000004', NOW() - INTERVAL '5 days'),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000005', NOW() - INTERVAL '5 days');

-- ============================================================
-- 5. LIKES
-- ============================================================

INSERT INTO public.likes (article_id, user_id) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004'),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005'),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000005'),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004'),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000005'),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000004'),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000005');

-- ============================================================
-- 6. COMENTARIOS
-- ============================================================

INSERT INTO public.comments (article_id, user_id, comment) VALUES
  (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000004',
    'Excelente artículo, me ayudó a entender el App Router mucho mejor.'
  ),
  (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000005',
    '¿Podrías profundizar en el manejo de layouts anidados?'
  ),
  (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Muy buen contenido para empezar con Next.js 15.'
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000004',
    'Las políticas RLS me parecían complicadas, con este artículo quedaron claras.'
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000005',
    'Recomiendo también leer la documentación oficial de Supabase sobre RLS.'
  ),
  (
    'b0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000004',
    'Los tipos utilitarios de TypeScript son fundamentales. Buen resumen.'
  ),
  (
    'b0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    'Faltaría agregar ejemplos de ReturnType y Parameters.'
  ),
  (
    'b0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000005',
    'La migración a v4 fue más sencilla de lo que esperaba. Gracias.'
  ),
  (
    'b0000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000004',
    '¡Felicitaciones por la plataforma!'
  );

-- ============================================================
-- 7. FAVORITOS
-- ============================================================

INSERT INTO public.favorites (article_id, user_id) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004'),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004'),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005'),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000005'),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000005'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001');
